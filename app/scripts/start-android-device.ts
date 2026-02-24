import { spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { pathToFileURL } from 'node:url';
import { runStartupGate, type StartupGateResult } from '../src/runtime/startupGate';
import { runQuickVerification } from './verify-quick';

export type StartAndroidDeviceInput = {
  targetAlias?: string;
  quickCheckBudgetMs?: number;
  launchExpo?: boolean;
  runQuick?: typeof runQuickVerification;
  launch?: () => number;
};

export type StartAndroidDeviceResult = {
  status: 'started' | 'blocked';
  startupGate: StartupGateResult;
  launchExitCode: number | null;
};

function parseArgValue(flag: string): string | undefined {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index < 0) {
    return undefined;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    return undefined;
  }

  return value;
}

function launchExpoAndroidDevice(): number {
  const { CI: _ignoredCi, ...envWithoutCi } = process.env;

  const execution = spawnSync('npx', ['expo', 'start', '--android', '--tunnel', '--port', '8081'], {
    stdio: 'inherit',
    shell: true,
    env: envWithoutCi,
  });
  return execution.status ?? 1;
}

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(400);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

export async function runStartAndroidDevice(
  input: StartAndroidDeviceInput = {},
): Promise<StartAndroidDeviceResult> {
  const runQuick = input.runQuick ?? runQuickVerification;
  const quick = await runQuick({ targetAlias: input.targetAlias, useConfiguredAccountFallback: true });

  const startupGate = await runStartupGate({
    targetAlias: quick.targetAlias,
    quickCheckBudgetMs: input.quickCheckBudgetMs,
    runQuickCheck: async () => quick.quickCheck,
  });

  if (startupGate.status !== 'pass') {
    return {
      status: 'blocked',
      startupGate,
      launchExitCode: null,
    };
  }

  const shouldLaunch = input.launchExpo ?? process.env.NO_EXPO_LAUNCH !== '1';
  if (shouldLaunch && (await isPortInUse(8081))) {
    // eslint-disable-next-line no-console
    console.error('Port 8081 is already in use. Stop the existing Metro process and retry.');
    return {
      status: 'blocked',
      startupGate,
      launchExitCode: 1,
    };
  }

  const launch = input.launch ?? launchExpoAndroidDevice;
  const launchExitCode = shouldLaunch ? launch() : 0;

  return {
    status: launchExitCode === 0 ? 'started' : 'blocked',
    startupGate,
    launchExitCode,
  };
}

async function main() {
  const targetAlias = parseArgValue('--target');
  const result = await runStartAndroidDevice({ targetAlias });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result.startupGate, null, 2));

  if (result.status !== 'started') {
    process.exitCode = 1;
  }
}

const isMainModule = (() => {
  const entryPath = process.argv[1];
  if (!entryPath) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryPath).href;
})();

if (isMainModule) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

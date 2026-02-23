import { deleteApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

export type AdminClient = {
  projectId: string;
  app: App | null;
  auth: Auth | null;
  firestore: Firestore | null;
  authReachable: boolean;
  firestoreReachable: boolean;
  close: () => Promise<void>;
};

function resolveAppName(projectId: string): string {
  return `runnable-${projectId}`;
}

export function createAdminClient(projectId: string): AdminClient {
  const appName = resolveAppName(projectId);

  try {
    const existing = getApps().find((app) => app.name === appName);
    const app = existing ?? initializeApp({ projectId }, appName);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return {
      projectId,
      app,
      auth,
      firestore,
      authReachable: true,
      firestoreReachable: true,
      async close() {
        await deleteApp(app);
      },
    };
  } catch {
    return {
      projectId,
      app: null,
      auth: null,
      firestore: null,
      authReachable: false,
      firestoreReachable: false,
      async close() {
        return;
      },
    };
  }
}

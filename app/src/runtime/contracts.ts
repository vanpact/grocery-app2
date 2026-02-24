export type EnvironmentType = 'nonprod' | 'prod';

export type FirebaseTargetProfile = {
  targetAlias: string;
  firebaseProjectId: string;
  environment: EnvironmentType;
  isDefault: boolean;
  allowDestructiveReset: boolean;
};

export type SetupMode = 'upsert' | 'reset';

export type SetupCommandInput = {
  targetAlias?: string;
  mode?: SetupMode;
  provisionAccounts?: boolean;
  confirmNonDefaultTarget?: string;
  confirmReset?: string;
};

export type SetupCommandResult = {
  status: 'success' | 'failure';
  targetAlias: string;
  mode: SetupMode;
  fixtureUpserts: number;
  fixtureDeletes: number;
  accountsValidated: number;
  accountsCreated: number;
  warnings: string[];
  errors: string[];
};

export type VerificationAccountRequirement = {
  key: string;
  email: string;
  requiredRole: 'suggest' | 'validate';
  requiredHouseholdId: string;
  mustExist: boolean;
};

export type AccountPreparationResult = {
  validated: string[];
  missing: string[];
  created: string[];
  mode: 'validate_only' | 'provision';
};

export type QuickHealthCheckResult = {
  status: 'pass' | 'fail';
  durationMs: number;
  targetAlias: string;
  checks: {
    firebaseConfigValid: boolean;
    firestoreReachable: boolean;
    requiredAccountsReady: boolean;
    membershipFixtureReady: boolean;
  };
  failures: string[];
};

export type VerificationRuleResult = {
  verificationId: string;
  status: 'pass' | 'fail';
  evidenceRefs: string[];
  notes?: string;
};

export type VerificationRunResult = {
  status: 'passed' | 'failed' | 'interrupted';
  startedAtUtc: string;
  completedAtUtc: string;
  targetAlias: string;
  results: VerificationRuleResult[];
  evidenceBundlePath: string;
};

export type ReleaseReadinessScope = 'committed' | 'committed_plus_optional';

export type ReleaseReadinessSource = 'ci_authoritative' | 'local_preview';

export type ReleaseReadinessStatus = 'ready' | 'not_ready';

export type ReleaseVerificationOutcomeStatus = 'pass' | 'fail' | 'missing' | 'invalid' | 'duplicated';

export type ReleaseVerificationOutcome = {
  releaseId: string;
  verificationId: string;
  status: ReleaseVerificationOutcomeStatus;
  evidenceRefs: string[];
  deterministic: boolean;
  notes?: string;
};

export type ReleaseFieldTestStatus = 'pass' | 'fail' | 'missing' | 'duplicated';

export type ReleaseFieldTestCoverageRecord = {
  releaseId: string;
  scenarioId: string;
  status: ReleaseFieldTestStatus;
  evidenceRef: string | null;
};

export type ReleaseReadinessOutput = {
  status: ReleaseReadinessStatus;
  releaseId: string;
  source: ReleaseReadinessSource;
  scope: ReleaseReadinessScope;
  failingVerificationIds: string[];
  missingArtifacts: string[];
  approvalIssues: string[];
  fieldTestCoverageIssues: string[];
  followUpActions: string[];
};

export type CiGateInput = {
  releaseId: string;
  readinessReportPath: string;
  publicationTarget: string;
};

export type CiGateDecision = {
  status: 'allow_publication' | 'block_publication';
  reasonCodes: string[];
};

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

export type QuickWinsOperationStatus = 'applied' | 'cancelled' | 'rejected';

export type QuickWinsProjectionResolution = 'insert' | 'merge';

export type QuickWinsTimingMode = 'baseline' | 'quick';

export type QuickWinsTimingRun = {
  runId: string;
  mode: QuickWinsTimingMode;
  durationMs: number;
  scenarioId: string;
};

export type QuickWinsTimingReport = {
  releaseId: string;
  gateId: string;
  bundleId: string;
  verificationId: 'VR-CND-101-BULK-ADD-TIME';
  status: 'pass' | 'fail';
  baselineMedianMs: number;
  quickMedianMs: number;
  improvementPct: number;
  runCountBaseline: number;
  runCountQuick: number;
  reasonCodes: string[];
};

export type CommittedDestination = 'sign-in' | 'active-shopping' | 'overview' | 'settings';

export type RefreshedDestination = CommittedDestination;

export type RefreshedPlatform = 'web' | 'android';

export type ViewportBand = '<600' | '600-839' | '840-1199' | '>=1200';

export type NavigationPattern = 'top-wrapped' | 'top-single-row';

export type LayoutMode = 'single-pane' | 'two-pane';

export type SecondaryPaneMode = 'context-only' | 'n/a';

export type FeedbackState = 'empty' | 'loading' | 'error' | 'offline' | 'membership-required' | 'reconnecting';

export type RecoveryAction = 'retry' | 'continue' | 'retry_connection' | 'retry_membership' | 'sign_out';

export type RecoveryActionContract = {
  error: ['retry'];
  offline: ['continue', 'retry_connection'];
  'membership-required': ['retry_membership', 'sign_out'];
};

export type ScreenUsabilitySnapshot = {
  destination: CommittedDestination;
  state: FeedbackState;
  primaryActions: string[];
  recoveryActions: RecoveryAction[];
  hasSilentFailure: boolean;
  viewportWidth: number;
  viewportBand: ViewportBand;
  layoutMode: LayoutMode;
  navigationPattern: NavigationPattern;
  secondaryPaneMode: SecondaryPaneMode;
};

export type UiUsabilityTaskRun = {
  runId: string;
  platform: RefreshedPlatform;
  inputMode: 'touch' | 'keyboard' | 'pointer';
  flow: 'core-add-validate';
  durationSeconds: number;
  completed: boolean;
  deterministic: boolean;
};

export type UiPrimaryActionRecognitionRun = {
  participantId: string;
  platform: RefreshedPlatform;
  screenId: RefreshedDestination;
  secondsToPrimaryAction: number;
  recognizedOnFirstAttempt: boolean;
};

export type UiMistapControlEvent = {
  controlId: string;
  platform: RefreshedPlatform;
  attempts: number;
  mistaps: number;
};

export type UiClarityFeedbackResponse = {
  sessionId: string;
  platform: RefreshedPlatform;
  navigationClarityScore: number;
  actionHierarchyScore: number;
};

export type UiResponsiveLayoutCheck = {
  screenId: RefreshedDestination;
  viewportBand: ViewportBand;
  passed: boolean;
};

export type UiInputParityCheck = {
  scenarioId: string;
  passed: boolean;
};

export type UiAccessibilityCheck = {
  screenId: RefreshedDestination;
  platform: RefreshedPlatform;
  focusVisibilityPass: boolean;
  keyboardTraversalPass: boolean | 'n/a';
  textScalingPass: boolean;
  touchTargetPass: boolean;
  finalStatus: 'pass' | 'fail';
};

export type UiEvidenceTool = 'playwright' | 'mobile-mcp';

export type UiToolArtifact = {
  releaseId: string;
  tool: UiEvidenceTool;
  platform: RefreshedPlatform;
  screenId: RefreshedDestination;
  scenarioId: string;
  artifactPath: string;
  status: 'captured' | 'missing';
};

export type UiBeforeAfterPair = {
  releaseId: string;
  screenId: RefreshedDestination;
  platform: RefreshedPlatform;
  beforeArtifactPath: string;
  afterArtifactPath: string;
  status: 'paired' | 'missing';
};

export type UiUsabilityEvidenceInput = {
  releaseId: string;
  baselineTaskRuns: UiUsabilityTaskRun[];
  refreshedTaskRuns: UiUsabilityTaskRun[];
  actionRecognitionRuns: UiPrimaryActionRecognitionRun[];
  mistapEvents: UiMistapControlEvent[];
  clarityFeedback: UiClarityFeedbackResponse[];
  responsiveLayoutChecks: UiResponsiveLayoutCheck[];
  inputParityChecks: UiInputParityCheck[];
  accessibilityChecks: UiAccessibilityCheck[];
  toolArtifacts: UiToolArtifact[];
  beforeAfterPairs: UiBeforeAfterPair[];
};

export type UiUsabilityEvaluation = {
  releaseId: string;
  totalRecognitionRuns: number;
  recognizedWithin5sPct: number;
  baselineMedianSeconds: number;
  refreshedMedianSeconds: number;
  improvementPct: number;
  mistapRatePct: number;
  clarityAverage: number;
  responsivePassRatePct: number;
  parityPassRatePct: number;
  accessibilityPassRatePct: number;
  successCriteria: {
    sc001: 'pass' | 'fail';
    sc002: 'pass' | 'fail';
    sc003: 'pass' | 'fail';
    sc004: 'pass' | 'fail';
    sc005: 'pass' | 'fail';
    sc006: 'pass' | 'fail';
    sc007: 'pass' | 'fail';
  };
  missingArtifacts: string[];
  finalStatus: 'ready' | 'not_ready';
  reasonCodes: string[];
};

export type UiUsabilitySummaryReport = {
  releaseId: string;
  successCriteria: UiUsabilityEvaluation['successCriteria'];
  metrics: {
    totalRecognitionRuns: number;
    recognizedWithin5sPct: number;
    baselineMedianSeconds: number;
    refreshedMedianSeconds: number;
    improvementPct: number;
    mistapRatePct: number;
    clarityAverage: number;
    responsivePassRatePct: number;
    parityPassRatePct: number;
    accessibilityPassRatePct: number;
  };
  missingArtifacts: string[];
  finalStatus: 'ready' | 'not_ready';
  reasonCodes: string[];
};

# Data Model: Cross-Platform UX/UI Refresh

## Entity: RefreshedScreenSurface

- **Primary Key**: `screenId + platform`
- **Fields**:
  - `screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings'`
  - `platform: 'web' | 'android'`
  - `navigationPattern: 'top-wrapped' | 'top-single-row'`
  - `primaryActionIds: string[]`
  - `secondaryActionIds: string[]`
  - `statusMessageIds: string[]`
- **Validation Rules**:
  - All four committed `screenId` values must exist on both `web` and `android`.
  - `primaryActionIds` must contain exactly one dominant primary action per task block.
  - `navigationPattern` must be `top-wrapped` for `<600`.

## Entity: DesktopWorkspacePolicy

- **Primary Key**: `screenId + viewportBand`
- **Fields**:
  - `screenId: 'active-shopping' | 'overview' | 'settings' | 'sign-in'`
  - `viewportBand: '<600' | '600-839' | '840-1199' | '>=1200'`
  - `layoutMode: 'single-pane' | 'two-pane'`
  - `secondaryPaneMode: 'context-only' | 'n/a'`
  - `stateChangingControlsInPrimaryPane: boolean`
- **Validation Rules**:
  - At `>=1200`, `layoutMode` must be `two-pane`.
  - At `>=1200`, `secondaryPaneMode` must be `context-only`.
  - `stateChangingControlsInPrimaryPane` must be `true` for every `>=1200` record.

## Entity: ActionHierarchyGroup

- **Primary Key**: `screenId + groupId`
- **Fields**:
  - `screenId: string`
  - `groupId: string`
  - `primaryActionId: string`
  - `secondaryActionIds: string[]`
  - `destructiveActionIds: string[]`
  - `copyUniquenessStatus: 'pass' | 'fail'`
- **Validation Rules**:
  - `primaryActionId` must be distinct from secondary/destructive actions.
  - `copyUniquenessStatus` must be `pass` to prevent overlapping/ambiguous labels.

## Entity: AccessibilityVerificationRecord

- **Primary Key**: `releaseId + screenId + platform + runId`
- **Fields**:
  - `releaseId: string`
  - `screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings'`
  - `platform: 'web' | 'android'`
  - `runId: string`
  - `focusVisibilityPass: boolean`
  - `keyboardTraversalPass: boolean | 'n/a'`
  - `textScalingPass: boolean`
  - `touchTargetPass: boolean`
  - `finalStatus: 'pass' | 'fail'`
- **Validation Rules**:
  - `keyboardTraversalPass` must be boolean on `web` and `n/a` or boolean on `android`.
  - `finalStatus` is `pass` only when all applicable checks pass.
  - SC-007 pass requires all committed `screenId` records to have `finalStatus = pass`.

## Entity: UiToolEvidenceArtifact

- **Primary Key**: `releaseId + tool + scenarioId + artifactId`
- **Fields**:
  - `releaseId: string`
  - `tool: 'playwright' | 'mobile-mcp'`
  - `platform: 'web' | 'android'`
  - `scenarioId: string`
  - `artifactId: string`
  - `artifactPath: string`
  - `captureStatus: 'captured' | 'missing'`
- **Validation Rules**:
  - `tool = playwright` must map only to `platform = web`.
  - `tool = mobile-mcp` must map only to `platform = android`.
  - Each committed screen must have evidence artifacts from both tools in the release set.

## Entity: CoreFlowTimingSummary

- **Primary Key**: `releaseId`
- **Fields**:
  - `releaseId: string`
  - `baselineMedianSeconds: number`
  - `refreshedMedianSeconds: number`
  - `improvementPct: number`
  - `sc002Status: 'pass' | 'fail'`
- **Validation Rules**:
  - `improvementPct = ((baselineMedianSeconds - refreshedMedianSeconds) / baselineMedianSeconds) * 100`
  - `sc002Status = pass` only when `improvementPct >= 25`.

## Relationships

- `RefreshedScreenSurface` 1:N `ActionHierarchyGroup`
- `RefreshedScreenSurface` 1:N `DesktopWorkspacePolicy`
- `RefreshedScreenSurface` 1:N `AccessibilityVerificationRecord`
- `UiToolEvidenceArtifact` references `RefreshedScreenSurface` by `scenarioId/screenId`
- `AccessibilityVerificationRecord` and `CoreFlowTimingSummary` both feed release usability evaluation

## State Transitions

### UiToolEvidenceArtifact

- `missing -> captured`
- `captured -> missing` (invalid regression state requiring remediation)

### AccessibilityVerificationRecord

- `fail -> pass` (after accessibility remediation and rerun)
- `pass -> fail` (regression detected in rerun)

### CoreFlowTimingSummary

- `fail -> pass` (after UX improvement iteration and rerun)
- `pass -> fail` (performance regression in later rerun)

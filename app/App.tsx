import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, useWindowDimensions } from 'react-native';
import {
  Appbar,
  Banner,
  Button,
  Card,
  List,
  Paragraph,
  Provider as PaperProvider,
  Text,
  TextInput,
  Title,
} from 'react-native-paper';
import { addItemWithDedup } from './src/items/itemWriteService';
import { bootstrapApp } from './src/runtime/bootstrapApp';
import { type CommittedDestination, type RecoveryAction } from './src/runtime/contracts';
import { type Item } from './src/types';
import { getDesktopWorkspace } from './src/ui/layout/DesktopWorkspace';
import { buildActiveShoppingScreenModel } from './src/ui/screens/ActiveShoppingScreen';
import {
  buildCommittedScreenModel,
  getCommittedDestinationModels,
  type CommittedDestinationModel,
} from './src/ui/screens/CommittedScreens';

type AppRuntimeState = {
  status: 'loading' | 'ready' | 'blocked';
  reason: 'startup_gate_failed' | 'membership_required' | 'generic';
  message: string;
  householdId: string | null;
  targetAlias: string | null;
  blockedReasons: string[];
  recoveryActions: RecoveryAction[];
};

type AppRoute = {
  destination: CommittedDestination;
  label: string;
};

const SAMPLE_ITEMS: Item[] = [
  {
    itemId: 'item-1',
    householdId: 'hh-default',
    listId: 'list-alpha-weekly',
    name: 'Milk',
    nameSlug: 'milk',
    aisleKey: 'dairy',
    status: 'validated',
    qty: 2,
    unit: 'L',
    version: 1,
  },
  {
    itemId: 'item-2',
    householdId: 'hh-default',
    listId: 'list-alpha-weekly',
    name: 'Bananas',
    nameSlug: 'bananas',
    aisleKey: 'produce',
    status: 'validated',
    qty: 6,
    unit: null,
    version: 1,
  },
  {
    itemId: 'item-3',
    householdId: 'hh-default',
    listId: 'list-alpha-weekly',
    name: 'Coffee',
    nameSlug: 'coffee',
    aisleKey: 'beverages',
    status: 'draft',
    qty: 1,
    unit: 'bag',
    version: 1,
  },
];

function toRouteModels(destinations: CommittedDestinationModel[]): AppRoute[] {
  return destinations.map((destination) => ({
    destination: destination.destination,
    label: destination.title,
  }));
}

function getRuntimeFeedbackState(runtime: AppRuntimeState): 'loading' | 'error' | 'membership-required' | 'empty' {
  if (runtime.status === 'loading') {
    return 'loading';
  }

  if (runtime.status === 'blocked' && runtime.reason === 'membership_required') {
    return 'membership-required';
  }

  return runtime.status === 'blocked' ? 'error' : 'empty';
}

function actionLabel(action: RecoveryAction): string {
  if (action === 'continue') {
    return 'Continue in offline mode';
  }

  if (action === 'retry_connection') {
    return 'Retry sync connection';
  }

  if (action === 'retry') {
    return 'Retry';
  }

  if (action === 'retry_membership') {
    return 'Retry membership lookup';
  }

  return 'Sign out of household';
}

export default function App() {
  const { width } = useWindowDimensions();
  const [runtime, setRuntime] = useState<AppRuntimeState>({
    status: 'loading',
    reason: 'generic',
    message: 'Starting runtime checks...',
    householdId: null,
    targetAlias: null,
    blockedReasons: [],
    recoveryActions: [],
  });
  const [items, setItems] = useState<Item[]>(SAMPLE_ITEMS);
  const [newItemName, setNewItemName] = useState('');
  const [uiMessage, setUiMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const routes = useMemo(() => toRouteModels(getCommittedDestinationModels()), []);
  const [activeRoute, setActiveRoute] = useState<CommittedDestination>('active-shopping');

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const result = await bootstrapApp({
        userId: 'local-reviewer',
        resolveMembership: async () => ({ householdId: 'hh-default', role: 'validate' }),
        startupGate: async () => ({
          status: 'pass',
          targetAlias: 'default',
          blockedReasons: [],
          quickCheckBudgetMs: 120_000,
          quickCheck: {
            status: 'pass',
            durationMs: 1500,
            targetAlias: 'default',
            checks: {
              firebaseConfigValid: true,
              firestoreReachable: true,
              requiredAccountsReady: true,
              membershipFixtureReady: true,
            },
            failures: [],
          },
        }),
      });

      if (cancelled) {
        return;
      }

      if (result.status !== 'ready' || !result.session) {
        setRuntime({
          status: 'blocked',
          reason: result.reason === 'membership_required' ? 'membership_required' : 'startup_gate_failed',
          message: 'Startup blocked. Complete quick-check failures before continuing.',
          householdId: null,
          targetAlias: result.startupGate.targetAlias,
          blockedReasons: [...result.startupGate.blockedReasons],
          recoveryActions: [...result.recoveryActions],
        });
        return;
      }

      setRuntime({
        status: 'ready',
        reason: 'generic',
        message: 'Runtime checks passed. Active shopping is ready.',
        householdId: result.session.householdId,
        targetAlias: result.startupGate.targetAlias,
        blockedReasons: [],
        recoveryActions: [],
      });
    };

    start().catch(() => {
      if (cancelled) {
        return;
      }

      setRuntime({
        status: 'blocked',
        reason: 'generic',
        message: 'Startup failed unexpectedly.',
        householdId: null,
        targetAlias: null,
        blockedReasons: [],
        recoveryActions: ['retry'],
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const feedbackState = getRuntimeFeedbackState(runtime);
  const destinationModel = useMemo(
    () =>
      buildCommittedScreenModel({
        destination: activeRoute,
        selectedDestination: activeRoute,
        state: feedbackState,
        viewportWidth: width,
      }),
    [activeRoute, feedbackState, width],
  );
  const desktopWorkspace = useMemo(() => getDesktopWorkspace(width), [width]);

  const activeShoppingModel = useMemo(
    () =>
      buildActiveShoppingScreenModel(items, isOffline || runtime.status !== 'ready', {
        membershipRequired: runtime.reason === 'membership_required',
        isReconnecting,
      }),
    [isOffline, isReconnecting, items, runtime.reason, runtime.status],
  );

  const validatedCount = items.filter((item) => item.status === 'validated').length;
  const draftCount = items.filter((item) => item.status === 'draft').length;

  const subtitle =
    runtime.targetAlias && runtime.householdId
      ? `Target ${runtime.targetAlias} | Household ${runtime.householdId}`
      : runtime.targetAlias
        ? `Target ${runtime.targetAlias}`
        : 'Runtime bootstrap';

  function handleRecoveryAction(action: RecoveryAction) {
    if (action === 'continue') {
      setIsOffline(true);
      setUiMessage('Offline mode enabled.');
      return;
    }

    if (action === 'retry_connection') {
      handleRetryConnection();
      return;
    }

    if (action === 'sign_out') {
      setRuntime({
        status: 'blocked',
        reason: 'membership_required',
        message: 'Signed out. Sign in to continue.',
        householdId: null,
        targetAlias: runtime.targetAlias,
        blockedReasons: [],
        recoveryActions: ['retry_membership', 'sign_out'],
      });
      setActiveRoute('sign-in');
      setUiMessage('Signed out.');
      return;
    }

    setRuntime((previous) => ({
      ...previous,
      status: 'ready',
      reason: 'generic',
      message: 'Runtime checks passed. Active shopping is ready.',
      householdId: previous.householdId ?? 'hh-default',
      blockedReasons: [],
      recoveryActions: [],
    }));
    setActiveRoute('active-shopping');
    setUiMessage(action === 'retry' ? 'Startup retry completed.' : 'Membership retry completed.');
  }

  function handleAddItem() {
    const trimmed = newItemName.trim();
    if (trimmed.length === 0) {
      setUiMessage('Enter an item name first.');
      return;
    }

    const result = addItemWithDedup(
      {
        householdId: runtime.householdId ?? 'hh-default',
        listId: 'list-alpha-weekly',
        name: trimmed,
        aisleKey: null,
        qty: 1,
      },
      items,
    );

    setItems(result.items);
    setNewItemName('');
    setUiMessage(result.action === 'add' ? `Added ${result.item.name}.` : `Merged quantity for ${result.item.name}.`);
  }

  function handleValidateNextDraft() {
    const nextDraft = items.find((item) => item.status === 'draft');
    if (!nextDraft) {
      setUiMessage('No draft item available to validate.');
      return;
    }

    setItems((previous) =>
      previous.map((item) =>
        item.itemId === nextDraft.itemId
          ? {
              ...item,
              status: 'validated',
              version: item.version + 1,
            }
          : item,
      ),
    );
    setUiMessage(`Validated ${nextDraft.name}.`);
  }

  function handleRetryConnection() {
    setIsReconnecting(true);
    setUiMessage('Retrying connection...');
    setTimeout(() => {
      setIsOffline(false);
      setIsReconnecting(false);
      setUiMessage('Connection restored.');
    }, 600);
  }

  function handleReviewProgress() {
    setUiMessage(`Overview refreshed. ${validatedCount} validated, ${draftCount} draft.`);
  }

  function handleManageAccount() {
    setUiMessage('Account management opened.');
  }

  function renderRouteContent() {
    if (activeRoute === 'sign-in') {
      return (
        <Card>
          <Card.Content>
            <Title>Sign In</Title>
            <Paragraph>Resume household shopping access.</Paragraph>
            <View style={{ gap: 8 }}>
              <Button mode="contained" onPress={() => handleRecoveryAction('retry_membership')}>
                Sign in
              </Button>
              <Button mode="outlined" onPress={() => handleRecoveryAction('retry_membership')}>
                Retry membership lookup
              </Button>
              <Button mode="contained-tonal" onPress={() => handleRecoveryAction('sign_out')}>
                Sign out of household
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }

    if (activeRoute === 'overview') {
      return (
        <Card>
          <Card.Content>
            <Title>Overview</Title>
            <Paragraph>{`Validated items: ${validatedCount}`}</Paragraph>
            <Paragraph>{`Draft items: ${draftCount}`}</Paragraph>
            <Button mode="outlined" onPress={handleReviewProgress}>
              Review current progress
            </Button>
            <Button mode="contained" onPress={() => setActiveRoute('active-shopping')}>
              Open active shopping workspace
            </Button>
          </Card.Content>
        </Card>
      );
    }

    if (activeRoute === 'settings') {
      return (
        <Card>
          <Card.Content>
            <Title>Settings</Title>
            <Paragraph>Session and recovery controls.</Paragraph>
            <View style={{ gap: 8 }}>
              <Button mode="outlined" onPress={handleManageAccount}>
                Manage account settings
              </Button>
              <Button mode="outlined" onPress={() => handleRecoveryAction('retry')}>
                Retry startup checks
              </Button>
              <Button mode="outlined" onPress={() => handleRecoveryAction('retry_membership')}>
                Retry membership lookup
              </Button>
              <Button mode="contained-tonal" onPress={() => handleRecoveryAction('sign_out')}>
                Sign out of household
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }

    const primaryPane = (
      <Card>
        <Card.Content>
          <Title>Active Shopping</Title>
          <Paragraph>{`Validated items: ${validatedCount}`}</Paragraph>
          <Paragraph>{`Draft items: ${draftCount}`}</Paragraph>
          <Paragraph>{activeShoppingModel.listStateMessage}</Paragraph>
          {activeShoppingModel.offlineIndicator ? <Paragraph>{activeShoppingModel.offlineIndicator}</Paragraph> : null}
          {activeShoppingModel.recoveryStates.map((state) => (
            <View key={state.state} style={{ gap: 8 }}>
              <Paragraph>{`${state.state}: ${state.actions.join(', ')}`}</Paragraph>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {state.actions.map((action) => (
                  <Button key={`${state.state}-${action}`} mode="outlined" onPress={() => handleRecoveryAction(action)}>
                    {actionLabel(action)}
                  </Button>
                ))}
              </View>
            </View>
          ))}
          <View style={{ gap: 8 }}>
            <TextInput
              mode="outlined"
              label="Item name"
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Add item"
            />
            <Button mode="contained" onPress={handleAddItem}>
              Add item to list
            </Button>
            <Button mode="outlined" onPress={handleValidateNextDraft}>
              Validate next item
            </Button>
            <Button mode="outlined" onPress={() => setIsOffline(true)}>
              Continue in offline mode
            </Button>
            <Button mode="outlined" onPress={handleRetryConnection}>
              Retry sync connection
            </Button>
          </View>
        </Card.Content>
        {activeShoppingModel.listRows.map((row) => (
          <List.Item
            key={row.itemId}
            title={row.label}
            description={row.quantityBadge}
            left={(props) => <List.Icon {...props} icon="cart-outline" />}
          />
        ))}
      </Card>
    );

    if (desktopWorkspace.mode !== 'two-pane') {
      return primaryPane;
    }

    return (
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 2 }}>{primaryPane}</View>
        <View style={{ flex: 1 }}>
          <Card>
            <Card.Content>
              <Title>Context</Title>
              <Paragraph>Secondary pane is context-only.</Paragraph>
              <Paragraph>{`List state: ${activeShoppingModel.listPresentationState}`}</Paragraph>
              <Paragraph>{`Replay status: ${activeShoppingModel.reconnectingIndicator ?? 'Idle'}`}</Paragraph>
              <Paragraph>{`Last refresh: ${activeShoppingModel.lastReplayRefreshAtUtc ?? 'Not available'}`}</Paragraph>
            </Card.Content>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.Content title="Grocery App" subtitle={subtitle} />
        </Appbar.Header>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: destinationModel.navigationWraps ? 'wrap' : 'nowrap',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          {routes.map((route) => (
            <Button
              key={route.destination}
              mode={route.destination === activeRoute ? 'contained' : 'outlined'}
              onPress={() => setActiveRoute(route.destination)}
              accessibilityLabel={`${route.label} navigation destination`}
              style={{ minHeight: 44 }}
            >
              {route.label}
            </Button>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Card>
            <Card.Content>
              <Title>Startup Status</Title>
              <Paragraph>{runtime.message}</Paragraph>
              <Paragraph>{`Screen: ${destinationModel.title}`}</Paragraph>
              <Paragraph>{destinationModel.selectedStateLabel}</Paragraph>
              <Paragraph>{`Navigation pattern: ${destinationModel.navigationPattern}`}</Paragraph>
              <Paragraph>{`Layout mode: ${destinationModel.layoutMode}`}</Paragraph>
              {runtime.blockedReasons.length > 0 ? (
                <Paragraph>{`Blocked reasons: ${runtime.blockedReasons.join(', ')}`}</Paragraph>
              ) : null}
              {uiMessage ? <Text>{uiMessage}</Text> : null}
            </Card.Content>
          </Card>

          {runtime.status === 'blocked' ? (
            <Banner
              visible
              icon="alert-circle-outline"
              actions={runtime.recoveryActions.map((action) => ({
                label: actionLabel(action),
                onPress: () => handleRecoveryAction(action),
              }))}
            >
              {destinationModel.feedback.message}
            </Banner>
          ) : null}

          {renderRouteContent()}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { Appbar, Banner, Card, List, Paragraph, Provider as PaperProvider, Text, Title } from 'react-native-paper';
import { bootstrapApp } from './src/runtime/bootstrapApp';
import { buildActiveShoppingScreenModel } from './src/ui/screens/ActiveShoppingScreen';
import { type Item } from './src/types';

type AppRuntimeState = {
  status: 'loading' | 'ready' | 'blocked';
  message: string;
  householdId: string | null;
  targetAlias: string | null;
  blockedReasons: string[];
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

export default function App() {
  const [runtime, setRuntime] = useState<AppRuntimeState>({
    status: 'loading',
    message: 'Starting runtime checks...',
    householdId: null,
    targetAlias: null,
    blockedReasons: [],
  });

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
          message: 'Startup blocked. Complete quick-check failures before continuing.',
          householdId: null,
          targetAlias: result.startupGate.targetAlias,
          blockedReasons: [...result.startupGate.blockedReasons],
        });
        return;
      }

      setRuntime({
        status: 'ready',
        message: 'Runtime checks passed. Active shopping is ready.',
        householdId: result.session.householdId,
        targetAlias: result.startupGate.targetAlias,
        blockedReasons: [],
      });
    };

    start().catch(() => {
      if (cancelled) {
        return;
      }
      setRuntime({
        status: 'blocked',
        message: 'Startup failed unexpectedly.',
        householdId: null,
        targetAlias: null,
        blockedReasons: [],
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const model = useMemo(
    () => buildActiveShoppingScreenModel(SAMPLE_ITEMS, runtime.status !== 'ready'),
    [runtime.status],
  );

  const subtitle = runtime.targetAlias && runtime.householdId
    ? `Target ${runtime.targetAlias} | Household ${runtime.householdId}`
    : runtime.targetAlias
      ? `Target ${runtime.targetAlias}`
      : 'Runtime bootstrap';

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.Content title="Grocery App" subtitle={subtitle} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Card>
            <Card.Content>
              <Title>Startup Status</Title>
              <Paragraph>{runtime.message}</Paragraph>
              {runtime.blockedReasons.length > 0 ? (
                <Paragraph>{`Blocked reasons: ${runtime.blockedReasons.join(', ')}`}</Paragraph>
              ) : null}
            </Card.Content>
          </Card>

          {runtime.status === 'blocked' ? (
            <Banner visible icon="alert-circle-outline">
              Startup checks failed. Resolve the issue and restart.
            </Banner>
          ) : null}

          <Card>
            <Card.Content>
              <Title>Active Shopping</Title>
              {model.offlineIndicator ? <Paragraph>{model.offlineIndicator}</Paragraph> : null}
            </Card.Content>
            {model.validatedItems.map((item) => (
              <List.Item
                key={item.itemId}
                title={item.name}
                description={item.qty ? `${item.qty}${item.unit ? ` ${item.unit}` : ''}` : 'No quantity'}
                left={(props) => <List.Icon {...props} icon="cart-outline" />}
              />
            ))}
            {model.validatedItems.length === 0 ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text>No validated items yet.</Text>
              </View>
            ) : null}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

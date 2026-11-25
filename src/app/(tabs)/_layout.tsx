import { Redirect, Tabs } from 'expo-router';

import { BottomTabBar, type TabKey } from '@/components/BottomTabBar';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const ROUTE_TO_TAB: Record<string, TabKey> = { index: 'home', search: 'search', vault: 'vault', settings: 'settings' };
const TAB_TO_ROUTE: Record<TabKey, string> = { home: 'index', search: 'search', vault: 'vault', settings: 'settings' };

export default function TabsLayout() {
  const { ready, settings } = useAppDeck();
  if (ready && !settings.firstRunCompleted) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'none', sceneStyle: { backgroundColor: 'transparent' } }}
      tabBar={({ state, navigateToTab }) => (
        <BottomTabBar
          active={ROUTE_TO_TAB[state.routes[state.index].name] ?? 'home'}
          onSelect={(key) => {
            const route = state.routes.find((r) => r.name === TAB_TO_ROUTE[key]);
            if (route) navigateToTab(route.key);
          }}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="vault" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

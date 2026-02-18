import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';
import TabBar from '@/components/shared/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="new-pact" />
      <Tabs.Screen name="streaks" />
      <Tabs.Screen name="camera" />
    </Tabs>
  );
}

import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MiniPlayer } from '@/components/MiniPlayer';
import { NightPalette, FONT } from '@/constants/theme';

const TAB_BAR_HEIGHT = 88;

type IconName = 'home' | 'methods' | 'listen' | 'tools';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  const common = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {name === 'home' && <Path d="M4 11l8-6 8 6M6 10v9h12v-9" {...common} />}
      {name === 'methods' && (
        <>
          <Path d="M5 4h9a2 2 0 0 1 2 2v13H7a2 2 0 0 0-2 2V4z" {...common} />
          <Path d="M9 8h5M9 11h5" {...common} />
        </>
      )}
      {name === 'listen' && (
        <>
          <Path d="M5 14v-2a7 7 0 0 1 14 0v2" {...common} />
          <Path d="M5 14h2v4H6a1 1 0 0 1-1-1v-3zM19 14h-2v4h1a1 1 0 0 0 1-1v-3z" {...common} />
        </>
      )}
      {name === 'tools' && (
        <>
          <Circle cx={7} cy={7} r={2.5} {...common} />
          <Circle cx={17} cy={7} r={2.5} {...common} />
          <Circle cx={7} cy={17} r={2.5} {...common} />
          <Circle cx={17} cy={17} r={2.5} {...common} />
        </>
      )}
    </Svg>
  );
}

export default function TabsLayout() {
  const { t, isRTL } = useLocale();
  const { accent } = useTheme();

  const screens: { name: string; title: string; icon: IconName }[] = [
    { name: 'index', title: t('tabHome'), icon: 'home' },
    { name: 'methods', title: t('tabMethods'), icon: 'methods' },
    { name: 'listen', title: t('tabListen'), icon: 'listen' },
    { name: 'tools', title: t('tabTools'), icon: 'tools' },
  ];
  // In Arabic the whole bar reads right-to-left, so Home should sit on the
  // right. React Navigation lays tabs out in declaration order, so reverse it.
  const ordered = isRTL ? [...screens].reverse() : screens;

  return (
    <View style={styles.fill}>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: NightPalette.dimText,
          tabBarStyle: {
            backgroundColor: '#150A05',
            borderTopColor: 'rgba(140,42,18,0.25)',
            borderTopWidth: 1,
            height: TAB_BAR_HEIGHT,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontFamily: FONT.medium, fontSize: 11, marginTop: 2 },
        }}
      >
        {ordered.map((s) => (
          <Tabs.Screen
            key={s.name}
            name={s.name}
            options={{ title: s.title, tabBarIcon: ({ color }) => <TabIcon name={s.icon} color={color} /> }}
          />
        ))}
      </Tabs>
      <MiniPlayer bottom={TAB_BAR_HEIGHT + 10} />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

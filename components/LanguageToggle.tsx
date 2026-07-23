import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocale } from '@/contexts/LocaleContext';
import { NightPalette, FONT } from '@/constants/theme';

/** A compact EN / ع segmented switch. Persists via LocaleContext. */
export function LanguageToggle() {
  const { lang, setLang } = useLocale();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setLang('en')}
        hitSlop={8}
        style={[styles.segment, lang === 'en' && styles.active]}
      >
        <Text style={[styles.label, lang === 'en' && styles.activeLabel]}>EN</Text>
      </Pressable>
      <Pressable
        onPress={() => setLang('ar')}
        hitSlop={8}
        style={[styles.segment, lang === 'ar' && styles.active]}
      >
        <Text style={[styles.label, lang === 'ar' && styles.activeLabel]}>ع</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
    overflow: 'hidden',
    backgroundColor: 'rgba(36,17,9,0.5)',
  },
  segment: { paddingHorizontal: 14, paddingVertical: 6, minWidth: 40, alignItems: 'center' },
  active: { backgroundColor: NightPalette.amber },
  label: { color: NightPalette.dimText, fontSize: 13, fontFamily: FONT.bold },
  activeLabel: { color: NightPalette.voidBlack },
});

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useLocale } from '@/contexts/LocaleContext';
import { NightPalette, FONT } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScienceNoteProps {
  /** The mechanism — already resolved to the active language. */
  science: string;
  /** The named technique or study it draws on — already resolved. */
  basis: string;
}

/**
 * A collapsed "why this works" strip. Tapping reveals the mechanism and the
 * honest evidence basis. Keeps the science one tap away without cluttering
 * the calm, dim wind-down surface. RTL-aware.
 */
export function ScienceNote({ science, basis }: ScienceNoteProps) {
  const { t, isRTL } = useLocale();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={toggle} hitSlop={8} style={[styles.header, isRTL && styles.headerRTL]}>
        <Text style={styles.label}>{t('whyThisWorks')}</Text>
        <Text style={styles.chevron}>{open ? '−' : '+'}</Text>
      </Pressable>
      {open && (
        <View style={styles.body}>
          <Text style={[styles.science, isRTL && styles.textRTL]}>{science}</Text>
          <Text style={[styles.basis, isRTL && styles.textRTL]}>{basis}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140,42,18,0.2)',
    paddingTop: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRTL: { flexDirection: 'row-reverse' },
  label: { color: NightPalette.amber, fontSize: 11, textTransform: 'uppercase' },
  chevron: { color: NightPalette.amber, fontSize: 16, fontFamily: FONT.regular },
  body: { marginTop: 10 },
  science: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20 },
  basis: {
    color: NightPalette.dimText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    fontStyle: 'italic',
  },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});

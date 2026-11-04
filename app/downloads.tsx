import { useState } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDownloads, useDownloadedTracks } from '@/contexts/DownloadsContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { SoundArt } from '@/components/SoundArt';
import { NightPalette, FONT } from '@/constants/theme';
import { formatMb } from '@/lib/downloads';

/**
 * A small management screen: lists every downloaded sound, shows total MB
 * used, and lets the user remove items one by one or wipe the lot. Playback
 * from here uses the normal player screen.
 */
export default function DownloadsScreen() {
  const { t, tc, isRTL } = useLocale();
  const { accent } = useTheme();
  const { totalBytes, remove, clearAll } = useDownloads();
  const items = useDownloadedTracks();
  const [busy, setBusy] = useState<string | null>(null);

  const confirmClearAll = () => {
    Alert.alert(t('downloadsClearConfirmTitle'), t('downloadsClearConfirmBody'), [
      { text: t('deleteCancel'), style: 'cancel' },
      {
        text: t('deleteConfirmYes'),
        style: 'destructive',
        onPress: () => {
          void clearAll();
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('downloadsTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('downloadsSub')}</Text>

          {items.length > 0 && (
            <Text style={[styles.used, isRTL && styles.textRTL]}>
              {t('downloadsUsed').replace('{amount}', formatMb(totalBytes))}
            </Text>
          )}

          {items.length === 0 ? (
            <Text style={[styles.empty, isRTL && styles.textRTL]}>{t('downloadsEmpty')}</Text>
          ) : (
            <View style={styles.list}>
              {items.map(({ track, record }) => (
                <View key={track.id} style={[styles.row, isRTL && styles.rowRTL]}>
                  <View style={styles.thumb}>
                    <SoundArt type={track.art} animated={false} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, isRTL && styles.textRTL]} numberOfLines={1}>
                      {tc(track.title)}
                    </Text>
                    <Text style={[styles.meta, isRTL && styles.textRTL]}>
                      {formatMb(record.bytes)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      setBusy(track.id);
                      try {
                        await remove(track.id);
                      } finally {
                        setBusy(null);
                      }
                    }}
                    disabled={busy === track.id}
                    hitSlop={8}
                    accessibilityLabel={t('downloadRemove')}
                    style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
                  >
                    <Text style={[styles.removeText, busy === track.id && styles.busy]}>✕</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={confirmClearAll}
                style={({ pressed }) => [styles.clearAllBtn, { borderColor: accent }, pressed && styles.pressed]}
              >
                <Text style={[styles.clearAllText, { color: accent }]}>{t('downloadsClearAll')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 36 },
  title: { fontSize: 26, fontFamily: FONT.bold, color: NightPalette.textPrimary, lineHeight: 36 },
  sub: { fontSize: 13, lineHeight: 20, color: NightPalette.dimText, marginTop: 6 },
  used: { fontSize: 12, color: NightPalette.amber, marginTop: 14, marginBottom: 12, opacity: 0.85 },
  empty: { color: NightPalette.dimText, fontSize: 13, lineHeight: 22, marginTop: 24, textAlign: 'center' },
  list: { marginTop: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    marginBottom: 10,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  thumb: { width: 44, height: 44, borderRadius: 10, overflow: 'hidden' },
  info: { flex: 1 },
  name: { color: NightPalette.textPrimary, fontSize: 14, lineHeight: 20 },
  meta: { color: NightPalette.dimText, fontSize: 11, lineHeight: 16, marginTop: 2 },
  removeBtn: { padding: 6 },
  removeText: { color: NightPalette.dimText, fontSize: 18 },
  busy: { opacity: 0.5 },
  clearAllBtn: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearAllText: { fontSize: 13, fontFamily: FONT.medium, lineHeight: 20 },
  pressed: { opacity: 0.7 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});

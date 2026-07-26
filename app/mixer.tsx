import { useState } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { SoundArt } from '@/components/SoundArt';
import { NightPalette, FONT } from '@/constants/theme';
import { tracksForLang } from '@/lib/mediaLibrary';
import { useMixer, MAX_LAYERS } from '@/contexts/MixerContext';
import { useRecordTool } from '@/hooks/useRecordTool';

// Curated starter blends — one tap to a known-good mix.
const PRESETS: { id: string; labelKey: string; trackIds: string[] }[] = [
  { id: 'storm-fire', labelKey: 'mixPresetStorm', trackIds: ['rain-tent', 'fire-camp'] },
  { id: 'deep-night', labelKey: 'mixPresetNight', trackIds: ['crickets-night', 'brown-deep'] },
  { id: 'shore', labelKey: 'mixPresetShore', trackIds: ['waves-real', 'wind-steppe'] },
];

export default function MixerScreen() {
  useRecordTool('mixer');
  const { t, tc, lang, isRTL } = useLocale();
  const { accent } = useTheme();
  // Mix state lives in MixerContext so it keeps playing across the app.
  const { layers, playing, addLayer, removeLayer, setVolume, toggle, applyPreset } = useMixer();
  const [pickerOpen, setPickerOpen] = useState(false);

  const addAndClose = (track: Parameters<typeof addLayer>[0]) => {
    addLayer(track);
    setPickerOpen(false);
  };

  const available = tracksForLang(lang).filter(
    (tr) => !layers.some((l) => l.track.id === tr.id),
  );

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('mixerTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('mixerSub')}</Text>

          {/* One-tap starter blends */}
          <View style={[styles.presets, isRTL && styles.rowRTL]}>
            {PRESETS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => applyPreset(p.trackIds)}
                style={({ pressed }) => [styles.presetChip, pressed && styles.pressed]}
              >
                <Text style={styles.presetText}>{t(p.labelKey as never)}</Text>
              </Pressable>
            ))}
          </View>

          {/* Active layers */}
          {layers.map((layer) => (
            <View key={layer.track.id} style={styles.layerCard}>
              <View style={[styles.layerHead, isRTL && styles.rowRTL]}>
                <View style={styles.artThumb}>
                  <SoundArt type={layer.track.art} />
                </View>
                <Text style={[styles.layerName, isRTL && styles.textRTL]} numberOfLines={1}>
                  {tc(layer.track.title)}
                </Text>
                <Pressable onPress={() => removeLayer(layer.track.id)} hitSlop={10}>
                  <Text style={styles.removeGlyph}>✕</Text>
                </Pressable>
              </View>
              <Slider
                value={layer.volume}
                onValueChange={(v) => setVolume(layer.track.id, v)}
                minimumTrackTintColor={accent}
                maximumTrackTintColor={NightPalette.surface}
                thumbTintColor={accent}
              />
            </View>
          ))}

          {/* Add layer */}
          {layers.length < MAX_LAYERS && (
            <Pressable
              onPress={() => setPickerOpen((v) => !v)}
              style={({ pressed }) => [styles.addBtn, { borderColor: accent }, pressed && styles.pressed]}
            >
              <Text style={[styles.addText, { color: accent }]}>
                {pickerOpen ? t('mixerClosePicker') : t('mixerAddLayer')}
              </Text>
            </Pressable>
          )}

          {pickerOpen && (
            <ScrollView
              style={styles.picker}
              contentContainerStyle={styles.pickerContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {available.map((tr) => (
                <Pressable
                  key={tr.id}
                  onPress={() => addAndClose(tr)}
                  style={({ pressed }) => [styles.pickRow, isRTL && styles.rowRTL, pressed && styles.pressed]}
                >
                  <View style={styles.pickThumb}>
                    <SoundArt type={tr.art} />
                  </View>
                  <Text style={[styles.pickName, isRTL && styles.textRTL]} numberOfLines={1}>
                    {tc(tr.title)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Transport */}
          {layers.length > 0 && (
            <Pressable
              onPress={toggle}
              style={({ pressed }) => [styles.playBtn, { backgroundColor: accent }, pressed && styles.pressed]}
            >
              <Text style={styles.playText}>{playing ? t('mixerPause') : t('mixerPlay')}</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 26, paddingTop: 12, paddingBottom: 36 },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  pressed: { opacity: 0.7 },
  title: { fontSize: 26, fontFamily: FONT.bold, lineHeight: 38, color: NightPalette.textPrimary },
  sub: { fontSize: 13, lineHeight: 21, color: NightPalette.dimText, marginTop: 4, marginBottom: 18 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  presetChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  presetText: { color: NightPalette.textPrimary, fontSize: 12, lineHeight: 18 },
  layerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    padding: 14,
    marginBottom: 12,
  },
  layerHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  artThumb: { width: 38, height: 38, borderRadius: 10, overflow: 'hidden' },
  layerName: { flex: 1, color: NightPalette.textPrimary, fontSize: 14, lineHeight: 21 },
  removeGlyph: { color: NightPalette.dimText, fontSize: 15, padding: 4 },
  addBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  addText: { fontSize: 14, lineHeight: 21 },
  picker: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(20,10,5,0.7)',
    marginBottom: 12,
    maxHeight: 340,
  },
  pickerContent: { padding: 8 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 10 },
  pickThumb: { width: 30, height: 30, borderRadius: 8, overflow: 'hidden' },
  pickName: { flex: 1, color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20 },
  playBtn: { borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  playText: { color: NightPalette.voidBlack, fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
});

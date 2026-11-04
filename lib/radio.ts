/**
 * Sleep Radio — curated channels of long-form ambient audio that rotate on
 * their own. The user taps one and leaves the phone alone: each channel walks
 * through its tracks every `ROTATE_MINUTES`, so a single night session covers
 * several hours without the user ever touching the screen again.
 *
 * All tracks are already in `SOUND_TRACKS` — radio only adds the playlist
 * metadata and the rotation. No new audio hosting, no new rights work.
 */
import type { Localized } from '@/lib/i18n';
import { SOUND_TRACKS } from '@/lib/mediaLibrary';

export type RadioChannelId = 'night' | 'rain' | 'waves' | 'cozy';

export interface RadioChannel {
  id: RadioChannelId;
  title: Localized;
  subtitle: Localized;
  /** Track ids rotated through. Any id missing from the library is dropped. */
  trackIds: string[];
}

/** How long each track plays before fading into the next, in minutes. */
export const RADIO_ROTATE_MINUTES = 12;

/**
 * The four starter channels. Order inside a channel matters: a slow-building
 * night starts with a softer bed and only moves to heavier rain later.
 */
export const RADIO_CHANNELS: RadioChannel[] = [
  {
    id: 'night',
    title: { en: 'Sleep Radio', ar: 'راديو النوم' },
    subtitle: {
      en: 'Rolls through soft night sounds — set it and forget it',
      ar: 'يتنقّل بين أصوات ليل هادئة — شغّله وانسَه',
    },
    trackIds: ['brown-deep', 'crickets-night', 'rain-tent', 'fire-camp', 'wind-steppe', 'waves-real'],
  },
  {
    id: 'rain',
    title: { en: 'Rainfall', ar: 'مطر متواصل' },
    subtitle: { en: 'Rain, all night, nothing else', ar: 'مطر طول الليل، بس' },
    trackIds: ['rain-meadow', 'rain-tent', 'city-rain', 'rain-roof', 'thunder-distant'],
  },
  {
    id: 'waves',
    title: { en: 'Shore', ar: 'شاطئ' },
    subtitle: { en: 'Slow waves and open wind', ar: 'أمواج بطيئة وريح مفتوحة' },
    trackIds: ['waves-real', 'ocean-swell', 'wind-steppe'],
  },
  {
    id: 'cozy',
    title: { en: 'Fireside', ar: 'بجوار النار' },
    subtitle: { en: 'Crackling fire, crickets, the woods at night', ar: 'نار تتطقطق، صراصير، الغابة ليلًا' },
    trackIds: ['fire-camp', 'fire-crackle', 'crickets-night', 'crickets-pine', 'owls-night'],
  },
];

/** Resolve the actually-available tracks for a channel (silently dropping unknowns). */
export function channelTracks(channel: RadioChannel): string[] {
  const known = new Set(SOUND_TRACKS.map((t) => t.id));
  return channel.trackIds.filter((id) => known.has(id));
}

export function radioChannelById(id: RadioChannelId): RadioChannel | undefined {
  return RADIO_CHANNELS.find((c) => c.id === id);
}

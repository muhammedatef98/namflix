/**
 * Voluntary support ("tip jar") — a Ko-fi page opened in the system browser.
 *
 * It deliberately unlocks NOTHING. Every feature is already granted by the free
 * Lifetime offer, and a tip buys no content, no tier, no removal of anything.
 * That is what keeps it allowed: App Store Guideline 3.2.1 and Google Play both
 * permit voluntary donations collected *outside* the app, but treat an external
 * link that grants in-app value as a bypass of in-app purchase.
 *
 * For the same reason this must open the real browser (`Linking.openURL`) and
 * never an in-app WebView / SFSafariViewController, and it must never appear as
 * an alternative to the paid plans on the paywall.
 */
import { Linking } from 'react-native';

export const SUPPORT_URL = 'https://ko-fi.com/muhammedatef98';

/** The contact address published in the App Store / Play listings (Guideline 1.5). */
export const SUPPORT_EMAIL = 'Namflix.sleep@gmail.com';

/** Opens the support page externally. Returns false if the OS refused it. */
export async function openSupportPage(): Promise<boolean> {
  try {
    await Linking.openURL(SUPPORT_URL);
    return true;
  } catch {
    return false;
  }
}

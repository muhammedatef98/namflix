/**
 * Global Tajawal default for EVERY <Text> / <TextInput>, React 19-safe.
 *
 * React 19 ignores `Text.defaultProps`, and RN 0.81's `Text` is a plain
 * function component with no `.render` to wrap — so the usual global-font
 * tricks silently do nothing, leaving any text that only sets size/colour on
 * the system font. Instead we wrap the JSX runtime's element factories (`jsx`,
 * `jsxs`, dev `jsxDEV`) and, whenever the element being created is RN's Text or
 * TextInput, slip `fontFamily: Tajawal` in as the *base* of the style array.
 *
 * Because the element's own style is layered on top, any explicit `fontFamily`
 * (e.g. a heavier FONT weight) still wins; everything else inherits Tajawal.
 * Metro reads `runtime.jsx` at each call site, so mutating the property here is
 * observed by every component rendered after this module loads. It's imported
 * first in the root layout, before any screen renders.
 */
import { Text, TextInput } from 'react-native';
import { FONT } from '@/constants/theme';

const BASE = { fontFamily: FONT.regular } as const;

type Factory = (type: unknown, props: Record<string, unknown> | null, ...rest: unknown[]) => unknown;

function wrap(runtime: Record<string, unknown> | undefined, key: string): void {
  if (!runtime) return;
  const orig = runtime[key] as (Factory & { __fontPatched?: boolean }) | undefined;
  if (typeof orig !== 'function' || orig.__fontPatched) return;

  const patched: Factory & { __fontPatched?: boolean } = (type, props, ...rest) => {
    if (type === Text || type === TextInput) {
      const style = props?.style;
      const next = { ...(props ?? {}), style: style == null ? BASE : [BASE, style] };
      return orig(type, next, ...rest);
    }
    return orig(type, props, ...rest);
  };
  patched.__fontPatched = true;
  runtime[key] = patched;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jsx = require('react/jsx-runtime') as Record<string, unknown>;
  wrap(jsx, 'jsx');
  wrap(jsx, 'jsxs');
} catch {
  // no automatic runtime — nothing to patch
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jsxDev = require('react/jsx-dev-runtime') as Record<string, unknown>;
  wrap(jsxDev, 'jsxDEV');
} catch {
  // no dev runtime in this build
}

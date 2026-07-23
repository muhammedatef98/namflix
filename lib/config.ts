// When Supabase env vars are absent, the app runs in DEMO_MODE: it boots
// straight to the home hub with a fake session, and all writes short-circuit
// (compute-and-return, no network). Add a real .env to switch to live mode.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const DEMO_MODE = !url || !anonKey;
export const SUPABASE_URL = url ?? 'https://demo.namflix.invalid';
export const SUPABASE_ANON_KEY = anonKey ?? 'demo-anon-key';

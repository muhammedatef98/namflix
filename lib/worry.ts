import { supabase } from './supabase';
import { DEMO_MODE } from './config';

/** Fire-and-forget: persist the worry so it can be reviewed tomorrow. */
export async function releaseWorry(body: string): Promise<void> {
  const text = body.trim();
  if (!text || DEMO_MODE) return;
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return; // not signed in — the animation still runs
  await supabase.from('worry_entries').insert({ user_id: userId, body: text });
}

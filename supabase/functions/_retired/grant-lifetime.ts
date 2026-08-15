// RETIRED 2026-08-09 — deleted from the Supabase project. See README.md here.
//
// Grants the CALLING user their free "Lifetime" — the `premium` entitlement,
// forever — as a RevenueCat PROMOTIONAL entitlement. Runs server-side because it
// needs the RevenueCat SECRET key, which must never ship in the app. The gateway
// verifies the JWT (verify_jwt: true); we re-resolve the user from that same
// token so a caller can only ever grant themselves — no id is taken from the
// body. The grant is refused once the launch offer window (app_config.free_until)
// has closed.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ENTITLEMENT_ID = 'premium';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const secret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!secret) return json({ error: 'server not configured' }, 500);

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) return json({ error: 'invalid token' }, 401);
  const appUserId = userData.user.id;

  // Only grant while the free launch offer is actually open.
  const { data: cfg } = await admin
    .from('app_config')
    .select('lifetime_mode, free_until')
    .eq('id', 1)
    .single();
  const open =
    cfg?.lifetime_mode === 'free' &&
    (!cfg.free_until || new Date(cfg.free_until as string).getTime() > Date.now());
  if (!open) return json({ error: 'offer_closed' }, 403);

  const rcRes = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}/entitlements/${ENTITLEMENT_ID}/promotional`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ duration: 'lifetime' }),
    },
  );

  if (!rcRes.ok) {
    const detail = await rcRes.text().catch(() => '');
    return json({ error: 'grant_failed', status: rcRes.status, detail: detail.slice(0, 300) }, 502);
  }

  return json({ ok: true });
});

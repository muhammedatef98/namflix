-- Ad policy knobs on the existing single-row admin config (public.app_config,
-- id = 1). Edit them from the Supabase dashboard; the app picks them up on the
-- next launch — no build or OTA needed. Every column is optional: if one is
-- missing or out of range, the app falls back to its built-in default
-- (lib/ads/policy.ts), so this migration is safe to run at any time.
alter table public.app_config
  add column if not exists ads_rewarded_enabled            boolean not null default true,
  add column if not exists ads_rewarded_daily_cap          integer not null default 3,
  add column if not exists ads_unlock_hours                integer not null default 24,
  -- Interstitials stay OFF unless you flip this on.
  add column if not exists ads_enable_interstitials        boolean not null default false,
  -- Device-local quiet window: no interstitials from start hour until end hour.
  add column if not exists ads_quiet_start_hour            integer not null default 20,
  add column if not exists ads_quiet_end_hour              integer not null default 7,
  add column if not exists ads_min_days_since_install      integer not null default 3,
  add column if not exists ads_min_sessions                integer not null default 5,
  add column if not exists ads_interstitial_interval_hours integer not null default 4;

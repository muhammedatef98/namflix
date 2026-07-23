-- Nightly sleep diary — the data behind CBT-I sleep restriction.
-- (client_id) makes offline writes idempotent: the same log synced twice
-- collapses to one row instead of duplicating.
create table if not exists public.sleep_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  client_id     text not null,
  in_bed_at     timestamptz not null,
  asleep_at     timestamptz not null,
  up_at         timestamptz not null,
  awakenings    int not null default 0 check (awakenings >= 0),
  quality       int not null check (quality between 1 and 5),
  time_in_bed_min  int not null,             -- derived, stored for fast queries
  total_sleep_min  int not null,
  efficiency    real not null check (efficiency between 0 and 1),
  created_at    timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.sleep_logs enable row level security;

create policy "own logs readable"
  on public.sleep_logs for select using (auth.uid() = user_id);
create policy "own logs insertable"
  on public.sleep_logs for insert with check (auth.uid() = user_id);

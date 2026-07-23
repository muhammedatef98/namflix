-- CBT-I Worry Journal: thoughts "released" before sleep.
-- Kept (not deleted) so the user can review them the next day — the
-- cognitive point is "I'll deal with this tomorrow", not erasure.
create table if not exists public.worry_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

alter table public.worry_entries enable row level security;

create policy "own worries readable"
  on public.worry_entries for select using (auth.uid() = user_id);
create policy "own worries insertable"
  on public.worry_entries for insert with check (auth.uid() = user_id);

-- Stargazing Expeditions: guided audio sleep journeys.
-- One row = one expedition (a single narrated track over an astro background).
create table if not exists public.expeditions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,               -- "Setting Up in the Empty Quarter"
  subtitle      text,                         -- "Aligning the lens on Andromeda"
  narrator      text,
  deep_sky_object text,                       -- "Andromeda Galaxy (M31)"
  duration_seconds int not null check (duration_seconds > 0),
  audio_url     text not null,                -- Supabase Storage public/signed URL
  background_image_url text not null,         -- dark astrophotography still
  is_premium    boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- Layered tracks for the binaural mixer (Pulsar Heartbeats, Solar Wind, etc.).
-- Separate table because these loop and blend independently of expeditions.
create table if not exists public.soundscape_layers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,                   -- "Pulsar Heartbeats"
  audio_url  text not null,                   -- seamless loop
  default_volume real not null default 0.5 check (default_volume between 0 and 1),
  is_premium boolean not null default false,
  sort_order int not null default 0
);

-- Content is public-read; only admins write (adjust to your admin model).
alter table public.expeditions enable row level security;
alter table public.soundscape_layers enable row level security;

create policy "expeditions readable by all"
  on public.expeditions for select using (true);
create policy "layers readable by all"
  on public.soundscape_layers for select using (true);

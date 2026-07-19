-- =============================================================================
-- GAMECHANGER — Supabase schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null,
  is_subscribed      boolean not null default true, -- default true for current dev phase
  stripe_customer_id text
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. event_types
-- -----------------------------------------------------------------------------
create table if not exists public.event_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  form_schema jsonb not null
);

alter table public.event_types enable row level security;

-- Event types are the shared catalog every signed-in creator browses.
drop policy if exists "Authenticated users can read event types" on public.event_types;
create policy "Authenticated users can read event types"
  on public.event_types for select
  using (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 3. user_events
-- -----------------------------------------------------------------------------
create table if not exists public.user_events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles (id) on delete cascade,
  event_type_id  uuid references public.event_types (id),
  form_responses jsonb not null,
  created_at     timestamptz not null default now()
);

alter table public.user_events enable row level security;

drop policy if exists "Users can manage their own events" on public.user_events;
create policy "Users can manage their own events"
  on public.user_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. generated_games
-- -----------------------------------------------------------------------------
create table if not exists public.generated_games (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  game_data  jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.generated_games enable row level security;

-- Anonymous players hitting /game/[game_id] need to read a single row by id,
-- without being signed in. Reads are scoped to SELECT only — nothing else.
drop policy if exists "Anyone can read a generated game by id" on public.generated_games;
create policy "Anyone can read a generated game by id"
  on public.generated_games for select
  to anon, authenticated
  using (true);

-- Only the owning creator (or the service role, via Edge Functions using the
-- service key) may write. Regular authenticated inserts are blocked here on
-- purpose: /generate-final-game writes server-side with the service role so
-- it can set user_id itself after validating the subscription check.
drop policy if exists "Only owners can update their generated games" on public.generated_games;
create policy "Only owners can update their generated games"
  on public.generated_games for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Only owners can delete their generated games" on public.generated_games;
create policy "Only owners can delete their generated games"
  on public.generated_games for delete
  using (auth.uid() = user_id);

-- No insert policy is defined for client roles: inserts happen exclusively
-- from the generate-final-game Edge Function using the service_role key,
-- which bypasses RLS by design.

-- =============================================================================
-- Trigger: auto-create a profiles row whenever a new auth.users row appears
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- Seed data: "Friends Game Night" event type
-- form_schema matches src/types/index.ts FormField exactly, including
-- defaultValue on every field so the frontend never mixes controlled and
-- uncontrolled inputs.
-- =============================================================================
insert into public.event_types (name, form_schema)
values (
  'Friends Game Night',
  '[
    {
      "id": "group_vibe",
      "type": "textarea",
      "label": "Describe your friend group''s vibe",
      "placeholder": "e.g. sarcastic, competitive, loves inside jokes, always late...",
      "defaultValue": ""
    },
    {
      "id": "embarrassing_stories",
      "type": "textarea",
      "label": "Any running jokes or embarrassing stories we can reference?",
      "placeholder": "e.g. that time Jamie fell into the pool at Alex''s birthday...",
      "defaultValue": ""
    },
    {
      "id": "guest_count",
      "type": "slider",
      "label": "How many people are playing?",
      "min": 2,
      "max": 20,
      "step": 1,
      "defaultValue": 6
    },
    {
      "id": "competitiveness",
      "type": "slider",
      "label": "How competitive should the game be?",
      "min": 1,
      "max": 10,
      "step": 1,
      "defaultValue": 5
    },
    {
      "id": "energy_level",
      "type": "slider",
      "label": "Chill hangout or high-energy chaos?",
      "min": 1,
      "max": 10,
      "step": 1,
      "defaultValue": 7
    },
    {
      "id": "duration_minutes",
      "type": "slider",
      "label": "How long should the game run (minutes)?",
      "min": 15,
      "max": 180,
      "step": 15,
      "defaultValue": 60
    }
  ]'::jsonb
);

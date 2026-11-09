-- ==============================================================================
-- AYAHFLOW PRO — PRODUCTION DATABASE SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor.
-- Every table has strict RLS enabled to prevent unauthorized access across users.

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile only"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile only"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- 2. PLAYLISTS TABLE
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.playlists enable row level security;

-- Playlists Policies (Strictly user-isolated)
create policy "Users can view only their own playlists"
  on public.playlists for select
  using (auth.uid() = user_id);

create policy "Users can create their own playlists"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update only their own playlists"
  on public.playlists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete only their own playlists"
  on public.playlists for delete
  using (auth.uid() = user_id);


-- 3. PLAYLIST ENTRIES TABLE (Exact Surah Ordering)
create table if not exists public.playlist_entries (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  surah_number integer not null check (surah_number between 1 and 114),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint unique_playlist_surah unique (playlist_id, surah_number)
);

-- Index for high-performance sequential ordering queries
create index if not exists idx_playlist_entries_order
  on public.playlist_entries(playlist_id, position asc);

-- Enable RLS
alter table public.playlist_entries enable row level security;

-- Playlist Entries Policies (Enforced directly and via parent playlist)
create policy "Users can view only their own playlist entries"
  on public.playlist_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert entries into their own playlists"
  on public.playlist_entries for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

create policy "Users can update entries in their own playlists"
  on public.playlist_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete entries from their own playlists"
  on public.playlist_entries for delete
  using (auth.uid() = user_id);


-- 4. USER PREFERENCES TABLE (Favorites, Insights, Reciter)
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorites integer[] not null default '{}',
  downloaded_surahs integer[] not null default '{}',
  insights jsonb not null default '{}'::jsonb,
  selected_reciter_id text default 'yasser-al-dosari-sa',
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Preferences Policies
create policy "Users can view only their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update only their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 5. AUTOMATIC PROFILE INITIALIZATION TRIGGER
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger firing on every new user registration in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

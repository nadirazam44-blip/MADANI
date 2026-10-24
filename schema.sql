-- MADANI ARENA schema. Run this in Supabase SQL Editor.
-- Important: RLS is enabled. Never put the service-role key in a browser app.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Player',
  created_at timestamptz not null default now()
);

create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null unique,
  region text not null default 'MENA',
  captain_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_members (
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'player' check (role in ('captain','player')),
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  game text not null default 'Free Fire',
  start_date date,
  status text not null default 'soon' check (status in ('open','soon','live','done')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  squad_id uuid not null references public.squads(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (tournament_id, squad_id)
);

create table if not exists public.tournament_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  squad_id uuid not null references public.squads(id) on delete cascade,
  placement integer not null default 1 check (placement > 0),
  kills integer not null default 0 check (kills >= 0),
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.tournament_results enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

create or replace function public.is_squad_captain(target_squad uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.squads where id = target_squad and captain_id = auth.uid()); $$;

-- Profiles: public read, owner updates own profile.
drop policy if exists "Profiles are viewable" on public.profiles;
create policy "Profiles are viewable" on public.profiles for select using (true);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Public read for public competition data.
drop policy if exists "Squads public read" on public.squads;
create policy "Squads public read" on public.squads for select using (true);
drop policy if exists "Authenticated create squad" on public.squads;
create policy "Authenticated create squad" on public.squads for insert to authenticated with check (captain_id = auth.uid());
drop policy if exists "Captain or admin update squad" on public.squads;
create policy "Captain or admin update squad" on public.squads for update to authenticated using (captain_id = auth.uid() or public.is_admin()) with check (captain_id = auth.uid() or public.is_admin());
drop policy if exists "Captain or admin delete squad" on public.squads;
create policy "Captain or admin delete squad" on public.squads for delete to authenticated using (captain_id = auth.uid() or public.is_admin());

drop policy if exists "Members public read" on public.squad_members;
create policy "Members public read" on public.squad_members for select using (true);
drop policy if exists "Users join themselves" on public.squad_members;
create policy "Users join themselves" on public.squad_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Member or admin leave" on public.squad_members;
create policy "Member or admin leave" on public.squad_members for delete to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Tournaments public read" on public.tournaments;
create policy "Tournaments public read" on public.tournaments for select using (true);
drop policy if exists "Admins create tournaments" on public.tournaments;
create policy "Admins create tournaments" on public.tournaments for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins update tournaments" on public.tournaments;
create policy "Admins update tournaments" on public.tournaments for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete tournaments" on public.tournaments;
create policy "Admins delete tournaments" on public.tournaments for delete to authenticated using (public.is_admin());

drop policy if exists "Registrations public read" on public.tournament_registrations;
create policy "Registrations public read" on public.tournament_registrations for select using (true);
drop policy if exists "Captain registers squad" on public.tournament_registrations;
create policy "Captain registers squad" on public.tournament_registrations for insert to authenticated with check (public.is_squad_captain(squad_id));
drop policy if exists "Admins manage registrations" on public.tournament_registrations;
create policy "Admins manage registrations" on public.tournament_registrations for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Captain or admin cancels registration" on public.tournament_registrations;
create policy "Captain or admin cancels registration" on public.tournament_registrations for delete to authenticated using (public.is_squad_captain(squad_id) or public.is_admin());

drop policy if exists "Results public read" on public.tournament_results;
create policy "Results public read" on public.tournament_results for select using (true);
drop policy if exists "Admins add results" on public.tournament_results;
create policy "Admins add results" on public.tournament_results for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins update results" on public.tournament_results;
create policy "Admins update results" on public.tournament_results for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete results" on public.tournament_results;
create policy "Admins delete results" on public.tournament_results for delete to authenticated using (public.is_admin());

drop policy if exists "Admins can view admins" on public.admins;
create policy "Admins can view admins" on public.admins for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Automatically create a profile when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- AFTER creating your own account, make yourself an admin by running:
-- insert into public.admins (user_id) values ('PASTE-YOUR-AUTH-USER-UUID-HERE');

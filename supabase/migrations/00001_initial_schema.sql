-- ============================================================
-- GEEKS PROGRAM LEADERBOARD — Initial Schema
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Enums
create type category as enum ('AI', 'Cyber', 'Web');
create type period_type as enum ('biweekly', 'monthly');

-- 2. Tables

-- Players (non-admin users who earn points)
create table players (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- Admins (can manage players and points)
create table admins (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- Leaderboard scores (one row per player per category)
create table leaderboard_scores (
  player_id     uuid not null references players(id) on delete cascade,
  category      category not null,
  live_pts      int not null default 0,
  biweekly_pts  int not null default 0,
  monthly_pts   int not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (player_id, category)
);

-- Period state (tracks current window boundaries for resets)
create table period_state (
  period_type   period_type primary key,
  window_start  date not null,
  window_end    date not null,
  last_reset_at timestamptz not null default now()
);

-- Point events (append-only audit log)
create table point_events (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references players(id) on delete cascade,
  admin_id      uuid references admins(id),
  category      category not null,
  delta         int not null,
  note          text,
  event_date    date not null default current_date,
  created_at    timestamptz not null default now()
);

-- 3. Indexes
create index idx_scores_live_pts     on leaderboard_scores (live_pts desc);
create index idx_scores_biweekly_pts on leaderboard_scores (biweekly_pts desc);
create index idx_scores_monthly_pts  on leaderboard_scores (monthly_pts desc);
create index idx_events_player_id    on point_events (player_id);
create index idx_events_admin_id     on point_events (admin_id);
create index idx_events_event_date   on point_events (event_date desc);

-- 4. Auto-update updated_at trigger
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_scores_updated_at
  before update on leaderboard_scores
  for each row execute function update_timestamp();

-- 5. Period check function (called before any read/write)
create or replace function check_periods()
returns void as $$
declare
  today             date    := current_date;
  days_in_month     int;
  midpoint          int;
  bi_expected_start date;
  bi_expected_end   date;
  mo_expected_start date;
  mo_expected_end   date;
begin
  days_in_month := extract(day from (date_trunc('month', today) + interval '1 month' - interval '1 day'))::int;
  midpoint      := floor(days_in_month / 2.0)::int;

  -- Biweekly window
  if extract(day from today) <= midpoint then
    bi_expected_start := date_trunc('month', today)::date;
    bi_expected_end   := bi_expected_start + (midpoint - 1);
  else
    bi_expected_start := (date_trunc('month', today) + (midpoint) * interval '1 day')::date;
    bi_expected_end   := (date_trunc('month', today) + interval '1 month' - interval '1 day')::date;
  end if;

  -- Monthly window
  mo_expected_start := date_trunc('month', today)::date;
  mo_expected_end   := (date_trunc('month', today) + interval '1 month' - interval '1 day')::date;

  -- Check and reset biweekly if needed
  if (select window_start from period_state where period_type = 'biweekly') != bi_expected_start then
    update leaderboard_scores set biweekly_pts = 0;
    insert into period_state (period_type, window_start, window_end, last_reset_at)
      values ('biweekly', bi_expected_start, bi_expected_end, now())
      on conflict (period_type) do update set
        window_start  = bi_expected_start,
        window_end    = bi_expected_end,
        last_reset_at = now();
  end if;

  -- Check and reset monthly if needed
  if (select window_start from period_state where period_type = 'monthly') != mo_expected_start then
    update leaderboard_scores set monthly_pts = 0;
    insert into period_state (period_type, window_start, window_end, last_reset_at)
      values ('monthly', mo_expected_start, mo_expected_end, now())
      on conflict (period_type) do update set
        window_start  = mo_expected_start,
        window_end    = mo_expected_end,
        last_reset_at = now();
  end if;
end;
$$ language plpgsql;

-- 6. Award points function (called by admin API)
create or replace function award_points(
  p_player_id uuid,
  p_admin_id  uuid,
  p_category  category,
  p_delta     int,
  p_note      text default null
)
returns table (
  player_id     uuid,
  category      category,
  live_pts      int,
  biweekly_pts  int,
  monthly_pts   int
) as $$
begin
  -- Run period check first
  perform check_periods();

  -- Update scores
  update leaderboard_scores ls
  set
    live_pts     = greatest(0, ls.live_pts     + p_delta),
    biweekly_pts = ls.biweekly_pts + p_delta,
    monthly_pts  = ls.monthly_pts  + p_delta
  where ls.player_id = p_player_id and ls.category = p_category;

  -- Audit log
  insert into point_events (player_id, admin_id, category, delta, note)
  values (p_player_id, p_admin_id, p_category, p_delta, p_note);

  -- Return updated row
  return query
  select ls.player_id, ls.category, ls.live_pts, ls.biweekly_pts, ls.monthly_pts
  from leaderboard_scores ls
  where ls.player_id = p_player_id and ls.category = p_category;
end;
$$ language plpgsql;

-- 7. Seed initial period state
insert into period_state (period_type, window_start, window_end)
values
  ('biweekly', date_trunc('month', current_date)::date, (date_trunc('month', current_date) + floor(extract(day from (date_trunc('month', current_date) + interval '1 month' - interval '1 day'))::int / 2.0) * interval '1 day' - interval '1 day')::date),
  ('monthly',  date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date)
on conflict (period_type) do nothing;

-- 8. Row-Level Security
alter table players              enable row level security;
alter table leaderboard_scores   enable row level security;
alter table point_events         enable row level security;
alter table admins               enable row level security;

-- Public read access for leaderboard
create policy "Anyone can read players"
  on players for select using (true);

create policy "Anyone can read scores"
  on leaderboard_scores for select using (true);

-- Only admins can modify
create policy "Admins can insert players"
  on players for insert with check (
    exists (select 1 from admins where id = current_setting('app.admin_id')::uuid)
  );

create policy "Admins can update scores"
  on leaderboard_scores for update using (
    exists (select 1 from admins where id = current_setting('app.admin_id')::uuid)
  );

create policy "Admins can insert events"
  on point_events for insert with check (
    exists (select 1 from admins where id = current_setting('app.admin_id')::uuid)
  );

create policy "Anyone can read events"
  on point_events for select using (true);

-- 9. Seed admin (password: "admin123" — CHANGE IN PRODUCTION)
insert into admins (username, password_hash)
values ('admin', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmEw5F6GCCJYfYqGqKSu')
on conflict (username) do nothing;

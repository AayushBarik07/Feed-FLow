-- Initial Schema for FeedFlow

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
-- Stores user data complementing Supabase Auth
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Instagram Connections Table
-- Stores connection status without storing credentials
create table public.instagram_connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  ig_username text not null,
  account_type text,
  is_connected boolean default true,
  last_sync timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 3. User Interests Table
-- Stores the topics a user wants more of
create table public.user_interests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topic)
);

-- 4. Blocked Topics Table
-- Stores the topics a user wants less of
create table public.blocked_topics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topic)
);

-- 5. Interest DNA Table
-- AI-generated interest composition
create table public.interest_dna (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  composition jsonb not null, -- e.g., {"AI": 70, "Startups": 15}
  emerging_interests text[],
  declining_interests text[],
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Feed Health Scores Table
-- Time-series data of user's feed health
create table public.feed_health_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 0 and score <= 100),
  factors jsonb, -- e.g., {"clarity": 80, "diversity": 90}
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Personalization Scores Table
-- Time-series data of personalization progress
create table public.personalization_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 0 and score <= 100),
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Daily Missions Table
-- AI-generated tasks
create table public.daily_missions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  action_type text, -- e.g., 'save', 'follow', 'watch', 'avoid'
  target_topic text,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 9. Weekly Reports Table
-- AI-generated analysis
create table public.weekly_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  summary text not null,
  insights jsonb,
  recommended_topics text[],
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Feed Simulations Table
-- Simulated feed items
create table public.feed_simulations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  items jsonb not null, -- Array of post simulations
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Automation Status Table
create table public.automation_status (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  is_active boolean default true,
  last_analysis_at timestamp with time zone,
  next_scheduled_at timestamp with time zone,
  reports_generated integer default 0,
  missions_generated integer default 0
);

-- 12. Row Level Security (RLS) setup
alter table public.profiles enable row level security;
alter table public.instagram_connections enable row level security;
alter table public.user_interests enable row level security;
alter table public.blocked_topics enable row level security;
alter table public.interest_dna enable row level security;
alter table public.feed_health_scores enable row level security;
alter table public.personalization_scores enable row level security;
alter table public.daily_missions enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.feed_simulations enable row level security;
alter table public.automation_status enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own IG connection" on instagram_connections for select using (auth.uid() = user_id);
create policy "Users can manage own IG connection" on instagram_connections for all using (auth.uid() = user_id);

create policy "Users can view own interests" on user_interests for select using (auth.uid() = user_id);
create policy "Users can manage own interests" on user_interests for all using (auth.uid() = user_id);

create policy "Users can view own blocked topics" on blocked_topics for select using (auth.uid() = user_id);
create policy "Users can manage own blocked topics" on blocked_topics for all using (auth.uid() = user_id);

create policy "Users can view own interest dna" on interest_dna for select using (auth.uid() = user_id);
create policy "Users can view own feed health" on feed_health_scores for select using (auth.uid() = user_id);
create policy "Users can view own personalization score" on personalization_scores for select using (auth.uid() = user_id);
create policy "Users can view own missions" on daily_missions for select using (auth.uid() = user_id);
create policy "Users can update own missions" on daily_missions for update using (auth.uid() = user_id);
create policy "Users can view own weekly reports" on weekly_reports for select using (auth.uid() = user_id);
create policy "Users can view own feed simulations" on feed_simulations for select using (auth.uid() = user_id);
create policy "Users can view own automation status" on automation_status for select using (auth.uid() = user_id);
create policy "Users can manage own automation status" on automation_status for all using (auth.uid() = user_id);

-- Trigger to create profile and automation status on sign up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.automation_status (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

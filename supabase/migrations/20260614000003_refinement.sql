-- 1. Add color scheme to theme_preferences
alter table public.theme_preferences
add column color_scheme text default 'system' check (color_scheme in ('light', 'dark', 'system'));

-- 2. Add notification preferences to profiles
alter table public.profiles
add column push_notifications_enabled boolean default false,
add column weekly_reports_enabled boolean default true,
add column disliked_topics text[] default '{}',
add column last_active_at timestamp with time zone default timezone('utc'::text, now());

-- 3. Update Profiles RLS for self-management
-- (Already exists from initial schema, but explicitly allowing update on these new fields)
-- create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 4. Activity Logs for detailed history
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null, -- e.g., 'logged_in', 'completed_mission', 'updated_interests'
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_logs enable row level security;
create policy "Users can view own activity logs" on activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert own activity logs" on activity_logs for insert with check (auth.uid() = user_id);

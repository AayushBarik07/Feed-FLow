-- 1. Theme Preferences Table
create table public.theme_preferences (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  active_theme text default 'graphite' check (active_theme in ('blue', 'purple', 'emerald', 'orange', 'red', 'graphite')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Interest History Table (For Evolution Timeline)
create table public.interest_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_number integer not null, -- e.g., 1, 7, 30
  interest_dna jsonb not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Expand Daily Missions for Explainability
alter table public.daily_missions 
add column estimated_impact jsonb, -- e.g., {"health": 4, "alignment": 3}
add column explanation text;

-- 4. Expand Automation Status for UI Display
alter table public.automation_status
add column last_report_generated_at timestamp with time zone;

-- RLS Setup
alter table public.theme_preferences enable row level security;
alter table public.interest_history enable row level security;

create policy "Users can manage own themes" on theme_preferences for all using (auth.uid() = user_id);
create policy "Users can view own history" on interest_history for select using (auth.uid() = user_id);

-- Trigger to create theme preference on sign up
create or replace function public.handle_new_user_theme() 
returns trigger as $$
begin
  insert into public.theme_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_theme
  after insert on auth.users
  for each row execute procedure public.handle_new_user_theme();

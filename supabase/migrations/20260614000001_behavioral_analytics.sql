-- 1. Interest Interactions Table
create table public.interest_interactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  interaction_type text not null check (interaction_type in ('like', 'favorite', 'explore', 'save')),
  weight integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Discovery Actions Table
create table public.discovery_actions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null check (action_type in ('click_suggested_topic', 'click_suggested_creator', 'open_feed_card')),
  target_topic text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Session Activity Table
create table public.session_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_date date default current_date not null,
  session_duration_seconds integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, session_date)
);

-- RLS Setup
alter table public.interest_interactions enable row level security;
alter table public.discovery_actions enable row level security;
alter table public.session_activity enable row level security;

create policy "Users can manage own interactions" on interest_interactions for all using (auth.uid() = user_id);
create policy "Users can manage own discovery actions" on discovery_actions for all using (auth.uid() = user_id);
create policy "Users can manage own session activity" on session_activity for all using (auth.uid() = user_id);

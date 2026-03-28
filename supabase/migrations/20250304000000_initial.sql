-- CourseMate: profiles, study requests, chat, Q&A
-- Run in Supabase SQL Editor or via `supabase db push` if using Supabase CLI.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default 'Student',
  avatar_url text,
  major text,
  year text,
  university text,
  fun_fact text,
  courses text[] not null default '{}',
  skill_level jsonb not null default '{}',
  study_style text[] not null default '{}',
  study_location text[] not null default '{}',
  study_goal text,
  study_time_preference text,
  availability jsonb not null default '[]',
  socials jsonb not null default '{}',
  has_completed_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_courses_gin on public.profiles using gin (courses);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create function public.set_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_profiles_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Study requests
-- ---------------------------------------------------------------------------
create table public.study_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null,
  skill_level text not null,
  study_style text not null,
  availability jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index study_requests_user_id_idx on public.study_requests (user_id);
create index study_requests_course_id_idx on public.study_requests (course_id);

alter table public.study_requests enable row level security;

create policy "study_requests_select_authenticated"
  on public.study_requests for select
  to authenticated
  using (true);

create policy "study_requests_insert_own"
  on public.study_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "study_requests_delete_own"
  on public.study_requests for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Conversations & messages
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dm', 'group')),
  name text not null,
  course_id text,
  icebreaker text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (conversation_id, user_id)
);

create index conversation_members_user_idx on public.conversation_members (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  body text not null,
  attachment jsonb,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_member"
  on public.conversations for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = conversations.id
        and m.user_id = auth.uid()
    )
  );

create policy "conversations_insert_authenticated"
  on public.conversations for insert
  to authenticated
  with check (true);

create policy "conversations_update_member"
  on public.conversations for update
  to authenticated
  using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = conversations.id
        and m.user_id = auth.uid()
    )
  );

create policy "conversation_members_select_member"
  on public.conversation_members for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = conversation_members.conversation_id
        and m.user_id = auth.uid()
    )
  );

create policy "conversation_members_insert_authenticated"
  on public.conversation_members for insert
  to authenticated
  with check (true);

create policy "messages_select_member"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = messages.conversation_id
        and m.user_id = auth.uid()
    )
  );

create policy "messages_insert_member"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = messages.conversation_id
        and m.user_id = auth.uid()
    )
    and (sender_id is null or sender_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Q&A
-- ---------------------------------------------------------------------------
create table public.qa_posts (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  is_anonymous boolean not null default false,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index qa_posts_course_id_idx on public.qa_posts (course_id);

create table public.qa_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.qa_posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  is_instructor boolean not null default false,
  is_follow_up boolean not null default false,
  created_at timestamptz not null default now()
);

create index qa_comments_post_id_idx on public.qa_comments (post_id);

create table public.qa_post_upvotes (
  post_id uuid not null references public.qa_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.qa_posts enable row level security;
alter table public.qa_comments enable row level security;
alter table public.qa_post_upvotes enable row level security;

create policy "qa_posts_select_authenticated"
  on public.qa_posts for select
  to authenticated
  using (true);

create policy "qa_posts_insert_own"
  on public.qa_posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "qa_posts_update_own"
  on public.qa_posts for update
  to authenticated
  using (auth.uid() = author_id);

create policy "qa_comments_select_authenticated"
  on public.qa_comments for select
  to authenticated
  using (true);

create policy "qa_comments_insert_authenticated"
  on public.qa_comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "qa_upvotes_select_authenticated"
  on public.qa_post_upvotes for select
  to authenticated
  using (true);

create policy "qa_upvotes_insert_own"
  on public.qa_post_upvotes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "qa_upvotes_delete_own"
  on public.qa_post_upvotes for delete
  to authenticated
  using (auth.uid() = user_id);

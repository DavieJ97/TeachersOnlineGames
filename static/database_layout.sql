-- ============================================================
-- TEACHERS ONLINE DATABASE
-- Supabase / PostgreSQL
-- ============================================================

-- UUID generation
create extension if not exists "pgcrypto";


-- ============================================================
-- 1. PROFILES
-- ============================================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    email text not null,
    username text unique,
    display_name text,
    avatar_url text,
    bio text,
    is_public boolean not null default false,

    country text,
    language text,

    role text not null default 'teacher'
        check (role in ('teacher', 'admin')),

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 2. TEACHER PROFILES
-- ============================================================

create table public.teacher_profiles (
    user_id uuid primary key
        references public.profiles(id) on delete cascade,

    subjects text[] default '{}',
    grade_levels text[] default '{}',

    years_experience integer
        check (years_experience >= 0),

    school_name text,
    school_name_is_public boolean not null default false,
    teaching_country text,

    specializations text[] default '{}',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 3. USER PREFERENCES
-- ============================================================

create table public.user_preferences (
    user_id uuid primary key
        references public.profiles(id) on delete cascade,

    theme text not null default 'system'
        check (theme in ('light', 'dark', 'system')),

    email_notifications boolean not null default true,
    community_notifications boolean not null default true,
    marketing_emails boolean not null default false,

    preferred_language text default 'en',

    updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. PLANS
-- ============================================================

create table public.plans (
    id uuid primary key default gen_random_uuid(),

    name text not null unique,
    description text,

    price numeric(10,2) not null default 0
        check (price >= 0),

    currency text not null default 'USD',

    billing_interval text not null default 'none'
        check (billing_interval in ('none', 'month', 'year')),

    is_active boolean not null default true,

    created_at timestamptz not null default now()
);


-- ============================================================
-- 5. SUBSCRIPTIONS
-- ============================================================

create table public.subscriptions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    plan_id uuid not null
        references public.plans(id),

    status text not null default 'active'
        check (status in ('active', 'cancelled', 'expired', 'trialing', 'past_due')),

    started_at timestamptz not null default now(),
    expires_at timestamptz,
    cancelled_at timestamptz,

    created_at timestamptz not null default now()
);


-- ============================================================
-- 6. USAGE EVENTS
-- ============================================================

create table public.usage_events (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    event_type text not null,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);


-- ============================================================
-- 7. WORKSHEETS
-- ============================================================

create table public.worksheets (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    title text not null,

    subject text,
    grade_level text,
    topic text,

    content jsonb not null default '{}'::jsonb,

    is_public boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 8. SAVED CONTENT
-- ============================================================

create table public.saved_content (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    content_type text not null
        check (content_type in (
            'worksheet',
            'lesson',
            'presentation',
            'game'
        )),

    content_id uuid not null,

    created_at timestamptz not null default now(),

    unique (user_id, content_type, content_id)
);


-- ============================================================
-- 9. LESSONS
-- ============================================================

create table public.lessons (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    title text not null,
    description text,

    subject text,
    grade_level text,

    content jsonb not null default '{}'::jsonb,

    is_public boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 10. COMMENTS
-- ============================================================

create table public.comments (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    content_type text not null
        check (content_type in (
            'worksheet',
            'lesson',
            'presentation',
            'game'
        )),

    content_id uuid not null,

    body text not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 11. LIKES
-- ============================================================

create table public.likes (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    content_type text not null
        check (content_type in (
            'worksheet',
            'lesson',
            'presentation',
            'game'
        )),

    content_id uuid not null,

    created_at timestamptz not null default now(),

    unique (user_id, content_type, content_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index idx_subscriptions_user_id
    on public.subscriptions(user_id);

create index idx_subscriptions_plan_id
    on public.subscriptions(plan_id);

create index idx_usage_events_user_id
    on public.usage_events(user_id);

create index idx_usage_events_type
    on public.usage_events(event_type);

create index idx_usage_events_created_at
    on public.usage_events(created_at);

create index idx_worksheets_user_id
    on public.worksheets(user_id);

create index idx_worksheets_public
    on public.worksheets(is_public);

create index idx_lessons_user_id
    on public.lessons(user_id);

create index idx_lessons_public
    on public.lessons(is_public);

create index idx_comments_content
    on public.comments(content_type, content_id);

create index idx_likes_content
    on public.likes(content_type, content_id);

create index idx_saved_content_user
    on public.saved_content(user_id);


-- ============================================================
-- DEFAULT PLANS
-- ============================================================

insert into public.plans
    (name, description, price, currency, billing_interval)
values
    (
        'Free',
        'Free Teachers Online account',
        0,
        'USD',
        'none'
    ),
    (
        'Teacher Plus',
        'Additional tools and convenience features',
        0,
        'USD',
        'month'
    ),
    (
        'Teacher Pro',
        'Full access to premium teacher tools',
        0,
        'USD',
        'month'
    );


-- ============================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        email,
        username,
        display_name
    )
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'username',
        new.raw_user_meta_data ->> 'display_name'
    );

    insert into public.teacher_profiles (
        user_id
    )
    values (
        new.id
    );

    insert into public.user_preferences (
        user_id
    )
    values (
        new.id
    );

    return new;

end;
$$;


create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.update_updated_at();

create trigger teacher_profiles_updated_at
    before update on public.teacher_profiles
    for each row
    execute function public.update_updated_at();

create trigger user_preferences_updated_at
    before update on public.user_preferences
    for each row
    execute function public.update_updated_at();

create trigger worksheets_updated_at
    before update on public.worksheets
    for each row
    execute function public.update_updated_at();

create trigger lessons_updated_at
    before update on public.lessons
    for each row
    execute function public.update_updated_at();

create trigger comments_updated_at
    before update on public.comments
    for each row
    execute function public.update_updated_at();


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.worksheets enable row level security;
alter table public.saved_content enable row level security;
alter table public.lessons enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;


-- ============================================================
-- PROFILES RLS
-- ============================================================

create policy "Public profiles are viewable"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace view public.public_profiles
with (security_invoker = false)
as
select
    id,
    username,
    display_name,
    avatar_url,
    bio,
    country,
    created_at
from public.profiles
where is_public = true;

grant select on public.public_profiles to anon, authenticated;


-- ============================================================
-- TEACHER PROFILES RLS
-- ============================================================

create policy "Users can view their own teacher profile"
on public.teacher_profiles
for select
using (auth.uid() = user_id);

create or replace view public.public_teacher_profiles
with (security_invoker = false)
as
select
    teacher_profiles.user_id,
    teacher_profiles.subjects,
    teacher_profiles.grade_levels,
    teacher_profiles.years_experience,
    case
        when teacher_profiles.school_name_is_public then teacher_profiles.school_name
        else null
    end as school_name,
    teacher_profiles.teaching_country,
    teacher_profiles.specializations
from public.teacher_profiles
join public.profiles
    on profiles.id = teacher_profiles.user_id
where profiles.is_public = true;

grant select on public.public_teacher_profiles to anon, authenticated;

create policy "Users can update their own teacher profile"
on public.teacher_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ============================================================
-- USER PREFERENCES RLS
-- ============================================================

create policy "Users can view their preferences"
on public.user_preferences
for select
using (auth.uid() = user_id);

create policy "Users can update their preferences"
on public.user_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ============================================================
-- PLANS RLS
-- ============================================================

create policy "Active plans are publicly viewable"
on public.plans
for select
using (is_active = true);


-- ============================================================
-- SUBSCRIPTIONS RLS
-- ============================================================

create policy "Users can view their subscriptions"
on public.subscriptions
for select
using (auth.uid() = user_id);


-- ============================================================
-- USAGE EVENTS RLS
-- ============================================================

create policy "Users can view their usage"
on public.usage_events
for select
using (auth.uid() = user_id);


-- ============================================================
-- WORKSHEETS RLS
-- ============================================================

create policy "Public worksheets are viewable"
on public.worksheets
for select
using (
    is_public = true
    or auth.uid() = user_id
);

create policy "Users can create worksheets"
on public.worksheets
for insert
with check (auth.uid() = user_id);

create policy "Users can update their worksheets"
on public.worksheets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their worksheets"
on public.worksheets
for delete
using (auth.uid() = user_id);


-- ============================================================
-- SAVED CONTENT RLS
-- ============================================================

create policy "Users can view their saved content"
on public.saved_content
for select
using (auth.uid() = user_id);

create policy "Users can save content"
on public.saved_content
for insert
with check (auth.uid() = user_id);

create policy "Users can remove saved content"
on public.saved_content
for delete
using (auth.uid() = user_id);


-- ============================================================
-- LESSONS RLS
-- ============================================================

create policy "Public lessons are viewable"
on public.lessons
for select
using (
    is_public = true
    or auth.uid() = user_id
);

create policy "Users can create lessons"
on public.lessons
for insert
with check (auth.uid() = user_id);

create policy "Users can update their lessons"
on public.lessons
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their lessons"
on public.lessons
for delete
using (auth.uid() = user_id);


-- ============================================================
-- COMMENTS RLS
-- ============================================================

create policy "Comments are publicly viewable"
on public.comments
for select
using (true);

create policy "Users can create comments"
on public.comments
for insert
with check (auth.uid() = user_id);

create policy "Users can update their comments"
on public.comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their comments"
on public.comments
for delete
using (auth.uid() = user_id);


-- ============================================================
-- LIKES RLS
-- ============================================================

create policy "Likes are publicly viewable"
on public.likes
for select
using (true);

create policy "Users can create likes"
on public.likes
for insert
with check (auth.uid() = user_id);

create policy "Users can remove their likes"
on public.likes
for delete
using (auth.uid() = user_id);
-- CosmicTrotter community setup for public story requests, likes, and comments.
-- Paste this into Supabase SQL Editor, then set Netlify env vars:
-- SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.

create extension if not exists pgcrypto;

create table if not exists public.community_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('topic', 'article')),
  page_slug text,
  title text not null check (char_length(trim(title)) between 3 and 180),
  description text not null default '' check (char_length(description) <= 1200),
  author_name text not null check (char_length(trim(author_name)) between 2 and 90),
  source_page text,
  source_title text,
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists community_items_article_page_slug_key
  on public.community_items (page_slug)
  where type = 'article';

create index if not exists community_items_type_created_idx
  on public.community_items (type, created_at desc);

create index if not exists community_items_type_likes_idx
  on public.community_items (type, likes_count desc, created_at desc);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.community_items(id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 2 and 90),
  comment text not null check (char_length(trim(comment)) between 1 and 1200),
  created_at timestamptz not null default now()
);

create index if not exists community_comments_item_created_idx
  on public.community_comments (item_id, created_at asc);

create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.community_items(id) on delete cascade,
  visitor_key text not null check (char_length(trim(visitor_key)) between 8 and 140),
  created_at timestamptz not null default now(),
  unique (item_id, visitor_key)
);

create index if not exists community_likes_item_idx
  on public.community_likes (item_id);

create or replace function public.set_community_item_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_community_item_updated_at on public.community_items;
create trigger set_community_item_updated_at
before update on public.community_items
for each row execute function public.set_community_item_updated_at();

create or replace function public.refresh_community_like_count(target_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_items
  set likes_count = (
    select count(*)::integer
    from public.community_likes
    where item_id = target_item_id
  )
  where id = target_item_id;
end;
$$;

create or replace function public.refresh_community_comment_count(target_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_items
  set comments_count = (
    select count(*)::integer
    from public.community_comments
    where item_id = target_item_id
  )
  where id = target_item_id;
end;
$$;

create or replace function public.community_like_count_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.refresh_community_like_count(new.item_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.refresh_community_like_count(old.item_id);
    return old;
  end if;
  return null;
end;
$$;

create or replace function public.community_comment_count_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.refresh_community_comment_count(new.item_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.refresh_community_comment_count(old.item_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists community_like_count_after_insert on public.community_likes;
create trigger community_like_count_after_insert
after insert on public.community_likes
for each row execute function public.community_like_count_trigger();

drop trigger if exists community_like_count_after_delete on public.community_likes;
create trigger community_like_count_after_delete
after delete on public.community_likes
for each row execute function public.community_like_count_trigger();

drop trigger if exists community_comment_count_after_insert on public.community_comments;
create trigger community_comment_count_after_insert
after insert on public.community_comments
for each row execute function public.community_comment_count_trigger();

drop trigger if exists community_comment_count_after_delete on public.community_comments;
create trigger community_comment_count_after_delete
after delete on public.community_comments
for each row execute function public.community_comment_count_trigger();

alter table public.community_items enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

drop policy if exists "community items are publicly readable" on public.community_items;
create policy "community items are publicly readable"
on public.community_items
for select
to anon, authenticated
using (true);

drop policy if exists "community items can be publicly created" on public.community_items;
create policy "community items can be publicly created"
on public.community_items
for insert
to anon, authenticated
with check (
  type in ('topic', 'article')
  and char_length(trim(title)) between 3 and 180
  and char_length(trim(author_name)) between 2 and 90
);

drop policy if exists "community comments are publicly readable" on public.community_comments;
create policy "community comments are publicly readable"
on public.community_comments
for select
to anon, authenticated
using (true);

drop policy if exists "community comments can be publicly created" on public.community_comments;
create policy "community comments can be publicly created"
on public.community_comments
for insert
to anon, authenticated
with check (
  char_length(trim(author_name)) between 2 and 90
  and char_length(trim(comment)) between 1 and 1200
);

drop policy if exists "community likes can be publicly created" on public.community_likes;
create policy "community likes can be publicly created"
on public.community_likes
for insert
to anon, authenticated
with check (char_length(trim(visitor_key)) between 8 and 140);

-- Intentionally no public update/delete policies.
-- Public visitors can read, create suggestions, create comments, and create one like per browser key.

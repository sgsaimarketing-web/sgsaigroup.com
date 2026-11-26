-- ============================================================================
-- SGS AI Group CMS — Supabase Postgres + Storage + Row-Level Security Schema
-- Run this entire script once in Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Authorized CMS Administrators allowlist
create table if not exists public.cms_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Seed primary studio administrator (update or add more admin emails as needed)
insert into public.cms_admins (email)
values ('sgsaimarketing@gmail.com')
on conflict (email) do nothing;

alter table public.cms_admins enable row level security;

drop policy if exists "Admins can read own allowlist row" on public.cms_admins;
create policy "Admins can read own allowlist row"
  on public.cms_admins
  for select
  to authenticated
  using (lower(auth.jwt() ->> 'email') = lower(email));

-- Helper function for RLS admin check
create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2. Live Website Content JSONB Table
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read published site content" on public.site_content;
create policy "Public can read published site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Only CMS admins can insert site content" on public.site_content;
create policy "Only CMS admins can insert site content"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_cms_admin());

drop policy if exists "Only CMS admins can update site content" on public.site_content;
create policy "Only CMS admins can update site content"
  on public.site_content
  for update
  to authenticated
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

drop policy if exists "Only CMS admins can delete site content" on public.site_content;
create policy "Only CMS admins can delete site content"
  on public.site_content
  for delete
  to authenticated
  using (public.is_cms_admin());

-- 3. Immutable Version History Snapshots (Rollback & Audit Trail)
create table if not exists public.site_content_versions (
  id bigint generated always as identity primary key,
  content_id text not null default 'live',
  data jsonb not null,
  created_at timestamptz not null default now(),
  created_by text
);

alter table public.site_content_versions enable row level security;

drop policy if exists "Only CMS admins can read version history" on public.site_content_versions;
create policy "Only CMS admins can read version history"
  on public.site_content_versions
  for select
  to authenticated
  using (public.is_cms_admin());

drop policy if exists "Only CMS admins can insert version history" on public.site_content_versions;
create policy "Only CMS admins can insert version history"
  on public.site_content_versions
  for insert
  to authenticated
  with check (public.is_cms_admin());

-- Explicit PostgreSQL role privileges (required alongside RLS on newer Supabase projects)
grant usage on schema public to anon, authenticated;

grant select on public.cms_admins to authenticated;
grant execute on function public.is_cms_admin() to anon, authenticated;

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

grant select, insert on public.site_content_versions to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- 4. Enable Realtime Cross-Device Updates on site_content
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_content'
  ) then
    alter publication supabase_realtime add table public.site_content;
  end if;
end
$$;

-- 5. Public CDN Storage Bucket for Images & Videos (50MB max per file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage Object RLS Policies
drop policy if exists "Public can view CMS media" on storage.objects;
create policy "Public can view CMS media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cms-media');

drop policy if exists "Only CMS admins can upload media" on storage.objects;
create policy "Only CMS admins can upload media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'cms-media' and public.is_cms_admin());

drop policy if exists "Only CMS admins can update media" on storage.objects;
create policy "Only CMS admins can update media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'cms-media' and public.is_cms_admin())
  with check (bucket_id = 'cms-media' and public.is_cms_admin());

drop policy if exists "Only CMS admins can delete media" on storage.objects;
create policy "Only CMS admins can delete media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cms-media' and public.is_cms_admin());

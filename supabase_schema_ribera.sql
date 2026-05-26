-- Ribera Audiovisual — Supabase schema para editor visual
-- Ejecutar en Supabase > SQL Editor.

create table if not exists public.site_content (
  id text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_content enable row level security;

drop policy if exists "site content public read" on public.site_content;
create policy "site content public read"
on public.site_content
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "ribera admin insert content" on public.site_content;
create policy "ribera admin insert content"
on public.site_content
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com');

drop policy if exists "ribera admin update content" on public.site_content;
create policy "ribera admin update content"
on public.site_content
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com')
with check ((auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com');

-- Bucket público para imágenes y videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ribera-media',
  'ribera-media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ribera media public read" on storage.objects;
create policy "ribera media public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'ribera-media');

drop policy if exists "ribera admin upload media" on storage.objects;
create policy "ribera admin upload media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ribera-media'
  and (auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com'
);

drop policy if exists "ribera admin update media" on storage.objects;
create policy "ribera admin update media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'ribera-media'
  and (auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com'
)
with check (
  bucket_id = 'ribera-media'
  and (auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com'
);

drop policy if exists "ribera admin delete media" on storage.objects;
create policy "ribera admin delete media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ribera-media'
  and (auth.jwt() ->> 'email') = 'ribera.audiovisuales@gmail.com'
);

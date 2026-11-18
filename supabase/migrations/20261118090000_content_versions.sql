-- Snapshot history for admin edits, so a bad save can be rolled back.
-- One row is written (by the app, server-side) just BEFORE a section or
-- site-content entry is overwritten; the app keeps the 20 newest per entry.

create table if not exists public.content_versions (
  id          uuid primary key default gen_random_uuid(),
  entity      text not null check (entity in ('project_section', 'site_content')),
  entity_key  text not null,          -- project_sections.id, or site_content.key
  label       text,                   -- e.g. "yangbei / process"
  content     jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);

create index if not exists content_versions_entity_idx
  on public.content_versions (entity, entity_key, created_at desc);

alter table public.content_versions enable row level security;

create policy "Authenticated users can read content_versions"
  on public.content_versions for select to authenticated using (true);
create policy "Authenticated users can insert content_versions"
  on public.content_versions for insert to authenticated with check (true);
create policy "Authenticated users can delete content_versions"
  on public.content_versions for delete to authenticated using (true);

-- Optional English subtitle for the homepage Bento card (shown under the
-- Chinese `title`). Must be applied before deploying the admin form change
-- that writes this column, or saving project details will fail.
alter table public.projects
  add column if not exists title_en text;

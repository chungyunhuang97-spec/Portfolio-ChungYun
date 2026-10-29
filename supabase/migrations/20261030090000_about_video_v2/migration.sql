-- =====================================================================
-- About + Video Works v2 -- migration
--
-- 執行順序：
--   1. migration.sql（本檔）  建立新表 + 搬移既有資料（可重複執行，不會重複搬）
--   2. audit.sql              列出待補清單（唯讀）
--   需要還原時：rollback.sql  刪除本檔建立的表（舊表與舊資料完全不受影響）
--
-- 在 Supabase Dashboard > SQL Editor 貼上整份執行即可（整份包在一個
-- transaction 內，中途失敗會全部還原）。
--
-- 舊表 video_works / reel_links / video_section_settings / site_content
-- 只讀不改：首頁在 Phase 2 切換之前仍然讀舊表。
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. About
-- ---------------------------------------------------------------------

-- 單列設定表：id 固定為 true，保證只有一列。
create table if not exists public.about_content (
  id boolean primary key default true check (id),
  statement text not null,
  highlight_words text[] not null default '{}',
  intro text not null default '',
  portrait_image text,
  portrait_alt text,
  resume_file text,
  contact_link text,
  show_tools_marquee boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint about_content_portrait_alt_required
    check (portrait_image is null or coalesce(btrim(portrait_alt), '') <> '')
);

create table if not exists public.about_traits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  -- 80 字上限由後台表單把關，不寫成 DB constraint：搬入的既有文字可能超過。
  description text not null default '',
  icon text not null default 'none'
    check (icon in ('star', 'spiral', 'eye', 'zigzag', 'plus', 'none')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.about_stats (
  id uuid primary key default gen_random_uuid(),
  value int not null,
  suffix text,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.about_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Video
-- ---------------------------------------------------------------------

create table if not exists public.video_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  -- 沿用舊版 video_works 的選填欄位
  level_label text,
  brief_image_url text,
  tags text[] not null default '{}',
  -- 舊版「查看完整帳號」連結（video_works.video_url 不是可嵌入影片時）
  profile_url text,
  -- 搬移來源，讓本檔可以重複執行而不重複搬
  legacy_video_work_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.video_categories (id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('instagram', 'youtube', 'vimeo', 'mp4')),
  source_url text,
  video_file text,
  poster_image text,
  poster_alt text,
  poster_time numeric,
  preview_clip text,
  aspect_ratio text not null default '9:16' check (aspect_ratio in ('9:16', '16:9', '1:1', '4:5')),
  duration text,
  roles text[] not null default '{}',
  client text,
  year int,
  captions_url text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  legacy_video_work_id uuid unique,
  legacy_reel_link_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint videos_source_required check (
    (source_type = 'mp4' and video_file is not null)
    or (source_type <> 'mp4' and source_url is not null)
  ),
  constraint videos_poster_alt_required
    check (poster_image is null or coalesce(btrim(poster_alt), '') <> '')
  -- 「Instagram 沒縮圖不能設為可見」只在後台新增/編輯時檢查，不寫進 DB：
  -- 搬移進來的 Instagram 影片要維持可見、先用海報卡顯示。
);

-- 每個分類最多 1 支預設選取影片
create unique index if not exists videos_one_featured_per_category
  on public.videos (category_id) where is_featured;

create index if not exists videos_category_sort_idx on public.videos (category_id, sort_order);

-- ---------------------------------------------------------------------
-- 3. RLS：訪客只讀（影片只讀可見的），登入的後台可讀寫
-- ---------------------------------------------------------------------

alter table public.about_content enable row level security;
alter table public.about_traits enable row level security;
alter table public.about_stats enable row level security;
alter table public.about_tools enable row level security;
alter table public.video_categories enable row level security;
alter table public.videos enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['about_content', 'about_traits', 'about_stats', 'about_tools'] loop
    execute format('drop policy if exists "%1$s public read" on public.%1$I', t);
    execute format('create policy "%1$s public read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "%1$s admin write" on public.%1$I', t);
    execute format('create policy "%1$s admin write" on public.%1$I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

drop policy if exists "video_categories public read" on public.video_categories;
create policy "video_categories public read" on public.video_categories
  for select to anon using (is_visible);
drop policy if exists "video_categories admin all" on public.video_categories;
create policy "video_categories admin all" on public.video_categories
  for all to authenticated using (true) with check (true);

drop policy if exists "videos public read" on public.videos;
create policy "videos public read" on public.videos
  for select to anon using (
    is_visible and exists (
      select 1 from public.video_categories c where c.id = category_id and c.is_visible
    )
  );
drop policy if exists "videos admin all" on public.videos;
create policy "videos admin all" on public.videos
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- 4. 搬移：About（site_content -> about_*）
-- ---------------------------------------------------------------------

insert into public.about_content (id, statement, highlight_words, intro, contact_link)
select
  true,
  'I BLEND MARKETING LOGIC WITH SYSTEM-DRIVEN DESIGN.',
  array['MARKETING LOGIC', 'SYSTEM-DRIVEN'],
  coalesce((select content ->> 'text' from public.site_content where key = 'about_me'), ''),
  'mailto:chungyunhuang97@gmail.com'
on conflict (id) do nothing;

-- 三個特質：去掉結尾被截斷的「...」/「…」，完整文字列入 audit 待補
insert into public.about_traits (title, description, sort_order)
select
  coalesce(item ->> 'title', ''),
  regexp_replace(btrim(coalesce(item ->> 'desc', '')), '\s*(\.{2,}|…)+$', ''),
  ord::int
from public.site_content sc,
  jsonb_array_elements(coalesce(sc.content -> 'items', '[]'::jsonb)) with ordinality as t(item, ord)
where sc.key = 'positioning_tags'
  and not exists (select 1 from public.about_traits);

-- ---------------------------------------------------------------------
-- 5. 搬移：Video（video_works + reel_links -> video_categories + videos）
-- ---------------------------------------------------------------------

-- 分類順序沿用目前首頁：featured 在前、more 在後，各自依 sort_order
insert into public.video_categories
  (title, subtitle, description, sort_order, is_visible, level_label, brief_image_url, tags,
   profile_url, legacy_video_work_id)
select
  w.title,
  w.subtitle,
  w.description,
  row_number() over (order by (w.type = 'more'), w.sort_order, w.created_at)::int,
  w.is_active,
  w.level_label,
  w.brief_image_url,
  coalesce(w.tags, '{}'),
  -- 有 reel_links 的作品，video_url 是帳號連結；單支作品的網址若不是可辨識的影片也當帳號連結
  case
    when exists (select 1 from public.reel_links r where r.video_work_id = w.id) then w.video_url
    when w.video_url !~* '(youtube\.com|youtu\.be|instagram\.com|vimeo\.com|\.(mp4|webm|mov|m4v)(\?|$))'
      then w.video_url
  end,
  w.id
from public.video_works w
where not exists (select 1 from public.video_categories c where c.legacy_video_work_id = w.id);

-- 共用的來源判斷：URL -> source_type / YouTube id / aspect_ratio
create or replace function pg_temp.video_source_type(url text) returns text
language sql immutable as $$
  select case
    when url ~* '(youtube\.com|youtu\.be)' then 'youtube'
    when url ~* 'instagram\.com' then 'instagram'
    when url ~* 'vimeo\.com' then 'vimeo'
    when url ~* '\.(mp4|webm|mov|m4v)(\?|$)' then 'mp4'
  end
$$;

create or replace function pg_temp.youtube_poster(url text) returns text
language sql immutable as $$
  -- hqdefault 每支公開影片都有；maxresdefault 不一定存在
  select 'https://img.youtube.com/vi/' || id || '/hqdefault.jpg'
  from (
    select substring(url from '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([A-Za-z0-9_-]{6,})') as id
  ) s
  where id is not null
$$;

create or replace function pg_temp.guess_aspect(url text, is_single boolean) returns text
language sql immutable as $$
  select case
    when url ~* 'youtube\.com/shorts/' then '9:16'
    when url ~* '(youtube\.com|youtu\.be|vimeo\.com)' then '16:9'
    when url ~* 'instagram\.com' then '9:16'
    -- 自架 mp4：單支作品（婚禮、抓周）多半是橫式
    when is_single then '16:9'
    else '9:16'
  end
$$;

-- 5a. 單支作品（沒有 reel_links）-> 1 支影片
insert into public.videos
  (category_id, title, source_type, source_url, video_file, poster_image, poster_alt,
   aspect_ratio, roles, sort_order, is_visible, legacy_video_work_id)
select
  c.id,
  w.title,
  st.source_type,
  case when st.source_type <> 'mp4' then w.video_url end,
  case when st.source_type = 'mp4' then w.video_url end,
  p.poster,
  case when p.poster is not null then w.title end,
  pg_temp.guess_aspect(w.video_url, true),
  coalesce(w.role_items, '{}'),
  1,
  true,
  w.id
from public.video_works w
join public.video_categories c on c.legacy_video_work_id = w.id
cross join lateral (select pg_temp.video_source_type(w.video_url) as source_type) st
cross join lateral (
  select coalesce(nullif(btrim(w.thumbnail_url), ''), pg_temp.youtube_poster(w.video_url)) as poster
) p
where st.source_type is not null
  and not exists (select 1 from public.reel_links r where r.video_work_id = w.id)
  and not exists (select 1 from public.videos v where v.legacy_video_work_id = w.id);

-- 5b. 有 reel_links 的作品 -> 每個 link 一支影片（Instagram 沒縮圖也維持可見）
insert into public.videos
  (category_id, title, source_type, source_url, video_file, poster_image, poster_alt,
   aspect_ratio, roles, sort_order, is_visible, legacy_reel_link_id)
select
  c.id,
  r.label,
  st.source_type,
  case when st.source_type <> 'mp4' then r.url end,
  case when st.source_type = 'mp4' then r.url end,
  p.poster,
  case when p.poster is not null then r.label end,
  pg_temp.guess_aspect(r.url, false),
  coalesce(w.role_items, '{}'),
  row_number() over (partition by r.video_work_id order by r.sort_order, r.created_at)::int,
  r.is_active,
  r.id
from public.reel_links r
join public.video_works w on w.id = r.video_work_id
join public.video_categories c on c.legacy_video_work_id = w.id
cross join lateral (select pg_temp.video_source_type(r.url) as source_type) st
cross join lateral (select pg_temp.youtube_poster(r.url) as poster) p
where st.source_type is not null
  and not exists (select 1 from public.videos v where v.legacy_reel_link_id = r.id);

commit;

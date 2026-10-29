-- =====================================================================
-- About + Video Works v2 -- rollback
--
-- 執行順序：只在需要還原 migration.sql 時執行。
--   執行後回到 migration 之前的狀態：刪除 migration.sql 建立的 6 張表
--   （連同其中的資料、policy、index）。
--
-- 舊表 video_works / reel_links / video_section_settings / site_content
-- 從來沒被 migration 修改過，所以不需要還原、也不會受影響。
--
-- 注意：在新後台（/admin/about、/admin/videos）做過的編輯會一起消失。
-- =====================================================================

begin;

drop table if exists public.videos;
drop table if exists public.video_categories;
drop table if exists public.about_tools;
drop table if exists public.about_stats;
drop table if exists public.about_traits;
drop table if exists public.about_content;

commit;

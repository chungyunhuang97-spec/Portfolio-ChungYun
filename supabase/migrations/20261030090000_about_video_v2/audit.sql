-- =====================================================================
-- About + Video Works v2 -- audit（待補清單，唯讀）
--
-- 執行順序：在 migration.sql 之後執行，之後隨時可以重跑。
--   不會修改任何資料。結果每一列是一個待補項目：
--   area（區塊）/ item（哪一筆）/ issue（缺什麼）/ detail（補充）
-- =====================================================================

with
legacy_traits as (
  select
    ord::int as sort_order,
    item ->> 'title' as title,
    btrim(coalesce(item ->> 'desc', '')) as original
  from public.site_content sc,
    jsonb_array_elements(coalesce(sc.content -> 'items', '[]'::jsonb)) with ordinality as t(item, ord)
  where sc.key = 'positioning_tags'
),
about as (
  select * from public.about_content where id
)

-- ---- Video ----------------------------------------------------------
select 'video' as area, c.title || ' / ' || v.title as item,
  '缺 poster_image' as issue,
  v.source_type || case when v.source_type = 'instagram' then '（Instagram 必填，目前顯示海報卡）' else '' end as detail
from public.videos v join public.video_categories c on c.id = v.category_id
where v.poster_image is null

union all
select 'video', c.title || ' / ' || v.title,
  'aspect_ratio 是自動推測，請確認',
  v.source_type || ' -> ' || v.aspect_ratio
from public.videos v join public.video_categories c on c.id = v.category_id
where (v.legacy_video_work_id is not null or v.legacy_reel_link_id is not null)
  and v.source_type in ('instagram', 'mp4')

union all
select 'video', c.title, '分類沒有任何影片',
  coalesce('帳號連結：' || c.profile_url, '舊資料的網址無法辨識為影片，請到後台新增')
from public.video_categories c
where not exists (select 1 from public.videos v where v.category_id = c.id)

union all
select 'video', r.label, '舊 reel_link 沒有搬移（網址無法辨識）', r.url
from public.reel_links r
where not exists (select 1 from public.videos v where v.legacy_reel_link_id = r.id)

union all
select 'video', c.title || ' / ' || v.title, '缺 duration（選填）', v.source_type
from public.videos v join public.video_categories c on c.id = v.category_id
where v.duration is null

-- ---- About ----------------------------------------------------------
union all
select 'about', 'about_content', '缺 about_content（migration 沒有執行？）', null
where not exists (select 1 from about)

union all
select 'about', 'portrait_image', '缺人像照片（目前會改放大型手繪裝飾）', null
from about where portrait_image is null

union all
select 'about', 'resume_file', '缺履歷 PDF（「下載履歷」按鈕不會顯示）', null
from about where resume_file is null

union all
select 'about', 'intro', '缺介紹段落', null
from about where btrim(intro) = ''

union all
select 'about', 'statement', '宣言超過 80 字元', char_length(statement)::text || ' 字元'
from about where char_length(statement) > 80

union all
select 'about', 'highlight_words', '螢光筆字詞不在宣言中', w
from about, unnest(highlight_words) as w
where position(upper(w) in upper(statement)) = 0

union all
select 'about', 'trait: ' || t.title, '描述被截斷，請補上完整文字', l.original
from public.about_traits t
join legacy_traits l on l.sort_order = t.sort_order
where l.original ~ '(\.{2,}|…)$'

union all
select 'about', 'trait: ' || title, '描述超過 80 字', char_length(description)::text || ' 字'
from public.about_traits where char_length(description) > 80

union all
select 'about', 'about_stats', '尚未設定數字列（選填，沒設定時整列不顯示）', null
where not exists (select 1 from public.about_stats)

union all
select 'about', 'about_tools', '尚未設定工具跑馬燈（選填，沒設定時不顯示）', null
where not exists (select 1 from public.about_tools)

order by area desc, item;

# About + Video Works v2 — Phase 1 筆記

## SQL（`supabase/migrations/20261030090000_about_video_v2/`）

| 檔案 | 順序 | 用途 |
|---|---|---|
| `migration.sql` | 1 | 建立 6 張新表 + RLS + 搬移既有資料。整份是一個 transaction，可重複執行（不會重複搬） |
| `audit.sql` | 2 | 唯讀，列出待補清單 |
| `rollback.sql` | 需要時 | 刪除 6 張新表；舊表從頭到尾沒被修改 |

新表：`about_content`（單列）、`about_traits`、`about_stats`、`about_tools`、`video_categories`、`videos`。
舊表 `video_works` / `reel_links` / `video_section_settings` / `site_content` 保留不動，首頁在 Phase 2 切換前仍讀舊表。

## 履歷 PDF / 字幕 / 影片上傳：Supabase Storage 設定

上傳都進既有的 `project-media` bucket（`AdminMediaDropzone`）。到 Supabase Dashboard：

1. **Storage → Buckets → `project-media` → 右側「⋯」→ Edit bucket**
2. **Public bucket**：維持開啟（首頁直接用公開網址）
3. **Allowed MIME types**：
   - 如果是空的（代表全部允許）→ 不用改
   - 如果有填 → 加上 `application/pdf`（履歷）、`text/vtt`（字幕）、`video/mp4`、`video/webm`（影片、預覽片段），原本的 `image/*` 保留
4. **Restrict file upload size**：自架 mp4 影片需要的話調高（免費方案上限 50MB；更大的影片建議放影片服務，填網址）
5. **Policies**（Storage → Policies → `project-media`）：確認「登入使用者可上傳」的 policy 沒有限制副檔名或資料夾。新後台會上傳到 `about/portrait`、`about/resume`、`videos/<id>/...` 這些路徑

設定完，到 `/admin/about` 上傳一份 PDF 測試；失敗時上傳框會顯示 Supabase 回傳的錯誤訊息。

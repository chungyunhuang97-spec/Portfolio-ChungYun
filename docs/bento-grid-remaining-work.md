# Selected Work Bento Grid 改版 — 未完成項目（Phase 2–4）

> 這份文件整理「作品集首頁 Projects 區塊改版」還沒做的部分，供下一輪繼續接手。
> Phase 1（後台欄位 + migration + seed + 型別）已完成並 push 到
> `claude/blissful-cerf-jofuz3`（commit `deb19d0`）。以下是 **還沒做** 的 Phase 2–4，
> 以及一些延續到後續階段都要記得的既定決策。

---

## 已經定案、後續階段要沿用的決策

這些是 Phase 1 跟使用者確認過的選擇，Phase 2–4 動工時直接照做，不要重新問一次：

| 決策點 | 結論 |
|---|---|
| 「12 角藍色星星」用哪個 SVG | `DoodleSplat`（`src/components/design-system/doodles.tsx`）— Hero 裡那個帶陰影的多角藍色爆炸造型，不是 `DoodleStar` |
| DECOR cell 連結 | `/#about`（站上沒有獨立 `/about` 頁，首頁 About 區塊只有錨點） |
| 全站設定存哪 | 沿用 `site_content` 表，key = `project_grid_settings`，欄位 `enable_scroll_choreography` / `decor_cell_label` / `decor_cell_link` |
| 卡片 `sort_order` | 就是現有的 `display_order`，不是新欄位 |
| 卡片 `project_type`（Fintech/Kiosk/Hackathon 這種分類） | 就是現有的 `category` 欄位 |
| 卡片徽章欄位命名 | `badge_status`（`shipped`/`live`/`demo`/`concept`），刻意跟現有的發布狀態 `status`（draft/published/archived）分開命名避免撞名 |
| 動畫套件 | 專案已裝 `framer-motion` + `gsap`（含 ScrollTrigger），**不要再加新套件**，兩套都已存在，照 Phase 1 的選擇混用（GSAP ScrollTrigger 處理 scrub 式捲動、Framer Motion 處理一次性進場） |
| 斷點 | Tailwind v4 用 `@theme`，目前沒有自訂斷點檔。`md`=768（內建）、`lg`=1024（內建）剛好對到規格的 Tablet/Desktop 分界；**Wide ≥1440 需要新增一個自訂斷點 token**（在 `globals.css` 的 `@theme inline` 裡加 `--breakpoint-wide: 1440px`），目前還沒加 |

## 資料缺漏清單（6 個已發布案例全部缺）

Phase 1 migration 跑完後查過，以下欄位目前全部是 `null`，需要你到後台（`/admin/projects/[slug]`）手動補：

- `cover_image_url`（桌機封面，建議 1600px 寬）
- `cover_image_mobile`（手機封面）
- `cover_alt`（無障礙替代文字 — **有填封面才存得了**，是表單裡的硬性驗證）
- `outcome`（卡片上的一句成果，≤60 字）
- `year`

`role` 不用補，6 筆都已經有值。

沒有封面之前，Phase 2 的前端要照規格「前端 fallback：沒有封面時，用 card_theme 的純色底加大型編號」實作，不能假設封面一定存在。

---

## Phase 2：Bento Grid 靜態版面（尚未開始）

對應原始需求第 2–5 節。清單：

### 版面結構
- [ ] 區塊標題「01 / SELECTED WORK」+「Projects」大標，樣式對齊 Hero 的 eyebrow/name
- [ ] 斷點總表實作：Mobile S (<375) / Mobile (375–767) / Tablet (768–1023) / Desktop (1024–1439) / Wide (≥1440，**需新增自訂斷點**)
- [ ] Desktop/Wide 12 欄網格：`large`=col-span-6 row-span-2、`wide`=col-span-6、`small`=col-span-3、DECOR cell=col-span-3 固定最後一格
- [ ] Tablet 6 欄網格：`large`/`wide`=span 6、`small`=span 3、DECOR cell=span 6 高度減半
- [ ] Mobile 單欄：依 `display_order` 排序，`large` 封面比例 4:5、其他 4:3，封面優先讀 `cover_image_mobile`
- [ ] 橫向手機／小高度螢幕（寬 ≥768 高 <500）特殊處理：用 Tablet 網格，`large` 改左右排列
- [ ] `grid-auto-flow: dense` 自動補位，DECOR cell 永遠固定在最後一格
- [ ] 卡片位置／尺寸完全由後台 `card_size`/`display_order`/`is_visible` 決定，前端不寫死
- [ ] 卡片內部排版用 container queries（`@container`），不要只靠視窗寬度

### 卡片內容
- [ ] 封面圖（`next/image`，依卡片尺寸給不同 `sizes`，lazy load，`large` 卡優先載入）
- [ ] 大號編號（01–06，依 `display_order` 自動產生，不另外存）
- [ ] 標題：`title`（中文為主）＋ 考慮是否需要英文副標欄位（目前 schema 沒有 `title_en`，原規格提到 `title_zh`/`title_en`，**這點 Phase 1 沒處理，需要再跟使用者確認是否要新增欄位，或是沿用現有 `subtitle`**）
- [ ] 一句成果 `outcome`，沒填就 fallback 顯示 `subtitle`
- [ ] Meta 列：`role` · `category` · `year`，缺的欄位不顯示、也不留多餘的 `·`
- [ ] `badge_status` 徽章（有值才顯示）
- [ ] Tags：沿用現有 `tags[]`，各斷點數量上限用 `max_tags_on_card`（small 固定 2，覆寫後台設定）
- [ ] 右上角 ↗ 箭頭，整張卡是一個 `<a>`，內部不得巢狀其他連結

### 視覺規格
- [ ] 區塊奶油色底（`--color-cream`），跟 Hero 橘紅分段
- [ ] `card_theme` 四色對應卡片底色/文字色，**實際用對比工具檢查 WCAG AA**（藍字在橘紅底上大概率不夠，可能要全部改奶油色文字）
- [ ] 圓角語言跟 Navbar pill 一致（桌機 ~24–28px、手機 ~20px），加進共用 token
- [ ] `decoration` 四選一渲染（重用 `doodles.tsx` 既有 SVG，不重畫），`decoration_position` 四角定位，不蓋到封面主體
- [ ] Hover（`@media (hover: hover) and (pointer: fine)`）：卡片上浮 4px + ≤1deg 旋轉、封面放大 1.03、3D tilt、`hover_preview_video` 換播（懶載入，hover 才載入影片檔）
- [ ] 觸控裝置：不載入 hover 影片、無 tilt、`:active` scale 0.98、箭頭常駐顯示
- [ ] 鍵盤 focus 樣式（跟 hover 同一套上浮效果）、所有可點擊元素 ≥44×44px

### 手機瀏覽器與圖片
- [ ] 用 `svh`/`dvh` 取代 `100vh`
- [ ] `env(safe-area-inset-*)` 處理
- [ ] iOS overscroll bounce 不能讓進場動畫出錯（這點其實是 Phase 3 的範圍，但要在 Phase 2 定版面時一併考慮捲動容器結構）
- [ ] `next/image` 設定（已有 `next.config.ts` 的 `remotePatterns` 允許 Supabase Storage，不用再改）、CLS 防抖（預留比例空間）

---

## Phase 3：主秀動態「Star Drop」（尚未開始）

對應原始需求第 6 節核心動畫。清單：

- [ ] Hero → 專案區轉場：`DoodleSplat` 跟著捲動進度（scrub，用 GSAP ScrollTrigger）旋轉 180–360deg、縮小、下移，落點是 DECOR cell（FLIP 或 sticky 容器內移動，不做兩顆淡入淡出交換）
- [ ] 落地瞬間：scale 1.15→1 彈跳 + `clip-path: circle()` 擴散波紋，把背景從橘紅染成奶油色（~600ms）
- [ ] 卡片 Poster Paste：依「離星星遠近」stagger 進場（~60ms 間隔），`translateY(40px) rotate(±3~6deg) scale(0.92) opacity(0)` → 最終態，帶 spring 回彈
- [ ] 初始旋轉角度依 index 交替，或讀後台 `enter_rotation`（Phase 1 已有這個欄位，目前全部是 `null`，前端要實作「null 時依 index 自動交替」的 fallback 邏輯）
- [ ] 所有時長/easing/stagger 數值集中在新的 `motion.config.ts`
- [ ] 視窗尺寸改變/轉向時重新計算星星落點
- [ ] 不劫持捲動（no scroll-jacking）

---

## Phase 4：配角動態（尚未開始）

對應原始需求第 6 節配角部分：

- [ ] 配角 1：編號翻牌（split-flap，300ms），成本太高就改用遮罩滑入（mask reveal）
- [ ] 配角 2：手繪裝飾描邊 —— `spiral`/`eye`/`zigzag` 用 `stroke-dashoffset`（400–600ms）；`star`/`plus` 用 scale+rotate 彈出；後台 `animate_decoration=false` 時直接顯示（Phase 1 已有這個欄位可讀）
- [ ] 配角 3：區塊標題遮罩 —— eyebrow 先淡入，`Projects` 大標逐字下方遮罩滑入（stagger 30ms）
- [ ] 封面圖視差（可選，≤8%，僅 Desktop/Wide）
- [ ] 觸發時機：星星轉場綁 Hero 底部→專案區頂部的 scroll 區間；卡片/標題進場在專案區頂部進入視窗 30%（Mobile 15%）觸發；錨點直達或重新整理在專案區以下時 **跳過所有進場**，直接顯示最終狀態
- [ ] RWD 動態對照表（原規格表格）：Mobile/觸控把「星星飛行」改成原地旋轉彈出、Poster Paste 只留位移+淡入、編號翻牌改遮罩滑入、封面視差只在 Desktop/Wide
- [ ] 無障礙降級：`prefers-reduced-motion: reduce` 或 `enable_scroll_choreography=false`（Phase 1 已建好這個全站設定）時，只保留 ≤200ms opacity 淡入；JS 未載入時內容必須完整可見（初始隱藏態只能由 JS 加 class 觸發，不能寫死在 CSS）；動畫過程中卡片仍可點擊，不可用 `pointer-events: none` 鎖住

---

## 驗收清單（Phase 2–4 完成後才能打勾，原規格第 9 節，目前全部未做）

- [ ] 390 / 834 / 1280 / 1440 / 1920 五種寬度截圖
- [ ] 1440×900 下六個專案標題完整可見
- [ ] 後台改 `card_size`/`display_order`/`card_theme`/`is_visible` 後前台正確反映
- [ ] 舊的 `/work/[slug]` 連結全部正常（本次沒有、也不該動這個路由）
- [ ] 封面 lazy load、正確 `sizes`、無 CLS
- [ ] 實機測試至少一台 iPhone Safari、一台 Android Chrome
- [ ] 320px 無橫向捲軸；1920/2560px 內容置中不過寬
- [ ] 橫向手機正常瀏覽；iOS Safari 網址列收合展開不跳動
- [ ] 觸控裝置不載入 hover 影片，按下有回饋；所有可點擊元素 ≥44×44px
- [ ] Hero→專案區螢幕錄影（Desktop + Mobile）
- [ ] Performance：捲動 ≥50fps、CLS≈0；進場總長 ≤1.4 秒；不重播；錨點/重新整理直接顯示最終狀態；調整視窗/轉向後星星落點仍正確
- [ ] Lighthouse 無障礙 ≥95；鍵盤可操作、focus 清楚；reduced motion / `enable_scroll_choreography=false` / JS 停用三種情況內容都完整；文字對比 WCAG AA

---

## 需要使用者決定或補充的開放問題

1. **英文副標欄位**：原規格要卡片顯示 `title_zh` + `title_en`，但現有 schema 只有 `title`（中文）跟 `subtitle`（一句話描述，不是英文標題）。Phase 1 沒加 `title_en` 欄位 —— Phase 2 動工前要先問清楚：
   - (a) 新增 `title_en` 欄位，還是
   - (b) 直接不做英文副標，只顯示中文標題。
2. **封面圖**：6 個案例目前都沒有封面，Phase 2 的視覺驗收（截圖、CLS 檢查）都要等封面補上才有意義 —— 建議請使用者先到後台把至少 metro（large）跟 tct/wedding（wide）的封面補上，否則 Phase 2 做完看到的都是純色 fallback。
3. **`@theme` 自訂斷點**：加 `wide:1440px` breakpoint token 這個改動會動到 `globals.css`，雖然風險低（純新增），但開工前知會一聲。

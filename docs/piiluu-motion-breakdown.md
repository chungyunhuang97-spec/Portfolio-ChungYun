# Piiluu 原版動態拆解

這份文件記錄舊版 piiluu 頁面(Framer 託管,`https://huangchungyun-portfolio.framer.website/piiluu`)實際使用的動態效果，供之後把新版（Figma 重製稿）**開發回 code** 時對照使用。分類方式沿用 [`case-study-design-conventions.md`](./case-study-design-conventions.md) 的「結構層 / 個性層」框架：能直接沿用現有 `design-system/` 動效元件的歸在結構層，piiluu 專屬、需要新寫的歸在個性層。

> 觀察方式：直接在瀏覽器裡操作舊站台並用截圖比對，Framer 的實際 bundle 是混淆過的，所以以下是「看得到的行為」規格，不是逐行還原原始程式碼。實作時請以視覺行為為準，技術手段可以自由選擇（framer-motion / CSS）。

---

## 1. Hero — 「SCROLL TO UNLOCK」pinned 開場（Piiluu 專屬招牌動效，需新寫）

這是整頁最獨特、也是使用者唯一明確要求保留的動態。

**行為描述：**
- Hero 進場時是 **scroll-jacked / pinned** 狀態 —— 使用者捲動滑鼠滾輪時，頁面本身不捲動，而是把捲動量轉換成一段內部的「解鎖進度」（0→1）。
- 隨進度推進：
  1. 中央的實體卡片視覺（Piiluu BNPL Platinum 卡）**朝右下角旋轉並飛出畫面**（旋轉角度隨進度增加，同時有位移，兩者同步而非分開觸發）。
  2. 卡片飛出的同時，背景一個超大字級、低對比度（很淺的灰紫色）的「PIILUU」浮水印文字（原本卡片下方就隱約看得到）**淡入放大**，成為畫面主視覺。
  3. 標題「Piiluu 皮路」的顏色在進度中會有一段**從深藍到淡紫的過渡**（推測是顏色插值，不是簡單的 opacity 疊加，兩種顏色可能是同一色相不同飽和度/明度）。
  4. 導覽列（浮動膠囊狀 nav）從「當前項目較淡、其餘正常」的初始狀態，過渡到「三個項目等透明度」的常態。
  5. 進度到達終點後，才真正開始正常文件捲動，進入下一個 section。
- 沒有觀察到明顯的 easing 動畫感（比較像純粹跟手的 scroll-linked transform，不是 spring 或固定 duration 的進場動畫）——這點跟本站目前 `SlideIn`（spring 進場）的手感不同，建議用 `useScroll` + `useTransform`（scroll-linked，非 time-based）實作，而不是套用 `SlideIn`。

**建議實作方向：**
- 新寫一個 Piiluu 專屬元件（例如 `HeroUnlock`），用 `framer-motion` 的 `useScroll`（配合一個高度足夠的 pin 容器 + `position: sticky`）取得 0–1 進度，`useTransform` 分別驅動：卡片的 `rotate` / `x` / `y` / `opacity`，浮水印的 `opacity` / `scale`，標題的顏色（`useTransform` 搭配色值插值或直接切 CSS variable）。
- 這是「個性層」的招牌動效，只屬於 Piiluu 的 Hero，不需要也不應該讓其他專案共用。
- 務必比照現有慣例加上 `prefers-reduced-motion` 保護（進度直接跳到終點、不做位移/旋轉，只保留必要的內容淡入）。

---

## 2. Interface Showcase（「關鍵介面優化與體驗重塑」）— 「SCROLL TO EXPLORE」

**已知：** 有「SCROLL TO EXPLORE」提示文字，原始素材是兩張直式的長圖（比例接近 1:2，疑似多張手機畫面拼接成一張圖），可能代表這區也有某種 scroll-driven 的畫面切換或橫向瀏覽效果。

**未確認：** 這次瀏覽時舊站在這個 scroll 區段一直卡在空白過場（可能是另一段 pinned 區間，但這次工具環境不穩定沒能穩定停在畫面中間截圖）。**建議之後要開發這段之前，先直接打開舊站實機操作確認一次**，或者既然 Figma 重製稿已經改成 4 張獨立手機 mockup 卡片（財務可視化／購物導流／支付流程／社群擴散），也可以直接決定用本站已有的、給 Metro/Nest Stay 用的 `InterfaceDesign` 進場模式（卡片 `SlideIn` 或 tab 切換），不強求跟舊站逐格一致。

---

## 3. UI Kit System（Colors / Icons / Components）— 結構層，套用一般進場動效即可

沒有觀察到特殊互動或 scroll-linked 效果，讀起來是靜態的規範展示區塊（Buttons 三態、Input 三態並排展示，不是即時互動 demo）。

**建議：** 直接套用結構層既有的 `SlideIn` / `FadeIn` 做 section 進場，不需要新寫招牌動效。

---

## 4. Efficiency 數據卡 — 結構層，直接沿用既有 CountUp

**行為描述：** 4 張卡片，數字從 0 跑到目標值（例如 -40%、100%），符合本站既有的「捲動進入視窗後觸發 CountUp」慣例。

**建議：** 直接重用 Nest Stay 的 `ScoreCard`/`AverageScore` 或 Metro 的 `CountUpValue` 邏輯（案例文件裡建議可以順便抽成 `design-system` 共用 hook，這裡是個好時機），duration 抓 1.2–1.4s、`ease: easeOut`，不需要另外設計。

---

## 5. Milestones（Installment 01–04, ACHIEVED 徽章）— 結構層，套用一般進場動效即可

沒有觀察到特殊動態，比照 Metro/Nest Stay 的卡片式時間軸／成果卡用 `SlideIn` 進場即可。「ACHIEVED」徽章本身沒有觀察到額外動畫。

---

## 6. Closing（漸層引號收尾區）— 個性層，需要幫 Piiluu 新設計一個招牌動效

**結構共用：** 版面骨架（開闔引號裝飾 + 兩行引言 + CTA 按鈕）跟 Nest Stay／Metro 的 `Closing - Proposal A 漸層引號` 元件完全共用，這部分直接重用。

**招牌動效仍待決定：** 依照慣例，每個專案的 Closing 都有自己專屬、不跨專案重複的裝飾動效（Metro 是 `DotDrift + MetallicSheen + OrbitRings`，Nest Stay 是菱形紋理飄移）。舊版 piiluu 站台在這區沒有觀察到特別設計過的動態（純文字淡入），**這是一個開放決定**，建議開發前先跟你確認一個貼合「金融信任 / 系統化」主題的收尾動效方向（例如：帳本線條緩緩畫出、資料點連成信任網絡之類的意象），不要為了有動效硬套一個。

---

## 給日後「請開發」階段的檢查清單

1. Hero 的 `HeroUnlock` 是唯一必須新寫、且行為明確的個性層動效——照上面第 1 節規格實作。
2. Interface Showcase 的 scroll 效果**需要重新確認**（未觀察完整），開發前先問一次或直接沿用 Figma 重製稿已經簡化過的卡片式呈現。
3. UI Kit / Efficiency / Milestones 三區直接沿用既有結構層動效元件，不用新寫。
4. Closing 的招牌動效方向待決定，開發前確認。
5. 全部動態記得加 `prefers-reduced-motion` 保護，比照現有 Closing 動態的先例。

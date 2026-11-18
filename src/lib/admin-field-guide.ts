/**
 * Admin field guide: human-readable names and media upload specs for the CMS
 * fields the public pages actually read.
 *
 * Everything here is derived from how each `src/app/work/<slug>/_sections/*`
 * component consumes its content (frame aspect ratio, object-fit, whether an
 * image/video is accepted) -- not guessed from the key name. When a section
 * component changes how it renders a field, update the matching entry here.
 *
 * Lookup is purely by the Storage-path-style prefix the editors already pass
 * around (`<slug>/<section_type>/<parent keys...>`), so no extra plumbing is
 * needed in the page components.
 */

export type MediaKind = "image" | "video";

export interface MediaGuide {
  /** 中文名稱 -- what the person should call this slot. */
  title: string;
  /** Where it shows up on the public page. */
  where: string;
  /** Human-readable ratio, e.g. "9:19.5（直式手機）". */
  ratio?: string;
  /** width / height, used to warn when an upload would be cropped badly. */
  ratioValue?: number;
  /** "crop" = object-cover (edges get cut); "contain" = whole image shown. */
  fit?: "crop" | "contain";
  /** Recommended pixel size / delivery advice. */
  size: string;
  /** Warn when the shorter side is narrower than this many px. */
  minWidth?: number;
  /** Accepted media kinds. GIF/WebP count as "image". */
  kinds: MediaKind[];
  /** Soft size warning for images (bytes). */
  maxImageBytes?: number;
  /** Soft size warning for videos (bytes). */
  maxVideoBytes?: number;
  /** Extra one-liner (e.g. "有影片時會自動循環靜音播放"). */
  note?: string;
}

export const HARD_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const HARD_MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const MB = 1024 * 1024;

const PHONE_SCREEN = {
  ratio: "9:19.5（直式手機畫面，375×812）",
  ratioValue: 375 / 812,
  fit: "crop" as const,
  size: "750×1624 px（或同比例）；圖片 ≤ 500KB，影片 ≤ 8MB",
  minWidth: 600,
  maxImageBytes: 500 * 1024,
  maxVideoBytes: 8 * MB,
};

const AUTOPLAY_NOTE = "影片會自動循環、靜音播放；圖片可用 PNG / JPG / WebP / GIF";

/** Segments of an editor path with array indices dropped:
 *  "tct/process/zones/0/steps/1" -> ["tct","process","zones","steps"]. */
function segments(prefix: string | undefined): string[] {
  return (prefix ?? "").split("/").filter((s) => s !== "" && !/^\d+$/.test(s));
}

interface GuideContext {
  slug: string;
  section: string;
  /** Parent keys between the section and the field (array indices removed). */
  parents: string[];
  key: string;
}

type GuideRule = {
  match: (c: GuideContext) => boolean;
  guide: MediaGuide;
};

const RULES: GuideRule[] = [
  // ---- Hero mockups -------------------------------------------------
  {
    match: (c) => c.key === "mockup_media_url" && c.slug === "piiluu",
    guide: {
      title: "Hero 手機畫面",
      where: "頁面最上方 Hero 區，右側／下方的手機 mockup",
      ...PHONE_SCREEN,
      fit: "contain",
      kinds: ["image", "video"],
      note: "完整顯示、不裁切；" + AUTOPLAY_NOTE,
    },
  },
  {
    match: (c) => c.key === "mockup_media_url" && c.slug === "yangbei",
    guide: {
      title: "Hero 前台手機畫面",
      where: "頁面最上方 Hero 區的手機 mockup（優先於下方「前台」影片欄位）",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
      note: "超出比例時會從頂端對齊裁切；" + AUTOPLAY_NOTE,
    },
  },
  {
    match: (c) => c.key === "mockup_media_url",
    guide: {
      title: "Hero 手機畫面",
      where: "頁面最上方 Hero 區的手機 mockup",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
      note: AUTOPLAY_NOTE,
    },
  },

  // ---- Piiluu: before / after showcase ---------------------------------
  {
    match: (c) => c.slug === "piiluu" && /^showcase_row\d+_(before|after)_media_url$/i.test(c.key),
    guide: {
      title: "介面優化 前／後畫面",
      where: "「關鍵介面優化與體驗重塑」每一組左右並排的手機畫面（before = 優化前、after = 優化後）",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
      note: "同一組的 before / after 請用相同尺寸；" + AUTOPLAY_NOTE,
    },
  },

  // ---- Metro: interface panels ---------------------------------------
  {
    match: (c) => c.slug === "metro" && /^(interface|companion|bonus)\w+(Desktop|Mobile)MediaUrl$/i.test(c.key),
    guide: {
      title: "介面設計手機畫面",
      where: "「核心介面優化與服務創新設計」各分頁面板中的手機 mockup（桌機版與手機版版面各有一個欄位）",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
      note: "桌機欄位建議放圖片、手機欄位建議放影片；" + AUTOPLAY_NOTE,
    },
  },

  // ---- Nest Stay -------------------------------------------------------
  {
    match: (c) => c.slug === "nest-stay" && (/^uiFlow\w+MobileMediaUrl$/i.test(c.key) || c.parents.includes("uiFlowDesktopMedia")),
    guide: {
      title: "UI 流程手機畫面",
      where: "「參與併團流程」各步驟（搜尋→瀏覽→詳情→加入→申請→完成）的手機 mockup",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
      note: "uiFlowDesktopMedia 依步驟編號（01–06）排列，同一步驟可放 1–2 張；" + AUTOPLAY_NOTE,
    },
  },
  {
    match: (c) => c.slug === "nest-stay" && c.key === "userTestingFocusMediaUrl",
    guide: {
      title: "使用者測試重點縮圖",
      where: "「使用者測試」區塊中，重點發現旁的小縮圖（約 128px 寬）",
      ratio: "1:1（接近正方形）",
      ratioValue: 1,
      fit: "crop",
      size: "400×400 px；≤ 150KB",
      minWidth: 200,
      kinds: ["image"],
      maxImageBytes: 150 * 1024,
    },
  },
  {
    match: (c) => c.slug === "nest-stay" && c.key === "iaIllustrationUrl",
    guide: {
      title: "資訊架構插圖",
      where: "「資訊架構」區塊的主插圖（手機版點擊可放大）",
      ratio: "不限（完整顯示）",
      fit: "contain",
      size: "寬 1600px 以上的 PNG / WebP；≤ 1MB",
      minWidth: 1000,
      kinds: ["image"],
      maxImageBytes: 1 * MB,
    },
  },

  // ---- NTSO / tct: exhibition zones ------------------------------------
  {
    match: (c) => c.slug === "tct" && c.key === "designImageUrl",
    guide: {
      title: "設計稿畫面（Design 模式）",
      where: "「三大展區」裝置螢幕內，切到 Design 時顯示的設計稿；有分步驟的展區每個步驟各一張",
      ratio: "3:2（橫式）",
      ratioValue: 3 / 2,
      fit: "contain",
      size: "1500×1000 px；≤ 700KB",
      minWidth: 1000,
      kinds: ["image"],
      maxImageBytes: 700 * 1024,
      note: "完整顯示、不裁切，比例不同會出現留白",
    },
  },
  {
    match: (c) => c.slug === "tct" && c.key === "liveImageUrl",
    guide: {
      title: "現場實拍／錄影（Live 模式）",
      where: "「三大展區」裝置螢幕內，切到 Live 時顯示；每個展區一支，不分步驟",
      ratio: "3:2（橫式）",
      ratioValue: 3 / 2,
      fit: "contain",
      size: "1500×1000 px 的照片，或 ≤ 15MB 的 mp4 錄影",
      minWidth: 1000,
      kinds: ["image", "video"],
      maxImageBytes: 700 * 1024,
      maxVideoBytes: 15 * MB,
      note: "影片會自動循環、靜音播放",
    },
  },
  {
    match: (c) => c.slug === "tct" && c.key === "popupImageUrl",
    guide: {
      title: "點擊彈窗畫面",
      where: "展區 2／3 點擊放大鏡後出現的「實際彈窗」截圖（不是 Design / Live 的放大版）",
      ratio: "不限（完整顯示）",
      fit: "contain",
      size: "寬 1200px 以上；≤ 700KB",
      minWidth: 800,
      kinds: ["image", "video"],
      maxImageBytes: 700 * 1024,
      maxVideoBytes: 8 * MB,
    },
  },
  {
    match: (c) => c.slug === "tct" && /^onsitePhoto([1-4])ImageUrl$/i.test(c.key),
    guide: {
      title: "展場現場照片",
      where: "「展場實況」的 2×2 照片拼貼，編號 1–4 依序是 左上、右上、左下、右下",
      ratio: "橫式 4:3 ～ 16:10 最佳",
      ratioValue: 4 / 3,
      fit: "crop",
      size: "1600px 寬；≤ 600KB",
      minWidth: 900,
      kinds: ["image"],
      maxImageBytes: 600 * 1024,
      note: "會裁切置中，主體請放在畫面中央",
    },
  },

  // ---- Wedding ----------------------------------------------------------
  {
    match: (c) => c.slug === "wedding" && c.key === "heroBackgroundImageUrl",
    guide: {
      title: "Hero 背景照（斑馬線）",
      where: "頁面最上方 Hero 的背景層，人物去背圖會疊在它上面",
      ratio: "1082:559（約 1.94:1 橫式）",
      ratioValue: 1082 / 559,
      fit: "crop",
      size: "2164×1118 px；≤ 800KB",
      minWidth: 1400,
      kinds: ["image"],
      maxImageBytes: 800 * 1024,
      note: "必須和「人物去背圖」同尺寸，否則兩層會對不齊",
    },
  },
  {
    match: (c) => c.slug === "wedding" && c.key === "heroCutoutImageUrl",
    guide: {
      title: "Hero 人物去背圖",
      where: "疊在「背景照」上方的人物，會有輕微景深陰影",
      ratio: "1082:559（與背景照完全相同）",
      ratioValue: 1082 / 559,
      fit: "crop",
      size: "2164×1118 px 的透明背景 PNG／WebP；≤ 1.5MB",
      minWidth: 1400,
      kinds: ["image"],
      maxImageBytes: 1.5 * MB,
      note: "請匯出與背景照同尺寸的透明圖層，才會精準對位",
    },
  },
  {
    match: (c) => c.slug === "wedding" && c.key === "heroImageUrl",
    guide: {
      title: "Hero 主視覺（備用）",
      where: "只有在沒有「背景照 + 去背圖」時才會使用的單張主視覺",
      ratio: "1082:559（約 1.94:1 橫式）",
      ratioValue: 1082 / 559,
      fit: "crop",
      size: "2164×1118 px；≤ 800KB",
      minWidth: 1400,
      kinds: ["image"],
      maxImageBytes: 800 * 1024,
    },
  },
  {
    match: (c) => c.slug === "wedding" && c.key === "frontComposedImageUrl",
    guide: {
      title: "紙本喜帖｜正面",
      where: "互動翻轉喜帖：始終顯示的底圖（狀態 0、1 都在）",
      ratio: "3:4（直式）",
      ratioValue: 3 / 4,
      fit: "contain",
      size: "1200×1600 px；≤ 700KB",
      minWidth: 800,
      kinds: ["image"],
      maxImageBytes: 700 * 1024,
      note: "三張喜帖圖請用同一畫布尺寸",
    },
  },
  {
    match: (c) => c.slug === "wedding" && c.key === "smallBackComposedImageUrl",
    guide: {
      title: "紙本喜帖｜小背卡",
      where: "疊在正面底圖上、點擊後淡入的小卡片",
      ratio: "3:4（與正面同畫布）",
      ratioValue: 3 / 4,
      fit: "contain",
      size: "1200×1600 px 透明背景 PNG；≤ 700KB",
      minWidth: 800,
      kinds: ["image"],
      maxImageBytes: 700 * 1024,
      note: "必須與「正面」同尺寸，才會精準疊合",
    },
  },
  {
    match: (c) => c.slug === "wedding" && c.key === "backComposedImageUrl",
    guide: {
      title: "紙本喜帖｜背面（含迴紋針）",
      where: "喜帖翻到背面時顯示",
      ratio: "3:4（直式）",
      ratioValue: 3 / 4,
      fit: "contain",
      size: "1200×1600 px；≤ 700KB",
      minWidth: 800,
      kinds: ["image"],
      maxImageBytes: 700 * 1024,
    },
  },
  {
    match: (c) => c.slug === "wedding" && c.key === "imageUrl",
    guide: {
      title: "四種媒介的展示圖",
      where: "「4 種媒介」各項目的視覺。電子喜帖（02）放在手機畫面內並裁切；其他項目為 3:4 直式完整顯示",
      ratio: "電子喜帖：9:19.5；其他：3:4",
      fit: "contain",
      size: "電子喜帖 750×1624 px；其他 1200×1600 px；≤ 700KB",
      minWidth: 600,
      kinds: ["image"],
      maxImageBytes: 700 * 1024,
    },
  },

  // ---- Yangbei: three-role walkthrough ----------------------------------
  {
    match: (c) => c.slug === "yangbei" && /^(frontend|instructor|admin)_video_url$/i.test(c.key),
    guide: {
      title: "系統操作錄影／截圖",
      where: "「三層角色」的操作展示：frontend＝居民前台、instructor＝講師端、admin＝管理後台",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
      note: "超出比例時從頂端對齊裁切；上傳 frontend 也會同步當作 Hero 備用畫面",
    },
  },
  {
    match: (c) => c.slug === "yangbei" && c.key === "screenshot_url",
    guide: {
      title: "平台截圖（備用）",
      where: "對應平台的畫面；若上面的 {frontend/instructor/admin}_video_url 有填，會優先使用那個",
      ...PHONE_SCREEN,
      kinds: ["image", "video"],
    },
  },
];

const GENERIC_GUIDE: MediaGuide = {
  title: "圖片／影片",
  where: "此欄位在前台對應的位置尚未登記，請上傳後到前台確認顯示效果",
  size: "圖片建議 ≤ 700KB、影片 ≤ 8MB",
  kinds: ["image", "video"],
  maxImageBytes: 700 * 1024,
  maxVideoBytes: 8 * MB,
};

/**
 * Resolves the upload guide for one media field.
 * `pathPrefix` is the editor's Storage-path prefix
 * (`<slug>/<section_type>/<parent keys…>`); `key` is the field's own key.
 */
export function resolveMediaGuide(pathPrefix: string | undefined, key: string | undefined): MediaGuide | null {
  const segs = segments(pathPrefix);
  if (!key && segs.length === 0) return null;
  const [slug = "", section = "", ...parents] = segs;
  const ctx: GuideContext = { slug, section, parents, key: key ?? "" };
  const rule = RULES.find((r) => r.match(ctx));
  return rule ? rule.guide : GENERIC_GUIDE;
}

// ---------------------------------------------------------------------------
// Pre-defined guides for the non-section forms (project cover, hover preview)
// ---------------------------------------------------------------------------

export const COVER_DESKTOP_GUIDE: MediaGuide = {
  title: "專案封面（桌機）",
  where: "首頁 Bento 卡片，桌機／平板顯示",
  ratio: "4:3",
  ratioValue: 4 / 3,
  fit: "crop",
  size: "1600×1200 px；≤ 400KB",
  minWidth: 1000,
  kinds: ["image"],
  maxImageBytes: 400 * 1024,
  note: "卡片會依 Bento 大小裁切，主體請放在中央",
};

export const COVER_MOBILE_GUIDE: MediaGuide = {
  title: "專案封面（手機）",
  where: "首頁 Bento 卡片，手機顯示；留空則使用桌機封面",
  ratio: "4:5",
  ratioValue: 4 / 5,
  fit: "crop",
  size: "900×1125 px；≤ 300KB",
  minWidth: 700,
  kinds: ["image"],
  maxImageBytes: 300 * 1024,
};

export const HOVER_PREVIEW_GUIDE: MediaGuide = {
  title: "Hover 預覽影片",
  where: "首頁 Bento 卡片，滑鼠移上去時淡入播放（僅有滑鼠的裝置）",
  size: "3–6 秒 mp4／webm，≤ 3MB",
  kinds: ["video"],
  maxVideoBytes: 3 * MB,
  note: "會靜音循環；請與封面同比例",
};

// ---------------------------------------------------------------------------
// Text field labels
// ---------------------------------------------------------------------------

export interface FieldLabel {
  label: string;
  hint?: string;
}

/** Keys that mean the same thing in every project, whichever section they sit in. */
const COMMON: Record<string, FieldLabel> = {
  title: { label: "標題" },
  titleLine2: { label: "主標題第二行" },
  subtitle: { label: "副標題" },
  subheading: { label: "區塊副標題" },
  heading: { label: "區塊標題" },
  kicker: { label: "眉標", hint: "標題上方的小字" },
  eyebrow: { label: "眉標", hint: "標題上方的小字" },
  tagline: { label: "標語（條列）", hint: "每一列為一句，顯示在 Hero" },
  badges: { label: "標籤徽章（條列）", hint: "Hero 下方的小標籤，每列一個" },
  stats: { label: "數據亮點", hint: "每項包含「數值」與「說明」" },
  timeframeLabel: { label: "時程標示", hint: "Hero 上的時間小標，例如「2024 / 6 - 8」" },
  text: { label: "內文" },
  note: { label: "補充說明", hint: "區塊內的引導文字或註記" },
  items: { label: "項目列表" },
  position: { label: "我的職位與職責" },
  decision_ownership: { label: "我主導的決策" },
  ai_collaboration: { label: "AI 協作分工" },
  closingQuote: { label: "結語金句", hint: "頁尾大字引言" },
  closingBody: { label: "結語內文" },
  closingSubtitle: { label: "結語副標" },
  closingBodyMobile: { label: "結語內文（手機版）", hint: "手機版斷行專用" },
  closingSubtitleMobile: { label: "結語副標（手機版）", hint: "手機版斷行專用" },
  status: { label: "目前狀態" },
  demo_url: { label: "Demo 連結" },
  contribution: { label: "我的貢獻" },
  mockup_media_url: { label: "Hero 主視覺" },

  // array item keys
  desc: { label: "說明" },
  description: { label: "說明" },
  number: { label: "編號／數值" },
  value: { label: "數值" },
  label: { label: "標籤" },
  tag: { label: "標籤" },
  name: { label: "名稱" },
  unit: { label: "單位" },
  delta: { label: "變化幅度" },
  features: { label: "功能重點（條列）" },
  painPoint: { label: "痛點" },
  pain: { label: "痛點" },
  solution: { label: "解法" },
  tabLabel: { label: "分頁標籤（桌機）" },
  mobileTabLabel: { label: "分頁標籤（手機）" },
  mobileDesc: { label: "說明（手機版）" },
  desktopDesc: { label: "說明（桌機版）" },
  before: { label: "改版前" },
  after: { label: "改版後" },
  decision: { label: "我的決策" },
  origin: { label: "出發點" },
  touchpoint: { label: "接觸點" },
  date: { label: "日期" },
  time: { label: "時間" },
  type: { label: "類型" },
  icon: { label: "圖示名稱" },
  hex: { label: "色碼" },
  state: { label: "狀態" },
  variant: { label: "樣式" },
  count: { label: "人數" },
  focus: { label: "訪談重點" },
  segment: { label: "受訪族群" },
  role: { label: "角色" },
  system: { label: "系統" },
  owner: { label: "負責人" },
  phase: { label: "階段" },
  callout: { label: "提示框文字" },
  stepNumber: { label: "步驟編號" },
  sectionNumber: { label: "區塊編號" },
  sectionTitle: { label: "區塊標題" },
  tabs: { label: "分頁內容" },
  steps: { label: "步驟" },
  gallery: { label: "圖庫" },
  spotlight: { label: "重點亮點" },
  highlights: { label: "亮點（條列）" },
  tech: { label: "使用技術" },
  titleEn: { label: "英文標題" },
  index: { label: "排序編號" },
  demoLabel: { label: "Demo 按鈕文字" },
  demoUrl: { label: "Demo 連結" },
  youtubeUrl: { label: "YouTube 連結" },
  url: { label: "連結" },
  auth: { label: "登入方式" },
  color: { label: "代表色" },
  id: { label: "識別碼（勿改）", hint: "程式用來對應畫面，修改會讓畫面對不上" },
  decor_cell_link: { label: "裝飾格連結", hint: "例如 /#about" },
  decor_cell_label: { label: "裝飾格文字" },
  tech_stack: { label: "技術棧" },
  narrative: { label: "一句話敘事" },
  admin_highlights: { label: "後台亮點（條列）" },
  frontend_highlights: { label: "前台亮點（條列）" },
  instructor_highlights: { label: "講師端亮點（條列）" },
  designCaption: { label: "Design 模式圖說" },
  liveCaption: { label: "Live 模式圖說" },
  mediaLabels: { label: "前／後畫面標籤", hint: "兩個值：左邊（優化前）、右邊（優化後）" },
  beforeVariant: { label: "「優化前」標籤配色", hint: "填 blue 會變藍底；留空為預設" },
};

/** Project-specific overrides, keyed "slug.key". */
const SPECIFIC: Record<string, FieldLabel> = {
  // Metro
  "metro.mobileContribution": { label: "我的貢獻（手機版）" },
  "metro.mobileRole": { label: "我的角色（手機版）" },
  "metro.mobileTeam": { label: "團隊組成（手機版）" },
  "metro.mobileText": { label: "專案說明（手機版）" },
  "metro.mobileTimeframe": { label: "專案期間（手機版）" },
  "metro.beforeAppSubtext": { label: "舊版五大功能頁面說明" },
  "metro.marketIntro": { label: "市場研究引言" },
  "metro.marketSystemInsight": { label: "市場研究｜系統洞察" },
  "metro.competitiveIntro": { label: "競品分析引言" },
  "metro.competitiveConclusionDesktop": { label: "競品分析結論（桌機版）" },
  "metro.competitiveConclusionMobile": { label: "競品分析結論（手機版）" },
  "metro.userResearchIntro": { label: "用戶研究引言（桌機版）" },
  "metro.userResearchMobileIntro": { label: "用戶研究引言（手機版）" },
  "metro.designPrinciplesIntro": { label: "設計原則引言（桌機版）" },
  "metro.designPrinciplesMobileIntro": { label: "設計原則引言（手機版）" },
  "metro.systemArchIntroMobile": { label: "系統架構引言（手機版）" },
  "metro.visionText": { label: "願景說明（桌機版）" },
  "metro.mobileVisionText": { label: "願景說明（手機版）" },
  "metro.interfaceEyebrow": { label: "介面設計區塊眉標" },
  "metro.interfaceHeading": { label: "介面設計區塊大標" },
  "metro.interfaceSectionNumber": { label: "第 1 小節編號" },
  "metro.interfaceSectionTitle": { label: "第 1 小節標題（路線搜尋）" },
  "metro.companionSectionNumber": { label: "第 2 小節編號" },
  "metro.companionSectionTitle": { label: "第 2 小節標題（捷伴）" },
  "metro.bonusSectionNumber": { label: "第 3 小節編號" },
  "metro.bonusSectionTitle": { label: "第 3 小節標題（附加體驗）" },
  "metro.interfaceBlocks": { label: "路線搜尋面板（每頁籤一組）" },
  "metro.companionBlocks": { label: "捷伴面板（每頁籤一組）" },
  "metro.bonusBlocks": { label: "附加體驗面板（每頁籤一組）" },
  "metro.competitiveRows": { label: "競品比較表（每列一款 App）" },
  "metro.marketTrends": { label: "市場趨勢（改版前→後）" },
  "metro.marketPersonas": { label: "目標用戶 Persona" },
  "metro.marketMobileCards": { label: "市場研究卡片（手機版）" },
  "metro.designPrinciplesItems": { label: "設計原則（四項）" },
  "metro.iaPoints": { label: "資訊架構重點" },
  "metro.strategies": { label: "設計策略" },
  "metro.systemArchPoints": { label: "系統架構重點" },
  "metro.userResearchInsights": { label: "用戶研究洞察" },
  "metro.userResearchStats": { label: "用戶研究數據" },
  "metro.resultsMetricOne": { label: "成果數據 ①" },
  "metro.resultsMetricTwo": { label: "成果數據 ②" },
  "metro.resultsServiceMetric": { label: "成果數據（服務面）" },
  "metro.resultsRoadmapApp": { label: "未來規劃｜App" },
  "metro.resultsRoadmapService": { label: "未來規劃｜服務" },

  // Nest Stay
  "nest-stay.whyIntro": { label: "「為什麼做」開場句" },
  "nest-stay.whySteps": { label: "「為什麼做」關鍵步驟" },
  "nest-stay.iaSubtitle": { label: "資訊架構說明" },
  "nest-stay.iaMobileCta": { label: "資訊架構圖按鈕文字（手機版）" },
  "nest-stay.iaIllustrationUrl": { label: "資訊架構插圖" },
  "nest-stay.iaFlowSteps": { label: "資訊架構流程步驟（條列）" },
  "nest-stay.uiFlowTitle": { label: "UI 流程區塊標題" },
  "nest-stay.uiFlowSubtitle": { label: "UI 流程區塊說明" },
  "nest-stay.uiFlowSteps": { label: "UI 流程步驟（桌機版）" },
  "nest-stay.uiFlowBlocks": { label: "UI 流程分組（手機版）" },
  "nest-stay.uiFlowDesktopMedia": { label: "UI 流程畫面（桌機版，依步驟編號 01–06）", hint: "每個步驟可上傳 1–2 張手機畫面" },
  "nest-stay.userTestingIntro": { label: "使用者測試說明" },
  "nest-stay.userTestingAverage": { label: "使用者測試平均分" },
  "nest-stay.userTestingScores": { label: "各流程評分" },
  "nest-stay.userTestingInsights": { label: "使用者測試洞察" },
  "nest-stay.userTestingFocusPoints": { label: "使用者測試重點" },
  "nest-stay.userTestingFocusMediaUrl": { label: "使用者測試重點縮圖" },
  "nest-stay.achievements": { label: "成果亮點" },
  "nest-stay.frontendDemo": { label: "前端 Demo 區塊" },
  "nest-stay.roadmapContext": { label: "未來規劃｜背景說明" },
  "nest-stay.roadmapShortTerm": { label: "未來規劃｜短期" },
  "nest-stay.roadmapVision": { label: "未來規劃｜願景" },

  // Piiluu
  "piiluu.contextHeadingLine1": { label: "背景標題（第 1 行）" },
  "piiluu.contextHeadingLine2": { label: "背景標題（第 2 行）" },
  "piiluu.contextIntro": { label: "背景說明" },
  "piiluu.contextCards": { label: "背景卡片（痛點→行動）" },
  "piiluu.pillarsHeading": { label: "三大核心策略標題" },
  "piiluu.pillars": { label: "三大核心策略" },
  "piiluu.dualTrackHeading": { label: "雙軌策略標題" },
  "piiluu.dualTrackBody": { label: "雙軌策略說明" },
  "piiluu.efficiencyColumns": { label: "雙軌策略欄位" },
  "piiluu.interfaceShowcaseHeading": { label: "關鍵介面標題" },
  "piiluu.interfaceShowcaseIntro": { label: "關鍵介面說明" },
  "piiluu.showcaseRows": { label: "介面優化列表（每組一個功能）", hint: "每組的前／後畫面請見該組下方的上傳欄位" },
  "piiluu.uiKitHeading": { label: "UI Kit 區塊標題" },
  "piiluu.uiKitIntro": { label: "UI Kit 區塊說明" },
  "piiluu.uiKitButtons": { label: "UI Kit｜按鈕範例" },
  "piiluu.uiKitColors": { label: "UI Kit｜色票" },
  "piiluu.uiKitInputs": { label: "UI Kit｜輸入框範例" },
  "piiluu.milestonesHeading": { label: "里程碑區塊標題" },
  "piiluu.milestonesIntro": { label: "里程碑區塊小標" },
  "piiluu.milestonesSubIntro": { label: "里程碑區塊說明" },
  "piiluu.milestones": { label: "里程碑" },

  // Yangbei
  "yangbei.whyEmphasis": { label: "「為什麼做」強調句" },
  "yangbei.whyParagraph": { label: "「為什麼做」內文（桌機版）" },
  "yangbei.whyParagraphMobile": { label: "「為什麼做」內文（手機版）", hint: "手機版斷行專用" },
  "yangbei.timelineTitle": { label: "時程區塊標題" },
  "yangbei.timelineSubtitle": { label: "時程區塊說明" },
  "yangbei.timelinePhases": { label: "時程階段" },
  "yangbei.interviewTitle": { label: "用戶訪談標題" },
  "yangbei.interviewSubtitle": { label: "用戶訪談說明" },
  "yangbei.interviewAudience": { label: "訪談對象" },
  "yangbei.interviewInsights": { label: "訪談洞察 → 決策" },
  "yangbei.interviewNoteTitle": { label: "訪談洞察小結標題" },
  "yangbei.interviewNoteBody": { label: "訪談洞察小結（桌機版）" },
  "yangbei.interviewNotePlainMobile": { label: "訪談洞察小結（手機版）" },
  "yangbei.outcomesTitle": { label: "目前成果標題" },
  "yangbei.outcomes": { label: "目前成果數據" },
  "yangbei.systemRoles": { label: "三層系統角色" },
  "yangbei.platforms": { label: "三個平台設定", hint: "前台／講師端／後台；id 欄位請勿修改" },
  "yangbei.aiWorkflowTitle": { label: "AI 協作區塊標題" },
  "yangbei.aiWorkflowDesc": { label: "AI 協作區塊說明" },
  "yangbei.aiWorkflowItems": { label: "AI 協作分工" },
  "yangbei.frontend_video_url": { label: "居民前台｜操作錄影／截圖" },
  "yangbei.instructor_video_url": { label: "講師端｜操作錄影／截圖" },
  "yangbei.admin_video_url": { label: "管理後台｜操作錄影／截圖" },
  "yangbei.interviewAudience.focusMobile": { label: "訪談重點（手機版）" },
  "yangbei.interviewAudience.segmentMobile": { label: "受訪族群（手機版）" },

  // NTSO
  "tct.zones": { label: "三大展區", hint: "每個展區：標題、說明、設計稿／現場畫面" },
  "tct.onsitePhoto1ImageUrl": { label: "現場照片 1（左上）" },
  "tct.onsitePhoto2ImageUrl": { label: "現場照片 2（右上）" },
  "tct.onsitePhoto3ImageUrl": { label: "現場照片 3（左下）" },
  "tct.onsitePhoto4ImageUrl": { label: "現場照片 4（右下）" },

  // Wedding
  "wedding.heroBackgroundImageUrl": { label: "Hero 背景照" },
  "wedding.heroCutoutImageUrl": { label: "Hero 人物去背圖" },
  "wedding.heroImageUrl": { label: "Hero 主視覺（備用）" },
  "wedding.touchpoints": { label: "四種媒介（每項一組）" },
  "wedding.items": { label: "設計脈絡對照（媒介→出發點→決策）" },
  "wedding.imageUrl": { label: "展示圖" },
  "wedding.frontComposedImageUrl": { label: "喜帖正面" },
  "wedding.smallBackComposedImageUrl": { label: "喜帖小背卡" },
  "wedding.backComposedImageUrl": { label: "喜帖背面" },
};

/**
 * Friendly label (+ optional hint) for a content field. Falls back to
 * `null` so the caller can decide how to present an unregistered key.
 *
 * `pathPrefix` is the editor's Storage-path prefix (`<slug>/<section>/…`).
 */
export function resolveFieldLabel(pathPrefix: string | undefined, key: string): FieldLabel | null {
  const [slug = ""] = segments(pathPrefix);
  const specific = SPECIFIC[`${slug}.${key}`];
  if (specific) return specific;
  if (COMMON[key]) return COMMON[key];

  // Metro's per-panel media slots: <group><Panel><Desktop|Mobile>MediaUrl
  const metro = /^(interface|companion|bonus)(Search|Station|Helper|Helped|Achievement|Accessibility|Promo)(Desktop|Mobile)MediaUrl$/.exec(key);
  if (slug === "metro" && metro) {
    const group = { interface: "路線搜尋", companion: "捷伴陪同", bonus: "附加體驗" }[metro[1]];
    const panel = {
      Search: "搜尋路線",
      Station: "站點資訊",
      Helper: "協助者",
      Helped: "被協助者",
      Achievement: "成就",
      Accessibility: "無障礙",
      Promo: "優惠推播",
    }[metro[2]];
    return { label: `${group}｜${panel}（${metro[3] === "Desktop" ? "桌機版" : "手機版"}畫面）` };
  }

  // Nest Stay's per-step phone screens: uiFlow<Step>MobileMediaUrl
  const flow = /^uiFlow(Search|Browse|Detail|Join|Apply|Complete)MobileMediaUrl$/.exec(key);
  if (slug === "nest-stay" && flow) {
    const step = { Search: "搜尋", Browse: "瀏覽", Detail: "詳情", Join: "加入", Apply: "申請", Complete: "完成" }[flow[1]];
    return { label: `UI 流程｜${step}（手機版畫面）` };
  }

  // Generic mobile/desktop variants of an otherwise-known key:
  // "fooMobile" -> "<foo>（手機版）".
  const variant = /^(.+?)(Mobile|Desktop)$/.exec(key);
  if (variant) {
    const base = SPECIFIC[`${slug}.${variant[1]}`] ?? COMMON[variant[1]];
    if (base) return { label: `${base.label}（${variant[2] === "Mobile" ? "手機版" : "桌機版"}）` };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Section metadata (names, templates, front-end anchors)
// ---------------------------------------------------------------------------

export interface SectionInfo {
  /** 中文名稱 */
  label: string;
  /** What this section is for on the public page. */
  description: string;
  /** Starter content for a brand-new section of this type. */
  template: Record<string, unknown>;
}

export const SECTION_INFO: Record<string, SectionInfo> = {
  hero: {
    label: "Hero 主視覺",
    description: "頁面最上方：專案標題、副標、標籤與主視覺畫面",
    template: { title: "", subtitle: "", kicker: "", timeframeLabel: "", badges: [], mockup_media_url: "" },
  },
  overview: {
    label: "專案概述",
    description: "專案背景與目標的一段介紹",
    template: { text: "" },
  },
  challenge: {
    label: "挑戰與問題",
    description: "要解決的問題、痛點與限制",
    template: { note: "", items: [{ title: "", desc: "" }] },
  },
  role: {
    label: "我的角色",
    description: "我的職位、職責與主導的決策",
    template: { position: "", decision_ownership: "" },
  },
  process: {
    label: "設計過程",
    description: "研究、策略與介面設計的主要內容（各專案欄位差異最大）",
    template: { note: "" },
  },
  outcome: {
    label: "成果",
    description: "成果數據、上線狀態或 Demo 連結",
    template: { items: [], status: "", demo_url: "" },
  },
  reflection: {
    label: "反思與結語",
    description: "頁尾的反思文字與結語金句",
    template: { text: "", closingQuote: "", closingBody: "" },
  },
};

export function sectionLabel(sectionType: string): string {
  return SECTION_INFO[sectionType]?.label ?? sectionType;
}

/**
 * Public-page URL (with an anchor when the page has one) for the part of a
 * project page a section renders into. Only #hero and #closing exist on every
 * case-study page, so other sections open the page and rely on the guide
 * text to say where to scroll.
 */
export function frontPageUrl(slug: string, sectionType?: string): string {
  const anchor = sectionType === "hero" ? "#hero" : sectionType === "reflection" ? "#closing" : "";
  return `/work/${slug}${anchor}`;
}

// ---------------------------------------------------------------------------
// Site-content entries (the non-project pieces of the homepage)
// ---------------------------------------------------------------------------

export interface SiteContentInfo {
  label: string;
  description: string;
}

export const SITE_CONTENT_INFO: Record<string, SiteContentInfo> = {
  hero_tagline: { label: "首頁 Hero 標語", description: "首頁最上方、姓名下方的一段自我定位文字" },
  project_grid_settings: { label: "首頁作品卡片區設定", description: "作品 Bento 卡片區的裝飾格與動態效果設定" },
};

export function siteContentLabel(key: string): string {
  return SITE_CONTENT_INFO[key]?.label ?? key;
}

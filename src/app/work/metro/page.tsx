import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getAdjacentProjects } from "@/lib/data";
import { FadeIn } from "@/components/FadeIn";

// Hand-crafted, bespoke page for this one case study -- deliberately NOT
// driven by the generic project_sections schema. Next.js matches this
// static route ("work/metro") over the dynamic "work/[slug]" route, so it
// takes over from the CMS-driven page for this exact slug while every other
// project still goes through the normal data-driven flow.
//
// Images are hotlinked from the original Framer portfolio's CDN
// (framerusercontent.com) for now -- this sandbox's network proxy blocks
// that domain so the assets couldn't be downloaded and re-hosted locally.
// A real browser hitting the deployed site has no such restriction, but
// these should be migrated to permanent hosting (Supabase storage / Vercel
// blob) once the page structure is signed off, since relying on the old
// Framer site staying up indefinitely is a real risk.
const IMG = {
  heroApp: "https://framerusercontent.com/images/XR7p0ikVm12iksxTDWknbKELZYA.png",
  mascot: "https://framerusercontent.com/images/ZCTzwZu7xF2gpzK7ImOnAbHziQ.png",
  iaOptimization: "https://framerusercontent.com/images/DJuoX8ueQ57CfD9LelHcyp1dB78.png",
  companionService: "https://framerusercontent.com/images/d3egJMJ0089dUJ4wQ42uFiirM.png",
  marketIcons: "https://framerusercontent.com/images/lRLQS32BM6pgScwzsYxp7dRNpBQ.png",
  usersIllustration: "https://framerusercontent.com/images/9ZTXK7pDkJTvsctOCu7NlZ6vM.png",
  osComparison: "https://framerusercontent.com/images/vyWKBEzMQnJVtScJoRiV3Zj9Skw.png",
  research: "https://framerusercontent.com/images/otjgrQCEnr0cHlWowShwTSd05I.png",
  personaVulnerable: "https://framerusercontent.com/images/dAbYQKy9pNYi8v3AQ9ggXVl6Fm8.png",
  personaCompanion: "https://framerusercontent.com/images/KFopGw45lcSSju9GJz4w5Dac3k.png",
  iaNew: "https://framerusercontent.com/images/ub28PoURevxSci8IlzybI7TIXCg.png",
  iaOld: "https://framerusercontent.com/images/ZvVzxrIGWP1uITyPfY7l9fzP8.png",
  painRouteSearch: "https://framerusercontent.com/images/KTsFNeApZrgOb3i6gXWipSGgNM.png",
  painStationInfo: "https://framerusercontent.com/images/KUVerct0WVpyz64zdr50pCNrTmc.png",
  routeMockup: "https://framerusercontent.com/images/aQumhQWzC3qzSFCz2ffDPzIsgzs.png",
  systemArchitecture: "https://framerusercontent.com/images/x6vZ6tXMlnjKdW0p6BNE3oTBLeg.png",
};

const VIDEO = {
  routePlanning: "https://framerusercontent.com/assets/hNIS0BwdmtUXgjqVFajTGOLpkM.mp4",
  stationInfo: "https://framerusercontent.com/assets/epCJHq1T6MILGqT1SSNxYwovzw.mp4",
};

export const metadata: Metadata = {
  title: "2025 捷運盃黑客松 — Chung Yun Huang",
  description: "重新定義大眾運輸體驗，從介面設計與服務創新出發，打造最溫柔的數位解答。",
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs tracking-[0.2em] text-ink-faint">{children}</p>;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l-2 border-accent pl-4">
      <p className="text-2xl tracking-tight md:text-3xl">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">{label}</p>
    </div>
  );
}

export default async function MetroCaseStudyPage() {
  const { prev, next } = await getAdjacentProjects("metro");

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1400px] px-6 pt-10 md:px-10">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} weight="light" />
          ALL WORK
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-6 pb-16 pt-8 md:px-10 md:pb-24 md:pt-10">
        <FadeIn>
          <p className="text-xs tracking-[0.25em] text-accent">UI/UX DESIGN PROJECT</p>
          <h1 className="mt-4 max-w-[20ch] text-3xl leading-tight tracking-tight md:text-5xl">
            2025 捷運盃黑客松
          </h1>
          <p className="mt-3 text-sm tracking-[0.1em] text-ink-faint">智慧引導安心陪伴</p>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ink-muted">
            重新定義大眾運輸體驗，從介面設計與服務創新出發，打造最溫柔的數位解答。
          </p>
          <p className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-faint">
            <span>組長 &amp; UI/UX 設計</span>
            <span className="mx-2">·</span>
            <span>2025.4 – 5</span>
            <span className="mx-2">·</span>
            <span>UI/UX 設計師 3位、工程師 1位</span>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-14 grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_1.4fr]">
            <img
              src={IMG.mascot}
              alt="捷伴陪同服務吉祥物"
              className="mx-auto w-full max-w-[280px] md:mx-0"
            />
            <img
              src={IMG.heroApp}
              alt="台北捷運 GO App 介面重新設計"
              className="mx-auto w-full max-w-[420px] md:ml-auto"
            />
          </div>
        </FadeIn>
      </section>

      <div className="mx-auto max-w-[1400px] divide-y divide-line px-6 md:px-10">
        {/* Overview */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>OVERVIEW</Label>
          <p className="max-w-[65ch] text-base leading-relaxed text-ink-muted">
            本專案源於 2025 捷運盃黑客松，從介面設計與服務創新角度出發，針對台北捷運 GO App
            提出結合 AI 的優化方案。我們從使用者評論與 App 架構分析出發，並透過市場研究、競品分析與使用者訪談，
            重新定義這款 App 的角色——讓它不只提供查詢與購票等功能操作，更能延伸出乘客之間的數位照應與安心陪伴。
          </p>
        </FadeIn>

        {/* Role & Contribution */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>ROLE &amp; CONTRIBUTION</Label>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm tracking-[0.1em] text-accent">定位</h4>
              <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                以組長身份主導整體專案方向，同時擔任 UI/UX 設計負責人，從研究洞察到介面設計與系統架構規劃全程參與。
              </p>
            </div>
            <div>
              <h4 className="text-sm tracking-[0.1em] text-accent">決策歸屬</h4>
              <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                拍板「介面優化 + 服務創新」雙軸策略，將原本分散的功能重新收斂為 5 大導覽核心；
                主導「捷伴陪同服務」的資訊架構與系統設計方向。
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Challenges */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>THE CHALLENGE</Label>
          <div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              我們從使用者評論與 App 架構分析出發，觀察到以下三項關鍵挑戰：
            </p>
            <div className="mt-4 divide-y divide-line">
              {[
                { title: "介面複雜", desc: "功能分類繁多、層級過深，操作流程不夠直覺，使用者常常找不到需要的功能。" },
                { title: "流程分散", desc: "功能入口分散、命名不一致，使用者容易在多層選單中迷路。" },
                { title: "客服回應有限", desc: "AI 語音客服準確率偏低，遇到突發狀況時難以即時提供有效協助。" },
              ].map((item) => (
                <div key={item.title} className="py-4 first:pt-0">
                  <h4 className="text-base">{item.title}</h4>
                  <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Market research */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>MARKET DISCOVERY</Label>
          <div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              為確認提案方向的合理性，我們從產業趨勢、使用者需求展開研究，並透過競品分析確認北捷 GO 的改進機會。
            </p>
            <img src={IMG.marketIcons} alt="市場研究、競品分析、產業趨勢" className="mt-6 w-full max-w-[420px]" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-l-2 border-line pl-4">
                <p className="text-xs tracking-[0.15em] text-ink-faint">導航方式</p>
                <p className="mt-1 text-sm text-ink-muted">靜態地圖 → AI 路徑規劃 + 即時</p>
              </div>
              <div className="border-l-2 border-line pl-4">
                <p className="text-xs tracking-[0.15em] text-ink-faint">APP 操作模式</p>
                <p className="mt-1 text-sm text-ink-muted">查詢式 → 推薦式、整合式</p>
              </div>
            </div>

            <div className="mt-10">
              <h4 className="text-sm tracking-[0.1em] text-accent">使用者需求：不同乘客，不同的搭乘挑戰</h4>
              <img src={IMG.usersIllustration} alt="不同乘客族群" className="mt-4 w-full max-w-[420px]" />
              <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                發現以下族群面臨不便：行動不便者需要尋找電梯與動線；高齡者受限於字體過小、操作困難；
                孕婦需要快速獲得座位提示；視障者需要語音導引與即時方向提示。
              </p>
            </div>

            <div className="mt-10">
              <h4 className="text-sm tracking-[0.1em] text-accent">系統支援度：iOS 與 Android 無障礙差異</h4>
              <img src={IMG.osComparison} alt="iOS 與 Android 無障礙比較" className="mt-4 w-full max-w-[420px]" />
              <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                研究發現 iOS 的無障礙功能 VoiceOver、介面一致性、系統整合度在穩定度與學習曲線上表現優於 Android。
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Research methodology */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>USER RESEARCH</Label>
          <div>
            <img src={IMG.research} alt="研究設計與方法論" className="w-full max-w-[420px]" />
            <p className="mt-6 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              研究目標聚焦驗證臺北捷運 GO App 的現況痛點與全新構想「捷伴陪同服務」的接受度，主要負責專案整合與問卷架構擬定。
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <img src={IMG.personaVulnerable} alt="弱勢乘客：身心障礙、高齡、孕婦" className="h-12 w-12" />
                <p className="mt-2 text-sm">弱勢乘客</p>
                <p className="text-xs text-ink-faint">身心障礙、高齡、孕婦</p>
              </div>
              <div>
                <img src={IMG.personaCompanion} alt="潛在陪伴者：具陪同經驗與意願者" className="h-12 w-12" />
                <p className="mt-2 text-sm">潛在陪伴者</p>
                <p className="text-xs text-ink-faint">具陪同經驗與意願者</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Information architecture */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>ARCHITECTURE</Label>
          <div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              綜合上述洞察，我們提出了「介面優化」與「服務創新」的雙軸策略，將原本分散的功能重新收斂為 5 大導覽核心。
              我們希望重新定義台北捷運 GO App，讓它不只提供功能操作，也能延伸出乘客之間的數位照應與安心陪伴。
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs tracking-[0.15em] text-ink-faint">新資訊架構</p>
                <img src={IMG.iaNew} alt="新資訊架構" className="w-full" />
              </div>
              <div>
                <p className="mb-2 text-xs tracking-[0.15em] text-ink-faint">原資訊架構</p>
                <img src={IMG.iaOld} alt="原資訊架構" className="w-full" />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Key interface design */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>PROCESS</Label>
          <div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              我們重塑三大核心體驗：直覺的路線搜尋與規劃、建立信任的捷伴服務，以及模組化的 Go 優惠優化。
              旨在解決真實痛點，打造兼具效率、溫度與價值的全方位移動旅程。
            </p>

            <div className="mt-10 space-y-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex gap-4">
                  <img src={IMG.painRouteSearch} alt="路線搜尋痛點" className="h-14 w-14 shrink-0" />
                  <div>
                    <h4 className="text-base">輸入欄位視覺化</h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      舊版首頁資訊雜亂，輸入框不顯眼，導致操作遲疑。我們將「起訖站輸入」放大並置於視覺熱區，
                      確立為首頁核心，讓使用者一進 App 就能直覺開始規劃，減少認知負擔。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <img src={IMG.painStationInfo} alt="站點資訊痛點" className="h-14 w-14 shrink-0" />
                  <div>
                    <h4 className="text-base">情境式互動</h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      舊版於點擊站點後需跳轉頁面，且動態資訊（如到站時間）層級過低，不易閱讀。
                      我們採用 Bottom Sheet 取代頁面跳轉，用戶點擊地圖站點時，資訊卡片即時滑出，維持了地圖導航的連續性。
                    </p>
                  </div>
                </div>
              </div>

              <img src={IMG.routeMockup} alt="路線規劃介面" className="mx-auto w-full max-w-[360px]" />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <video src={VIDEO.routePlanning} controls muted loop playsInline className="w-full bg-black" />
                <video src={VIDEO.stationInfo} controls muted loop playsInline className="w-full bg-black" />
              </div>
            </div>

            <div className="mt-14">
              <h4 className="text-sm tracking-[0.1em] text-accent">捷伴服務之系統架構與資料邏輯</h4>
              <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                為了確保「捷伴」服務具備真實的可落地性，我們規劃了完整的系統架構藍圖，將前端的使用者旅程映射為後端的
                Data Flow，確保每一項設計決策都有穩固的邏輯支撐。
              </p>
              <img src={IMG.systemArchitecture} alt="捷伴服務系統架構" className="mt-6 w-full" />
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <h5 className="text-sm">集中式邏輯封裝</h5>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    系統採用 Backend API 作為核心中樞，統一處理來自 UI 的操作請求。這確保了從「偏好設定」到「發起媒合」的所有資料寫入都能標準化，同時簡化前端負擔並提升資安防護等級。
                  </p>
                </div>
                <div>
                  <h5 className="text-sm">AI 驅動的動態配對</h5>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    當使用者發起媒合請求時，Backend API 會即時調用 Match Service AI，依據歷史紀錄與預訓練模型進行運算，精準輸出最適合的配對結果，而非隨機指派。
                  </p>
                </div>
                <div>
                  <h5 className="text-sm">即時推播與數據閉環</h5>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    為了解決等待焦慮，我們整合 FCM 實現配對成功的即時推播。服務結束後的評分會回流至資料庫，作為模型再訓練的依據，形成持續優化的數據閉環。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Outcome */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>OUTCOME</Label>
          <div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              依據前測問卷結果，我們鎖定「使用率最高」且「最能影響非用戶意願」的關鍵流程進行優化，同時針對全新的「捷伴服務」進行市場潛力驗證。
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <StatCard value="+0.66" label="任務一（路線規劃）滿意度顯著提升——視覺留白與分區命名優化後，大幅降低認知負擔" />
              <StatCard value="3.68" label="任務二（查詢鄰近站點）雖有進步但仍有優化空間，入口不明顯列為下一階段重點" />
            </div>

            <div className="mt-6">
              <StatCard value="80%+" label="捷伴服務概念驗證——選擇協助者或雙重角色的受測者中，超過八成驗證了互助模式的潛力" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="text-sm tracking-[0.1em] text-accent">App Roadmap</h5>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  <span className="text-ink">Short-term</span> — 強化首頁模組與路線設定頁的操作引導，解決入口難找問題。
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  <span className="text-ink">Long-term</span> — 導入資料視覺化與個人化推薦，主動推播常用路徑。
                </p>
              </div>
              <div>
                <h5 className="text-sm tracking-[0.1em] text-accent">Service Roadmap</h5>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  <span className="text-ink">Short-term</span> — 導入任務誘因設計與動畫引導，降低陌生互動門檻。
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  <span className="text-ink">Long-term</span> — 導入情境感知與語音互動，實現全場景無障礙陪伴。
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Reflection */}
        <FadeIn className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[200px_1fr] md:gap-10">
          <Label>REFLECTION</Label>
          <blockquote className="max-w-[65ch] border-l-2 border-accent pl-6 text-lg leading-relaxed text-ink">
            公共運輸的設計，服務的不是單一「用戶」，而是廣大的「公眾」。這段旅程讓我深刻理解：
            設計不只是追求視覺的突破，更是在易用性與包容性之間，為乘客找到最溫柔的解答。
          </blockquote>
        </FadeIn>
      </div>

      {(prev || next) && (
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0 md:px-10">
            {prev ? (
              <Link
                href={`/work/${prev.slug}`}
                className="group flex items-center justify-between gap-4 px-6 py-8 md:px-10"
              >
                <div>
                  <p className="text-xs tracking-[0.2em] text-ink-faint">PREVIOUS</p>
                  <p className="mt-2 text-lg transition-colors group-hover:text-accent">{prev.title}</p>
                </div>
                <ArrowLeft
                  size={18}
                  weight="light"
                  className="shrink-0 text-ink-faint transition-transform group-hover:-translate-x-1 group-hover:text-accent"
                />
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className="group flex items-center justify-between gap-4 px-6 py-8 md:px-10"
              >
                <div className="md:ml-auto md:text-right">
                  <p className="text-xs tracking-[0.2em] text-ink-faint">NEXT</p>
                  <p className="mt-2 text-lg transition-colors group-hover:text-accent">{next.title}</p>
                </div>
                <ArrowRight
                  size={18}
                  weight="light"
                  className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent md:order-first"
                />
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 text-sm text-ink-faint md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Chung Yun Huang</p>
          <a href="mailto:chungyunhuang97@gmail.com" className="transition-colors hover:text-ink">
            chungyunhuang97@gmail.com
          </a>
        </div>
      </footer>
    </main>
  );
}

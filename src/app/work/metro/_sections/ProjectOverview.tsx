import {
  HeadingH1,
  HeadingH3,
  BodyLarge,
  BodyMedium,
  LabelMedium,
} from "@/components/design-system/Typography";
import { SectionKicker } from "@/components/design-system/SectionKicker";
import { SlideIn } from "@/components/design-system/SlideIn";

const INFO_CARDS = [
  { label: "專案時間", value: "2025.4 – 5" },
  { label: "團隊成員", value: "UI/UX 設計師 3位 + 工程師 1位" },
  { label: "擔任角色", value: "組長 & UI/UX 設計" },
];

const CHALLENGE_CARDS = [
  {
    number: "01",
    title: "介面複雜",
    body: "台北捷運 GO App 功能過度堆疊，分類繁多、層級過深，操作流程不夠直覺。",
  },
  {
    number: "02",
    title: "流程分散",
    body: "功能入口分散、命名不一致，使用者容易迷路。",
  },
  {
    number: "03",
    title: "客服回應被動",
    body: "AI 語音客服準確率偏低，難以即時提供有效協助。",
  },
];

/**
 * Section 2 — 專案背景與核心挑戰. Left-aligned vertical layout, grey-50 bg.
 */
export function ProjectOverview() {
  return (
    <section className="bg-grey-50 px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SectionKicker>Project Overview</SectionKicker>
        <HeadingH1 className="mt-4 max-w-[20ch] text-primary-black">
          專案背景與核心挑戰
        </HeadingH1>

        {/* 專案簡介 */}
        <div className="mt-14 md:mt-20">
          <HeadingH3 className="text-primary-black">專案簡介</HeadingH3>
          <BodyLarge className="mt-5 max-w-[70ch] text-grey-700">
            本次專案源於 2025
            捷運盃黑客松比賽。台北捷運作為每日運載百萬人次的核心骨幹，其官方
            App「台北捷運 GO」承載了極高密度的日常功能。然而，在面對無障礙通行需求、
            高齡化社會以及突發狀況應變時，現有的數位體驗仍有許多待填補的縫隙。我們從介面設計與服務創新角度出發，
            提出結合 AI 人工智慧的優化方案，將乘客之間的照應與數位引導進行深度整合。
          </BodyLarge>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {INFO_CARDS.map((card, i) => (
              <SlideIn
                key={card.label}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.08}
              >
                <div className="h-full rounded-2xl border border-grey-100 bg-proj-white p-6">
                  <LabelMedium className="text-primary-orange">
                    {card.label}
                  </LabelMedium>
                  <BodyMedium className="mt-3 font-bold text-grey-900">
                    {card.value}
                  </BodyMedium>
                </div>
              </SlideIn>
            ))}
          </div>

          <BodyMedium className="mt-6 max-w-[70ch] text-grey-500">
            個人貢獻：統籌專案進度與每日排程，主導整體 UI
            視覺風格定調，後續畫面由組員協作完成。
          </BodyMedium>
        </div>

        {/* 核心痛點 */}
        <div className="mt-16 md:mt-24">
          <HeadingH3 className="text-primary-black">核心痛點</HeadingH3>
          <BodyLarge className="mt-5 max-w-[70ch] text-grey-700">
            我們從使用者評論與 App 架構分析出發，觀察到以下3項關鍵挑戰：
          </BodyLarge>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CHALLENGE_CARDS.map((card, i) => (
              <SlideIn
                key={card.number}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
              >
                <div className="h-full rounded-2xl bg-proj-white p-7 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                  <span className="font-nunito text-[28px] font-extrabold text-primary-orange">
                    {card.number}
                  </span>
                  <HeadingH3 className="mt-3 text-primary-black">
                    {card.title}
                  </HeadingH3>
                  <BodyMedium className="mt-3 text-grey-700">
                    {card.body}
                  </BodyMedium>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

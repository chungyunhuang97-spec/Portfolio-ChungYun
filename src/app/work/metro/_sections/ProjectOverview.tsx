import {
  HeadingH1,
  HeadingH3,
  BodyLarge,
  BodyMedium,
  LabelMedium,
} from "@/components/design-system/Typography";
import { SectionKicker } from "@/components/design-system/SectionKicker";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

interface ChallengeItem {
  title: string;
  desc: string;
}

/**
 * Section 2 — 專案背景與核心挑戰. Left-aligned vertical layout, grey-50 bg.
 *
 * Content is CMS-driven: the info cards (專案時間/團隊成員/擔任角色) reuse
 * `project.timeframe` / `project.team` / `project.role` from the DETAILS
 * form (no need to duplicate them in section content), `overview.text` /
 * `overview.contribution` come from the `overview` section, and
 * `challenge.items` (title + desc pairs) come from the `challenge` section.
 */
export function ProjectOverview({
  project,
  overview,
  challenge,
}: {
  project: Project;
  overview: Record<string, unknown>;
  challenge: Record<string, unknown>;
}) {
  const infoCards = [
    { label: "專案時間", value: project.timeframe ?? "" },
    { label: "團隊成員", value: project.team ?? "" },
    { label: "擔任角色", value: project.role ?? "" },
  ];
  const overviewText = (overview.text as string) ?? "";
  const contribution = (overview.contribution as string) ?? "";
  const challengeItems = Array.isArray(challenge.items)
    ? (challenge.items as ChallengeItem[])
    : [];

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
            {overviewText}
          </BodyLarge>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {infoCards.map((card, i) => (
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

          {contribution && (
            <BodyMedium className="mt-6 max-w-[70ch] text-grey-500">
              個人貢獻：{contribution}
            </BodyMedium>
          )}
        </div>

        {/* 核心痛點 */}
        <div className="mt-16 md:mt-24">
          <HeadingH3 className="text-primary-black">核心痛點</HeadingH3>
          <BodyLarge className="mt-5 max-w-[70ch] text-grey-700">
            我們從使用者評論與 App 架構分析出發，觀察到以下{challengeItems.length}項關鍵挑戰：
          </BodyLarge>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {challengeItems.map((card, i) => (
              <SlideIn
                key={card.title}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
              >
                <div className="h-full rounded-2xl bg-proj-white p-7 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                  <span className="font-nunito text-[28px] font-extrabold text-primary-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <HeadingH3 className="mt-3 text-primary-black">
                    {card.title}
                  </HeadingH3>
                  <BodyMedium className="mt-3 text-grey-700">
                    {card.desc}
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

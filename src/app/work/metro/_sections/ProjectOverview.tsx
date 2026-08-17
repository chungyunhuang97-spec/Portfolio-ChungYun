import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";
import {
  OverviewClockIcon,
  OverviewPeopleIcon,
  QuoteMarkLeft,
  QuoteMarkRight,
} from "./overview-icons";

interface ChallengeItem {
  title: string;
  desc: string;
}

/**
 * Section 2 — 專案背景與核心挑戰 (Figma node 127:91 desktop / 147:75 mobile).
 *
 * Structurally divergent per breakpoint, not just reflowed:
 * - Desktop: info-card row (專案時間/團隊成員/擔任角色 — blue labels,
 *   Fredoka-numeral values) + a full-width white "個人貢獻" strip, then
 *   3-up pain-point cards with a combined "01 / title" heading + body copy.
 * - Mobile: intro copy wrapped in a bordered quote-box with decorative
 *   quote marks, icon-topped meta cards (clock / people) replacing the
 *   info-card row, a role badge + contribution blurb box, and pain-point
 *   cards that drop the description entirely (title-only, per Figma).
 *
 * Content is CMS-driven and shared across both breakpoints: info values
 * reuse `project.timeframe` / `project.team` / `project.role`,
 * `overview.text` / `overview.contribution` come from the `overview`
 * section, `challenge.items` (title + desc pairs) come from `challenge`.
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
  const timeframe = project.timeframe ?? "";
  const team = project.team ?? "";
  const role = project.role ?? "";
  const overviewText = (overview.text as string) ?? "";
  const contribution = (overview.contribution as string) ?? "";
  const challengeItems = Array.isArray(challenge.items)
    ? (challenge.items as ChallengeItem[])
    : [];

  // Mobile copy is intentionally trimmed/reworded vs. desktop per Figma
  // (147:75) — falls back to the desktop value if no mobile override is set.
  const mobileText = (overview.mobileText as string) || overviewText;
  const mobileTimeframe = (overview.mobileTimeframe as string) || timeframe;
  const mobileTeam = (overview.mobileTeam as string) || team;
  const mobileRole = (overview.mobileRole as string) || role;
  const mobileContribution =
    (overview.mobileContribution as string) || contribution;

  const infoCards = [
    { label: "專案時間", value: timeframe },
    { label: "團隊成員", value: team },
    { label: "擔任角色", value: role },
  ];

  return (
    <section className="bg-grey-50 px-6 py-12 md:border-t md:border-b md:border-[#ededed] md:px-[120px] md:py-[100px]">
      {/* Mobile layout */}
      <div className="flex flex-col gap-8 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-[4px] bg-primary-orange"
                aria-hidden
              />
              <span className="font-nunito text-[12px] font-extrabold tracking-[1px] text-primary-orange uppercase">
                Project Overview
              </span>
            </div>
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              專案背景與核心挑戰
            </h2>
            <div className="h-px w-full border-t border-dashed border-[#ededed]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="relative rounded-lg border border-[#e6e6e6] bg-proj-white px-5 py-3">
            <QuoteMarkLeft className="absolute top-[11px] left-[5px]" />
            <p className="font-nunito px-3 text-center text-[14px] leading-[21px] font-normal text-grey-800">
              {mobileText}
            </p>
            <QuoteMarkRight className="absolute top-[11px] right-[13px]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[#e6e6e6] bg-proj-white px-2.5 py-1.5">
                <span className="flex size-6 items-center justify-center">
                  <OverviewClockIcon />
                </span>
                <p className="font-nunito text-[12px] font-bold text-grey-800">
                  {mobileTimeframe}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[#e6e6e6] bg-proj-white px-2.5 py-1.5">
                <span className="flex size-6 items-center justify-center">
                  <OverviewPeopleIcon />
                </span>
                <p className="font-nunito text-[12px] font-bold text-grey-800">
                  {mobileTeam}
                </p>
              </div>
            </div>

            {mobileContribution && (
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-proj-white p-3">
                <div className="rounded-lg border border-primary-orange bg-proj-white px-2.5 py-1.5">
                  <p className="font-nunito text-[12px] font-bold text-grey-800">
                    擔任｜
                    <span className="text-primary-orange">{mobileRole}</span>
                  </p>
                </div>
                <p className="font-nunito min-w-full text-center text-[13px] leading-[18px] font-normal text-grey-600">
                  {mobileContribution}
                </p>
              </div>
            )}
          </div>
        </SlideIn>

        <SlideIn delay={0.25}>
          <div className="flex flex-col items-center justify-center gap-6">
            <h3 className="font-nunito text-[18px] font-bold text-primary-black">
              核心痛點
            </h3>
            <div className="flex w-full flex-col gap-4">
              {challengeItems.map((card, i) => (
                <div
                  key={card.title}
                  className="w-full rounded-xl border border-[#e6e6e6] bg-proj-white p-4"
                >
                  <p className="font-nunito text-[14px] font-extrabold">
                    <span className="text-grey-600">
                      {String(i + 1).padStart(2, "0")} /{" "}
                    </span>
                    <span className="text-primary-orange">{card.title}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="hidden flex-col gap-12 md:flex">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className="flex size-[18px] shrink-0 items-center justify-center"
                aria-hidden
              >
                <span className="size-[13px] rotate-45 bg-primary-orange" />
              </span>
              <span className="font-nunito text-[13px] leading-[20px] font-extrabold text-primary-orange">
                Project Overview
              </span>
            </div>
            <h2 className="font-nunito text-[48px] leading-[72px] font-bold text-primary-black">
              專案背景與核心挑戰
            </h2>
            <div className="h-px w-full border-t border-dashed border-[#ededed]" />
          </div>
        </SlideIn>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <h3 className="font-nunito text-[32px] leading-[48px] font-bold text-primary-black">
              專案簡介
            </h3>
            <p className="font-nunito w-full text-[16px] leading-[24px] font-normal text-grey-800">
              {overviewText}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              {infoCards.map((card, i) => (
                <SlideIn
                  key={card.label}
                  direction={i % 2 === 0 ? "left" : "right"}
                  delay={i * 0.08}
                  className={i === 0 ? "shrink-0" : "min-w-[220px] flex-1"}
                >
                  <div
                    className={`flex h-full flex-col gap-4 rounded-2xl border border-[#ededed] bg-proj-white p-8 shadow-[0_4px_8px_rgba(0,0,0,0.05)] ${
                      i === 0 ? "whitespace-nowrap" : ""
                    }`}
                  >
                    <p className="font-nunito text-[13px] leading-[18px] font-bold text-secondary-blue">
                      {card.label}
                    </p>
                    <p className="font-fredoka text-[28px] leading-[39px] text-primary-black">
                      {card.value}
                    </p>
                  </div>
                </SlideIn>
              ))}
            </div>

            {contribution && (
              <SlideIn delay={0.3}>
                <div className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-proj-white p-2">
                  <span className="font-nunito shrink-0 text-[14px] leading-[22px] font-semibold whitespace-nowrap text-primary-orange">
                    個人貢獻
                  </span>
                  <span
                    className="h-3.5 w-px shrink-0 bg-grey-300"
                    aria-hidden
                  />
                  <p className="font-nunito flex-1 text-[14px] leading-[22px] font-normal text-grey-500">
                    {contribution}
                  </p>
                </div>
              </SlideIn>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h3 className="font-nunito text-[32px] leading-[48px] font-bold text-primary-black">
              核心痛點
            </h3>
            <p className="font-nunito text-[16px] leading-[24px] font-normal text-grey-800">
              我們從使用者評論與 App 架構分析出發，觀察到以下
              {challengeItems.length}項關鍵挑戰：
            </p>
          </div>

          <div className="flex gap-4">
            {challengeItems.map((card, i) => (
              <SlideIn
                key={card.title}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
                className="flex-1"
              >
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-[#ededed] bg-proj-white p-8 shadow-[0_4px_8px_rgba(0,0,0,0.05)]">
                  <p className="font-nunito text-[24px] leading-[36px] font-bold text-primary-black">
                    {String(i + 1).padStart(2, "0")} / {card.title}
                  </p>
                  <p className="font-nunito text-[15px] leading-[23px] font-normal text-grey-800">
                    {card.desc}
                  </p>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

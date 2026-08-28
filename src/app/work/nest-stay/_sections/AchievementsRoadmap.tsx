"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Achievement {
  number: string;
  tag: string;
  desc: string;
}

interface RoadmapContext {
  desktop: string;
  mobile: [string, string];
}

interface RoadmapShortTerm {
  tag: string;
  title: string;
  desc: string;
  bulletTitle: string;
  bulletSubtitle: string;
  bulletDesc: string;
  mobileBullet: string;
}

interface RoadmapVisionItem {
  title: string;
  desc: string;
}

interface RoadmapVision {
  tag: string;
  title: string;
  items: RoadmapVisionItem[];
}

/**
 * One achievement card. Per spec: the number appears first, title+desc
 * follow 0.08s later — implemented as a 2-level variants tree (the card's
 * own `whileInView` triggers a `staggerChildren: 0.08` container, with the
 * number as the first child and the tag+desc grouped as the second). The
 * outer stagger BETWEEN cards (0.15s, reading order) is owned by the
 * parent grid in `AchievementsRoadmap` below. Plays once, per spec.
 */
const achievementInner = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const achievementPart = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
} as const;

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      variants={achievementInner}
      className="flex flex-col gap-3 rounded-2xl border border-[#e5e0db] bg-proj-white p-6"
    >
      <motion.span variants={achievementPart} className="font-fredoka text-[40px] leading-[40px] text-primary-orange/25">
        {achievement.number}
      </motion.span>
      <motion.div variants={achievementPart} className="flex flex-col gap-1.5">
        <p className="font-nunito text-[14px] font-extrabold tracking-[1px] text-secondary-blue uppercase">
          {achievement.tag}
        </p>
        <p className="font-nunito text-[14px] leading-[21px] font-normal text-grey-700">{achievement.desc}</p>
      </motion.div>
    </motion.div>
  );
}

function RoadmapCardShell({
  tag,
  title,
  children,
}: {
  tag: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-[#e5e0db] bg-grey-50 p-6 md:p-8">
      <span className="font-nunito w-fit rounded-full bg-primary-black px-3 py-1 text-[11px] font-bold tracking-[0.5px] text-proj-white">
        {tag}
      </span>
      <h4 className="font-nunito text-[18px] font-bold text-primary-black md:text-[22px]">{title}</h4>
      {children}
    </div>
  );
}

function ShortTermContent({ roadmap, mobile }: { roadmap: RoadmapShortTerm; mobile: boolean }) {
  return (
    <>
      <p className="font-nunito text-[13px] leading-[21px] font-normal text-grey-700 md:text-[14px] md:leading-[22px]">
        {roadmap.desc}
      </p>
      {mobile ? (
        <div className="rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-3">
          <p className="font-nunito text-[13px] font-semibold text-primary-black">{roadmap.mobileBullet}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-3">
          <p className="font-nunito text-[14px] font-bold text-primary-black">{roadmap.bulletTitle}</p>
          <p className="font-nunito text-[13px] font-semibold text-grey-500">{roadmap.bulletSubtitle}</p>
          <p className="font-nunito mt-1 text-[13px] leading-[20px] font-normal text-grey-700">{roadmap.bulletDesc}</p>
        </div>
      )}
    </>
  );
}

function VisionContent({ vision }: { vision: RoadmapVision }) {
  return (
    <div className="flex flex-col gap-3">
      {vision.items.map((item) => (
        <div key={item.title} className="flex flex-col gap-0.5 rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-3">
          <p className="font-nunito text-[14px] font-bold text-primary-black">{item.title}</p>
          <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-700">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Project Achievements + Future Roadmap (regions 6 &amp; 7 minus the closing
 * statement, which lives in Closing.tsx along with the ambient background
 * geometry). Figma desktop node 275:87's achievements/roadmap block /
 * mobile node 404:147.
 *
 * Content model: reuses `process` — `achievements` (3× {number, tag,
 * desc}), `roadmapContext` ({desktop: string, mobile: [string, string]}),
 * `roadmapShortTerm`, `roadmapVision`.
 *
 * Motion: achievements reveal in reading order (0.15s stagger between
 * cards, number-then-text 0.08s stagger within each — see AchievementCard),
 * plays once. Roadmap cards fade in staggered L/R on desktop (`SlideIn`
 * direction="left"/"right", 0.15s apart) and top-to-bottom on mobile
 * (`SlideIn` direction="up", same 0.15s gap) — two structurally distinct
 * blocks toggled via `md:hidden`/`hidden md:flex`, matching this page's
 * established Hero-style breakpoint pattern, since the two layouts need
 * different SlideIn directions rather than just different spacing.
 */
const achievementsGrid = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };

export function AchievementsRoadmap({ process }: { process: Record<string, unknown> }) {
  const achievements = Array.isArray(process.achievements) ? (process.achievements as Achievement[]) : [];
  const roadmapContext = process.roadmapContext as RoadmapContext | undefined;
  const roadmapShortTerm = process.roadmapShortTerm as RoadmapShortTerm | undefined;
  const roadmapVision = process.roadmapVision as RoadmapVision | undefined;

  if (achievements.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-8">
          <SlideIn delay={0.1}>
            <div className="flex flex-col gap-3">
              <span className="font-nunito text-[13px] font-extrabold tracking-[2px] text-primary-orange uppercase">
                Project Achievements
              </span>
              <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[36px] md:leading-[48px]">
                專案成果
              </h3>
            </div>
          </SlideIn>

          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
            variants={achievementsGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {achievements.map((a) => (
              <AchievementCard key={a.number} achievement={a} />
            ))}
          </motion.div>
        </div>

        {roadmapShortTerm && roadmapVision && (
          <div className="flex flex-col gap-8">
            <SlideIn delay={0.1}>
              <div className="flex flex-col gap-3">
                <span className="font-nunito text-[13px] font-extrabold tracking-[2px] text-secondary-blue uppercase">
                  Future Roadmap
                </span>
                {roadmapContext && (
                  <>
                    <p className="font-nunito hidden max-w-[760px] text-[15px] leading-[24px] font-normal text-grey-700 md:block">
                      {roadmapContext.desktop}
                    </p>
                    <div className="flex flex-col gap-1 md:hidden">
                      <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-700">
                        {roadmapContext.mobile[0]}
                      </p>
                      <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-700">
                        {roadmapContext.mobile[1]}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </SlideIn>

            {/* Mobile — top to bottom */}
            <div className="flex flex-col gap-5 md:hidden">
              <SlideIn direction="up" delay={0.1}>
                <RoadmapCardShell tag={roadmapShortTerm.tag} title={roadmapShortTerm.title}>
                  <ShortTermContent roadmap={roadmapShortTerm} mobile />
                </RoadmapCardShell>
              </SlideIn>
              <SlideIn direction="up" delay={0.25}>
                <RoadmapCardShell tag={roadmapVision.tag} title={roadmapVision.title}>
                  <VisionContent vision={roadmapVision} />
                </RoadmapCardShell>
              </SlideIn>
            </div>

            {/* Desktop — staggered left/right */}
            <div className="hidden gap-6 md:flex">
              <SlideIn direction="left" delay={0.1} className="flex flex-1">
                <RoadmapCardShell tag={roadmapShortTerm.tag} title={roadmapShortTerm.title}>
                  <ShortTermContent roadmap={roadmapShortTerm} mobile={false} />
                </RoadmapCardShell>
              </SlideIn>
              <SlideIn direction="right" delay={0.25} className="flex flex-1">
                <RoadmapCardShell tag={roadmapVision.tag} title={roadmapVision.title}>
                  <VisionContent vision={roadmapVision} />
                </RoadmapCardShell>
              </SlideIn>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

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

/** Section header — orange left bar + label + white title, reused for both "ACHIEVEMENTS" and "ROADMAP". */
function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-center gap-6">
      <div className="h-11 w-1 shrink-0 rounded-[2px] bg-primary-orange md:h-[52px]" aria-hidden />
      <div className="flex flex-col gap-1.5">
        <p className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-primary-orange/90">{label}</p>
        <h3 className="font-nunito text-[28px] leading-[36px] font-bold text-proj-white md:text-[40px] md:leading-[52px]">
          {title}
        </h3>
      </div>
    </div>
  );
}

const achievementInner = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const achievementPart = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
} as const;

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      variants={achievementInner}
      className="flex flex-col gap-2 rounded-lg border-l-4 border-white/[0.08] bg-white/[0.06] p-4 md:gap-4 md:rounded-2xl md:border md:border-white/[0.08] md:bg-white/[0.05] md:p-7"
    >
      <motion.div
        variants={achievementPart}
        className="flex items-center justify-between gap-4 md:items-baseline"
      >
        <span className="font-fredoka text-[24px] leading-none text-primary-orange md:text-[48px] md:text-primary-orange/70">
          {achievement.number}
        </span>
        <span className="font-nunito text-[10px] font-extrabold tracking-[0.88px] text-proj-white/35 uppercase md:text-[11px]">
          {achievement.tag}
        </span>
      </motion.div>
      <motion.div variants={achievementPart} className="flex flex-col gap-2 md:gap-4">
        <div className="hidden h-[2px] w-10 rounded-full bg-primary-orange md:block" aria-hidden />
        <p className="font-nunito text-[13px] leading-[20px] font-normal text-proj-white/85 md:text-[15px] md:leading-[25px]">
          {achievement.desc}
        </p>
      </motion.div>
    </motion.div>
  );
}

/** Small dot-marker bullet used inside roadmap note boxes. */
function BulletLine({ text }: { text: string }) {
  return (
    <li className="font-nunito ml-[19.5px] list-disc text-[13px] leading-[20px] font-normal text-proj-white/70">{text}</li>
  );
}

function NoteBox({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-lg bg-white/[0.05] px-4 py-4">
      <div className="flex items-center gap-1">
        <span className="size-[9px] shrink-0 rounded-full bg-primary-orange" aria-hidden />
        <p className="font-nunito text-[15px] font-bold text-proj-white">{title}</p>
      </div>
      <ul className="flex flex-col">
        {bullets.map((b) => (
          <BulletLine key={b} text={b} />
        ))}
      </ul>
    </div>
  );
}

function TagChip({ label, accent }: { label: string; accent: "pink" | "translucent" }) {
  return (
    <span
      className={`font-nunito w-fit rounded-[4px] px-2.5 py-[3px] text-[10px] font-extrabold text-proj-white ${
        accent === "pink" ? "bg-accent-pink" : "bg-white/10"
      }`}
    >
      {label}
    </span>
  );
}

function RoadmapCardShell({
  tag,
  accent,
  title,
  children,
}: {
  tag: string;
  accent: "pink" | "translucent";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 md:gap-4 md:rounded-2xl md:px-6 md:py-[22px]">
      <TagChip label={tag} accent={accent} />
      <h4 className="font-nunito text-[14px] leading-[21px] font-bold text-proj-white md:text-[18px] md:leading-normal">
        {title}
      </h4>
      {children}
    </div>
  );
}

/**
 * Project Achievements + Future Roadmap, Figma desktop node 380:267 / mobile
 * 404:393. Rebuilt against the real page-level Figma frame — this whole
 * section sits on a near-black background (`#1a1a1f`), not white; achievement
 * cards are translucent white-on-dark tiles, and roadmap notes use the same
 * translucent treatment with a pink "NEXT STEP" tag vs. a neutral "VISION"
 * tag.
 *
 * Content model unchanged: `process` — `achievements` (3× {number, tag,
 * desc}), `roadmapContext` ({desktop, mobile: [line1, line2]}),
 * `roadmapShortTerm`, `roadmapVision`. Desktop's short-term note renders
 * `bulletTitle` + two bullet lines (`bulletSubtitle`, `bulletDesc`); mobile
 * collapses to the single combined `mobileBullet` line.
 */
const achievementsGrid = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };

export function AchievementsRoadmap({ process }: { process: Record<string, unknown> }) {
  const achievements = Array.isArray(process.achievements) ? (process.achievements as Achievement[]) : [];
  const roadmapContext = process.roadmapContext as RoadmapContext | undefined;
  const roadmapShortTerm = process.roadmapShortTerm as RoadmapShortTerm | undefined;
  const roadmapVision = process.roadmapVision as RoadmapVision | undefined;

  if (achievements.length === 0) return null;

  return (
    <section className="bg-[#1a1a1f] px-6 py-12 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <SlideIn delay={0.1}>
            <SectionHeader label="ACHIEVEMENTS" title="專案成果亮點" />
          </SlideIn>

          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
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
              <SectionHeader label="ROADMAP" title="未來展望" />
            </SlideIn>

            {roadmapContext && (
              <SlideIn delay={0.15}>
                <div className="rounded-xl bg-white/[0.04] p-3.5 text-center md:px-6 md:py-[18px] md:text-left">
                  <p className="font-nunito hidden text-[16px] leading-[24px] font-normal text-proj-white/80 md:block">
                    {roadmapContext.desktop}
                  </p>
                  <div className="flex flex-col gap-2 md:hidden">
                    <p className="font-nunito text-[13px] leading-[20px] font-normal text-proj-white/80">
                      {roadmapContext.mobile[0]}
                    </p>
                    <p className="font-nunito text-[13px] leading-[20px] font-normal text-proj-white/80">
                      {roadmapContext.mobile[1]}
                    </p>
                  </div>
                </div>
              </SlideIn>
            )}

            {/* Mobile — stacked, single combined bullet line */}
            <div className="flex flex-col gap-5 md:hidden">
              <SlideIn direction="up" delay={0.1}>
                <RoadmapCardShell tag={roadmapShortTerm.tag} accent="pink" title={roadmapShortTerm.title}>
                  <p className="font-nunito text-[13px] leading-[20px] font-normal text-proj-white/60">
                    {roadmapShortTerm.desc}
                  </p>
                  <div className="flex w-full items-center gap-2">
                    <span className="size-[6px] shrink-0 rounded-full bg-primary-orange" aria-hidden />
                    <p className="font-nunito flex-1 text-[13px] leading-[18px] font-bold text-proj-white">
                      {roadmapShortTerm.mobileBullet}
                    </p>
                  </div>
                </RoadmapCardShell>
              </SlideIn>
              <SlideIn direction="up" delay={0.25}>
                <RoadmapCardShell tag={roadmapVision.tag} accent="translucent" title={roadmapVision.title}>
                  {roadmapVision.items.map((item) => (
                    <NoteBox key={item.title} title={item.title} bullets={[item.desc]} />
                  ))}
                </RoadmapCardShell>
              </SlideIn>
            </div>

            {/* Desktop — side by side */}
            <div className="hidden gap-5 md:flex">
              <SlideIn direction="left" delay={0.1} className="flex flex-1">
                <RoadmapCardShell tag={roadmapShortTerm.tag} accent="pink" title={roadmapShortTerm.title}>
                  <p className="font-nunito text-[12px] leading-[20px] font-normal text-proj-white/55">
                    {roadmapShortTerm.desc}
                  </p>
                  <NoteBox
                    title={roadmapShortTerm.bulletTitle}
                    bullets={[roadmapShortTerm.bulletSubtitle, roadmapShortTerm.bulletDesc]}
                  />
                </RoadmapCardShell>
              </SlideIn>
              <SlideIn direction="right" delay={0.25} className="flex flex-1">
                <RoadmapCardShell tag={roadmapVision.tag} accent="translucent" title={roadmapVision.title}>
                  {roadmapVision.items.map((item) => (
                    <NoteBox key={item.title} title={item.title} bullets={[item.desc]} />
                  ))}
                </RoadmapCardShell>
              </SlideIn>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

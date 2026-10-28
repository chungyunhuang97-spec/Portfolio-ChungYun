"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface AudienceRow {
  segment: string;
  segmentMobile: string;
  count: string;
  focus: string;
  focusMobile: string;
}

interface Insight {
  pain: string;
  decision: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function DotLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2 shrink-0 rounded-full bg-primary-orange" aria-hidden />
      <p className="font-nunito text-[14px] font-bold text-primary-orange">{children}</p>
    </div>
  );
}

const tableVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
} as const;

function AudienceTable({ rows }: { rows: AudienceRow[] }) {
  return (
    <SlideIn direction="left" delay={0.1} className="flex w-full flex-col gap-4 md:w-auto md:flex-1">
      <DotLabel>受訪者概覽</DotLabel>
      <div className="hidden border-b border-grey-300/60 pb-2 text-[12px] font-extrabold text-grey-600 md:flex">
        <p className="w-[190px]">對象</p>
        <p className="w-[60px]">人數</p>
        <p className="w-[260px]">核心關注點</p>
      </div>
      <motion.div
        className="flex flex-col"
        variants={tableVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {rows.map((row, i) => (
          <motion.div key={row.segment} variants={rowVariants}>
            {i > 0 && <div className="h-px w-full bg-grey-100 md:hidden" aria-hidden />}
            <div className="flex items-center justify-between gap-2 py-2.5 text-[13px] md:border-b md:border-grey-100 md:py-[10px] md:text-[13px] last:md:border-0">
              <p className="font-nunito font-semibold text-primary-black md:w-[190px]">
                <span className="md:hidden">{row.segmentMobile}</span>
                <span className="hidden md:inline">{row.segment}</span>
              </p>
              <p className="font-nunito shrink-0 text-grey-600 md:w-[60px]">{row.count}</p>
              <p className="font-nunito flex-1 text-right text-grey-600 md:w-[260px] md:flex-none md:text-left">
                <span className="md:hidden">{row.focusMobile}</span>
                <span className="hidden md:inline">{row.focus}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SlideIn>
  );
}

function PainPointCard({ insight, i }: { insight: Insight; i: number }) {
  return (
    <motion.div
      variants={rowVariants}
      custom={i}
      className="flex flex-col gap-1.5 rounded-lg bg-proj-white p-3 text-[13px] md:p-3.5"
    >
      <div className="flex items-start gap-1.5">
        <span className="font-nunito shrink-0 font-extrabold text-primary-orange">{String(i + 1).padStart(2, "0")} /</span>
        <p className="font-nunito font-semibold text-primary-black">{insight.pain}</p>
      </div>
      <div className="flex items-start gap-1">
        <span className="font-nunito shrink-0 font-extrabold text-primary-orange">→</span>
        <p className="font-nunito text-grey-600">{insight.decision}</p>
      </div>
    </motion.div>
  );
}

function PainPoints({ insights }: { insights: Insight[] }) {
  return (
    <SlideIn direction="right" delay={0.15} className="flex w-full flex-col gap-4 md:flex-1">
      <DotLabel>洞察 → 設計決策</DotLabel>
      <motion.div
        className="flex flex-col gap-2.5 md:gap-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {insights.map((insight, i) => (
          <PainPointCard key={insight.pain} insight={insight} i={i} />
        ))}
      </motion.div>
    </SlideIn>
  );
}

/** Mobile-only plain summary note, sitting above the emphasized quote card. */
function PlainNote({ text }: { text: string }) {
  return (
    <SlideIn delay={0.2} className="md:hidden">
      <div className="rounded-xl border border-grey-100 bg-grey-100/60 p-3.5">
        <p className="font-nunito text-[13px] leading-[20px] text-grey-700">{text}</p>
      </div>
    </SlideIn>
  );
}

/**
 * The ending conclusion of the interview section — "訪談洞察轉化為優化排程" plus
 * how those findings were triaged into the roadmap. Joe flagged this one for
 * its own dynamic emphasis too, so it gets the same "pop in + highlighter
 * sweep + flourished quote glyphs" treatment as WhyThisProject's pull-quote,
 * just re-timed so the two don't feel like a copy-paste of each other.
 */
function EmphasisNote({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 240, damping: 17 }}
      className="relative overflow-hidden rounded-2xl border-[1.5px] border-primary-orange bg-proj-white px-5 py-5 text-center md:px-10 md:py-5"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.5, 0.25, 0] }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary-orange/15 to-transparent"
      />
      <div className="relative flex flex-col items-center gap-1.5">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
          className="font-nunito text-[14px] font-bold text-primary-orange"
        >
          {title}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.25, ease: EASE }}
          className="font-nunito text-[13px] leading-[21px] font-bold text-grey-700 md:text-[14px]"
        >
          {body}
        </motion.p>
      </div>
    </motion.div>
  );
}

/**
 * 用戶訪談 — interviewee overview table + pain-point → design-decision cards,
 * closing on an emphasized note about how those insights fed the roadmap.
 * Mobile additionally carries a plain summary note just above the emphasized
 * one (desktop only shows the emphasized version).
 *
 * Content from `process.interviewTitle` / `interviewSubtitle` /
 * `interviewAudience` (4× rows) / `interviewInsights` (3× pain→decision) /
 * `interviewNoteTitle` / `interviewNoteBody` / `interviewNotePlainMobile`.
 */
export function UserInterviews({ process }: { process: Record<string, unknown> }) {
  const title = (process.interviewTitle as string) || "用戶訪談";
  const subtitle = process.interviewSubtitle as string | undefined;
  const audience = Array.isArray(process.interviewAudience) ? (process.interviewAudience as AudienceRow[]) : [];
  const insights = Array.isArray(process.interviewInsights) ? (process.interviewInsights as Insight[]) : [];
  const noteTitle = process.interviewNoteTitle as string | undefined;
  const noteBody = process.interviewNoteBody as string | undefined;
  const notePlainMobile = process.interviewNotePlainMobile as string | undefined;

  if (audience.length === 0 || insights.length === 0) return null;

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-grey-50 px-6 py-16 md:min-h-0 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            Research · User Interviews
          </span>
          <h2 className="font-nunito text-[26px] leading-[36px] font-bold text-primary-orange md:text-[32px] md:leading-[44px]">
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito max-w-[700px] text-[13px] leading-[21px] text-grey-700 md:text-[16px] md:leading-[24px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <AudienceTable rows={audience} />
        <PainPoints insights={insights} />
      </div>

      <div className="mt-8 flex flex-col gap-3 md:mt-10">
        {notePlainMobile && <PlainNote text={notePlainMobile} />}
        {noteTitle && noteBody && <EmphasisNote title={noteTitle} body={noteBody} />}
      </div>
    </section>
  );
}

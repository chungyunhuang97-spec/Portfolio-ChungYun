"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Phase {
  number: string;
  title: string;
  date: string;
  items: string[];
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Hand-drawn-feeling double chevron — the connector between timeline phases. Two offset strokes instead of a single glyph so it reads less "stock icon," more sketched arrow. */
function DoubleChevron({ className, tone }: { className?: string; tone: "grey" | "orange" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M7 5l6 7-6 7"
        stroke={tone === "orange" ? "#FF520D" : "#808080"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 5l6 7-6 7"
        stroke={tone === "orange" ? "#FF520D" : "#808080"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: EASE },
  }),
};

function PhaseCard({ phase, i }: { phase: Phase; i: number }) {
  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      className="relative z-0 flex w-full flex-1 flex-col gap-2.5 rounded-lg border-l-4 border-primary-orange bg-proj-white p-3.5 md:gap-3 md:p-5"
    >
      <div className="flex items-center gap-2.5">
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 320, damping: 14, delay: i * 0.1 + 0.15 }}
          className="font-nunito flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-orange text-[11px] font-extrabold text-proj-white"
        >
          {phase.number}
        </motion.span>
        <p className="font-nunito text-[14px] font-extrabold text-grey-900 md:text-[16px]">{phase.title}</p>
      </div>
      <p className="font-nunito text-[11px] text-grey-500 md:text-[12px]">{phase.date}</p>
      <div className="h-px w-full bg-grey-100" aria-hidden />
      <ul className="flex flex-col gap-1.5 md:gap-2">
        {phase.items.map((item) => (
          <li key={item} className="font-nunito text-[12px] leading-[18px] text-grey-900 md:text-[13px] md:leading-[20px]">
            · {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/**
 * 從 MVP 到正式上線 — project timeline, 4 phases connected by double-chevron
 * arrows. Desktop lays the phases out in a single row; mobile uses a 2x2
 * grid with the 2→3 connector rotated diagonally (card 02 sits top-right,
 * card 03 sits bottom-left, so the arrow has to cut across) while 1→2 and
 * 3→4 stay horizontal. Per Joe's note: the first two arrows are neutral grey
 * (still mid-process), the last turns orange (launch).
 *
 * Content from `process.timelineTitle` / `timelineSubtitle` /
 * `timelinePhases` (4× { number, title, date, items[] }).
 */
export function Timeline({ process }: { process: Record<string, unknown> }) {
  const title = (process.timelineTitle as string) || "從 MVP 到正式上線";
  const subtitle = process.timelineSubtitle as string | undefined;
  const phases = Array.isArray(process.timelinePhases) ? (process.timelinePhases as Phase[]) : [];

  if (phases.length < 4) return null;
  const [p1, p2, p3, p4] = phases;

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-grey-50 px-6 py-16 md:min-h-0 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            Project Timeline
          </span>
          <h2 className="font-nunito text-[26px] leading-[36px] font-bold text-primary-orange md:text-[40px] md:leading-[52px]">
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito max-w-[660px] text-[13px] leading-[21px] text-grey-700 md:text-[16px] md:leading-[24px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      {/* Mobile — 2x2 grid, middle connector rotated diagonal */}
      <motion.div
        className="flex flex-col md:hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        <div className="relative grid grid-cols-2 gap-x-2 gap-y-4">
          <PhaseCard phase={p1} i={0} />
          <PhaseCard phase={p2} i={1} />
          <DoubleChevron
            tone="grey"
            className="absolute top-1/2 left-1/2 z-10 size-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
          />
        </div>
        <div className="relative h-7 shrink-0">
          <DoubleChevron
            tone="grey"
            className="absolute top-1/2 left-[42%] z-10 size-8 -translate-x-1/2 -translate-y-1/2 rotate-[110deg] drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
          />
        </div>
        <div className="relative grid grid-cols-2 gap-x-2 gap-y-4">
          <PhaseCard phase={p3} i={2} />
          <PhaseCard phase={p4} i={3} />
          <DoubleChevron
            tone="orange"
            className="absolute top-1/2 left-1/2 z-10 size-7 -translate-x-1/2 -translate-y-1/2 -scale-y-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
          />
        </div>
      </motion.div>

      {/* Desktop — single row */}
      <motion.div
        className="hidden items-stretch md:flex"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        <PhaseCard phase={p1} i={0} />
        <div className="flex w-12 shrink-0 items-center justify-center self-center">
          <DoubleChevron tone="grey" className="size-7" />
        </div>
        <PhaseCard phase={p2} i={1} />
        <div className="flex w-12 shrink-0 items-center justify-center self-center">
          <DoubleChevron tone="grey" className="size-7" />
        </div>
        <PhaseCard phase={p3} i={2} />
        <div className="flex w-12 shrink-0 items-center justify-center self-center">
          <DoubleChevron tone="orange" className="size-7" />
        </div>
        <PhaseCard phase={p4} i={3} />
      </motion.div>
    </section>
  );
}

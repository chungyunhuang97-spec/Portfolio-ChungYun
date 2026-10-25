"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface AIWorkflowItem {
  phase: string;
  owner: string;
  desc: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: EASE },
  }),
};

/**
 * Owner badge — distinguishes Joe vs AI vs collab. Joe's own contribution
 * gets a solid fill rather than the AI/collab tint: this is the one badge
 * meant to stand out against the dark card (see yangbei UX review 5-3 —
 * the tinted treatment read as too low-contrast to notice).
 */
function OwnerBadge({ owner }: { owner: string }) {
  const isAI = owner.includes("AI") || owner.includes("Claude");
  const isCollab = owner.includes("+") || owner.includes("共");
  const bg = isAI
    ? "bg-secondary-blue/10 text-secondary-blue"
    : isCollab
    ? "bg-accent-pink/10 text-accent-pink"
    : "bg-primary-orange text-proj-white";
  return (
    <span className={`font-nunito rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${bg}`}>
      {owner}
    </span>
  );
}

/**
 * 設計 × AI 協作 — three-phase workflow breakdown.
 * Shows how UX decisions, UI design, and engineering were split between Joe and Claude.
 * Content from `process.aiWorkflowTitle`, `process.aiWorkflowDesc`, `process.aiWorkflowItems`.
 */
export function AIWorkflow({ process }: { process: Record<string, unknown> }) {
  const title = (process.aiWorkflowTitle as string) || "設計 × AI 協作";
  const desc = (process.aiWorkflowDesc as string) || "";
  const items = Array.isArray(process.aiWorkflowItems)
    ? (process.aiWorkflowItems as AIWorkflowItem[])
    : [];

  if (items.length === 0) return null;

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-grey-50 px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            AI Collaboration
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            {title}
          </h2>
          {desc && (
            <p className="font-nunito max-w-[600px] text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
              {desc}
            </p>
          )}
        </div>
      </SlideIn>

      <motion.div
        className="flex flex-col gap-4 md:flex-row md:gap-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.phase}
            custom={i}
            variants={cardVariants}
            className="flex flex-1 flex-col gap-4 rounded-2xl border border-grey-100 bg-proj-white p-6"
          >
            {/* Phase number + title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <span className="font-nunito text-[11px] font-extrabold tracking-[1.2px] text-grey-500 uppercase">
                  Phase {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-nunito text-[18px] font-bold text-primary-black md:text-[20px]">
                  {item.phase}
                </h3>
              </div>
              <OwnerBadge owner={item.owner} />
            </div>

            {/* Divider */}
            <div className="w-full border-t border-grey-100" />

            {/* Desc */}
            <p className="font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px] md:leading-[22px]">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom note */}
      <SlideIn delay={0.3}>
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-grey-100 bg-proj-white p-4 md:mt-10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden>
            <circle cx="8" cy="8" r="7" stroke="#b3b3b3" strokeWidth="1.2" />
            <path d="M8 5v3M8 10.5v.5" stroke="#808080" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="font-nunito text-[12px] leading-[18px] text-grey-500 md:text-[13px] md:leading-[20px]">
            這個流程不是「設計完交給 AI 實作」——Joe 在 AI 寫 code 的過程中持續 QA 把關，確保每個技術決策都符合設計意圖和使用者體驗。
          </p>
        </div>
      </SlideIn>
    </section>
  );
}

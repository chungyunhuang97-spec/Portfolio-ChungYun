import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

interface ThreadItem {
  touchpoint: string;
  decision: string;
  origin: string;
}

/**
 * Section 7 — Design Thread ("One Thread, Four Forms"). The four
 * touchpoints share no single style guide, so this section's own job is
 * to make the thing that DOES connect them legible: every design
 * decision traces back to something specific about the couple, not a
 * house style. Rendered as a table on desktop / stacked cards on mobile
 * (two independent trees per the structural convention, not one shared
 * tree forced into a responsive grid).
 *
 * Content model: `outcome` row — `heading`, `text` (intro), `items`
 * (array of `{touchpoint, decision, origin}`).
 *
 * The intro used to end in a dashed heart-stitch doodle (`icons.tsx`'s
 * `DoodleHeartStitch`) standing in for "一條隱藏的脈絡" -- Joe flagged it
 * as ugly, so it's gone; `icons.tsx` had no other export, so it's deleted
 * too rather than left as a dead file.
 */
export function DesignThread({ outcome }: { outcome: Record<string, unknown> }) {
  const heading = (outcome.heading as string) ?? "One Thread, Four Forms";
  const text = outcome.text as string | undefined;
  const items = Array.isArray(outcome.items) ? (outcome.items as ThreadItem[]) : [];

  if (items.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[860px] flex-col gap-10 md:gap-14">
        <SlideIn className="flex flex-col items-center gap-4 text-center">
          <SectionKicker color="pink">DESIGN THREAD</SectionKicker>
          <h2 className="font-nunito text-[22px] font-bold text-primary-black md:text-[36px]">{heading}</h2>
          {text && (
            <p className="max-w-[60ch] font-nunito text-[14px] leading-[22px] text-grey-700 md:text-[16px] md:leading-[26px]">
              {text}
            </p>
          )}
        </SlideIn>

        <div className="flex flex-col divide-y divide-grey-100 rounded-2xl border border-grey-100 bg-proj-white shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]">
          <div className="hidden grid-cols-[1fr_1.4fr_1.4fr] gap-4 px-6 py-4 md:grid">
            <span className="font-nunito text-[12px] font-extrabold tracking-[0.1em] text-grey-500 uppercase">
              接觸點
            </span>
            <span className="font-nunito text-[12px] font-extrabold tracking-[0.1em] text-grey-500 uppercase">
              核心設計決策
            </span>
            <span className="font-nunito text-[12px] font-extrabold tracking-[0.1em] text-grey-500 uppercase">
              出發點
            </span>
          </div>
          {items.map((item, i) => (
            <SlideIn
              key={item.touchpoint}
              delay={i * 0.06}
              // Mobile is a single stacked column (grid-cols-1) -- centered
              // (Joe's ask: left-aligned text in a full-width card left the
              // right half looking empty). Desktop's real 3-column table
              // stays left-aligned, which is what a table should do.
              className="grid grid-cols-1 gap-2 px-6 py-5 text-center md:grid-cols-[1fr_1.4fr_1.4fr] md:items-center md:gap-4 md:py-4 md:text-left"
            >
              <span className="font-nunito text-[15px] font-bold text-primary-black md:text-[16px]">
                {item.touchpoint}
              </span>
              <span className="font-nunito text-[14px] text-accent-pink md:text-[15px]">{item.decision}</span>
              <span className="font-nunito text-[14px] text-grey-600 md:text-[15px]">{item.origin}</span>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}

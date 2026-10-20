import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { Tag } from "@/components/design-system/Tag";

interface Touchpoint {
  index: string;
  title: string;
  titleEn: string;
  time: string;
  desc: string;
  highlights: string[];
  tech?: string;
  demoUrl?: string;
  demoLabel?: string;
}

/**
 * No uploaded media exists yet for this project (marriage certificate,
 * invitation photos, and the opening film are all still being finalized
 * per the briefing) — every visual slot here is a clearly labeled
 * MockupSlot/PhoneFrame placeholder, same precedent tct/page.tsx set for
 * a project with no media yet, so the page still reads as intentional
 * and can be upgraded later without a layout change. The digital
 * invitation (02) reuses <PhoneFrame /> since it's an actual interactive
 * site, not a static image — the other three use <MockupSlot />.
 */
function TouchpointVisual({ touchpoint }: { touchpoint: Touchpoint }) {
  if (touchpoint.index === "02") {
    return (
      <div className="mx-auto w-full max-w-[220px]">
        <PhoneFrame label="電子喜帖畫面 素材製作中" />
      </div>
    );
  }
  if (touchpoint.index === "04") {
    return <MockupSlot label="婚禮開場影片 素材製作中" aspect="aspect-video" />;
  }
  return <MockupSlot label={`${touchpoint.title} 素材製作中`} aspect="aspect-[4/3]" />;
}

function TouchpointCard({ touchpoint, index }: { touchpoint: Touchpoint; index: number }) {
  const reverse = index % 2 === 1;
  const paragraphs = touchpoint.desc.split("\n\n");

  return (
    <div
      className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-14 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <SlideIn direction={reverse ? "right" : "left"} className="w-full md:w-[320px] md:shrink-0">
        <TouchpointVisual touchpoint={touchpoint} />
      </SlideIn>

      <SlideIn direction={reverse ? "left" : "right"} delay={0.1} className="flex flex-1 flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-fredoka text-[32px] leading-none text-accent-pink md:text-[40px]">
            {touchpoint.index}
          </span>
          <div>
            <h3 className="font-nunito text-[20px] font-bold text-primary-black md:text-[26px]">
              {touchpoint.title}
            </h3>
            <p className="font-nunito text-[11px] font-bold tracking-[0.1em] text-grey-500 uppercase md:text-[12px]">
              {touchpoint.titleEn} · {touchpoint.time}
            </p>
          </div>
        </div>

        {paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 12)}
            className="font-nunito text-[14px] leading-[22px] text-grey-700 md:text-[16px] md:leading-[26px]"
          >
            {paragraph}
          </p>
        ))}

        {touchpoint.highlights.length > 0 && (
          <ul className="flex flex-col gap-2">
            {touchpoint.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px]"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-pink" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        )}

        {touchpoint.tech && (
          <Tag variant="pink" className="w-fit">
            {touchpoint.tech}
          </Tag>
        )}

        {touchpoint.demoUrl && (
          <a
            href={touchpoint.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 border-b border-primary-black pb-1 font-nunito text-[14px] font-bold text-primary-black transition-colors hover:border-accent-pink hover:text-accent-pink"
          >
            {touchpoint.demoLabel ?? "查看連結"}
            <ArrowUpRight size={16} weight="bold" />
          </a>
        )}
      </SlideIn>
    </div>
  );
}

/**
 * Sections 3–6 — the four touchpoints (結婚書約 / 電子喜帖 / 紙本喜帖 /
 * 婚禮開場影片), merged into one scrolling section rather than four
 * separate full-screen ones (continuous pacing, see Background.tsx).
 * Alternating left/right layout per card is this section's own
 * signature motif — each touchpoint faces the opposite direction of the
 * last, reading as a back-and-forth conversation across the four media.
 *
 * Content model: `process.touchpoints` — array of
 * `{index, title, titleEn, time, desc, highlights, tech?, demoUrl?, demoLabel?}`.
 */
export function Touchpoints({ process }: { process: Record<string, unknown> }) {
  const touchpoints = Array.isArray(process.touchpoints) ? (process.touchpoints as Touchpoint[]) : [];
  if (touchpoints.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-16 md:gap-24">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <SectionKicker color="pink">TOUCHPOINTS</SectionKicker>
          <h2 className="font-nunito text-[22px] font-bold text-primary-black md:text-[36px]">
            四個接觸點，一套語言
          </h2>
        </SlideIn>

        <div className="flex flex-col gap-16 md:gap-20">
          {touchpoints.map((touchpoint, i) => (
            <TouchpointCard key={touchpoint.index} touchpoint={touchpoint} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

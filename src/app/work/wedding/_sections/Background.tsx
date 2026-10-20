import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

/**
 * Section 2 — Project Background ("No Brief. Just Them."). Continuous
 * narrative pacing for this whole page (not full-screen slides) — a
 * single 16-month story across four media reads closer to Nest Stay/
 * Piiluu's pacing than Metro's argument-by-argument slides (see
 * docs/case-study-design-conventions.md's "敘事節奏" rule).
 *
 * Content model: `overview` row — `heading` + `text` (paragraphs joined
 * by a blank line).
 */
export function Background({ overview }: { overview: Record<string, unknown> }) {
  const heading = (overview.heading as string) ?? "No Brief. Just Them.";
  const text = overview.text as string | undefined;

  if (!text) return null;
  const paragraphs = text.split("\n\n");

  return (
    <section className="bg-grey-50 px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
        <SlideIn className="flex flex-col items-center gap-3">
          <SectionKicker color="pink">BACKGROUND</SectionKicker>
          <h2 className="font-nunito text-[22px] font-bold text-primary-black md:text-[36px]">{heading}</h2>
        </SlideIn>

        <div className="flex flex-col gap-4">
          {paragraphs.map((paragraph, i) => (
            <SlideIn key={paragraph.slice(0, 12)} delay={0.1 + i * 0.08}>
              <p className="font-nunito text-[15px] leading-[24px] text-grey-700 md:text-[18px] md:leading-[30px]">
                {paragraph}
              </p>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}

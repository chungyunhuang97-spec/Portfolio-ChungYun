import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * Section 8 — Closing (`reflection` row). Unlike every other case
 * study's Closing (always bg-secondary-blue regardless of that page's
 * own dominant color, per docs/case-study-design-conventions.md), this
 * page's dominant accent IS pink — so Closing reuses it directly rather
 * than introducing a color just for this one section. `id="closing"` is
 * what <BackToTop /> watches to decide when to appear.
 *
 * Content model: `reflection` row — `closingQuote` (the reflective
 * paragraphs) + `closingBody` (the short closing line), same two-field
 * shape piiluu's Closing.tsx already uses.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote && !body) return null;
  const quoteParagraphs = quote ? quote.split("\n\n") : [];

  return (
    <section id="closing" className="relative overflow-hidden bg-accent-pink">
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 text-center md:py-28">
        <SlideIn
          delay={0.1}
          className="relative flex w-full max-w-[680px] flex-col items-center gap-5 pt-10 pb-10 text-proj-white"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 font-nunito text-[48px] leading-[48px] font-bold text-proj-white md:text-[96px] md:leading-[96px]"
          >
            「
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 font-nunito text-[48px] leading-[48px] font-bold text-proj-white md:text-[96px] md:leading-[96px]"
          >
            」
          </span>
          {quoteParagraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 12)}
              className="w-full font-nunito text-[16px] leading-[26px] font-bold md:text-[22px] md:leading-[34px]"
            >
              {paragraph}
            </p>
          ))}
          {body && (
            <p className="mt-2 w-full font-nunito text-[14px] leading-[22px] font-bold opacity-90 md:text-[16px]">
              {body}
            </p>
          )}
        </SlideIn>
      </div>
    </section>
  );
}

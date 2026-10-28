"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Background-story card — plain paragraph, each sentence its own line (desktop wraps at punctuation, mobile breaks earlier to fit the narrower measure). */
function ParagraphCard({ desktop, mobile }: { desktop: string; mobile: string }) {
  return (
    <SlideIn delay={0.15}>
      <div className="rounded-2xl border border-black/10 bg-proj-white px-5 py-6 md:rounded-xl md:px-10 md:py-7">
        <div className="hidden flex-col items-center gap-1 text-center md:flex">
          {desktop.split("\n").map((line, i) => (
            <p key={i} className="font-nunito text-[15px] leading-[26px] font-normal text-grey-700">
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 text-center md:hidden">
          {mobile.split("\n").map((line, i) =>
            line === "" ? (
              <div key={i} aria-hidden className="h-3" />
            ) : (
              <p key={i} className="font-nunito text-[14px] leading-[22px] font-normal text-grey-700">
                {line}
              </p>
            )
          )}
        </div>
      </div>
    </SlideIn>
  );
}

/** Quote glyph pair flanking the emphasis line — pops in with a little rotation after the card lands, instead of fading in flat with everything else. */
function EmphasisQuoteGlyph({ close }: { close?: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.4, rotate: close ? 12 : -12 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 300, damping: 14, delay: close ? 0.55 : 0.4 }}
      className="font-nunito pointer-events-none shrink-0 text-[28px] leading-none font-black text-primary-orange md:text-[40px]"
    >
      {close ? "”" : "“"}
    </motion.span>
  );
}

/**
 * The emphasis card — "期待能夠設計一套居民真正用得上的活動報名系統". This is the
 * line Joe specifically called out for a stronger dynamic treatment: the card
 * pops in with a springy overshoot (instead of the page's usual gentle
 * fade-up), its quote glyphs flourish in with a slight rotation a beat later,
 * and a highlighter-style sweep draws in behind the text — an accent that
 * reads as "pen underline" rather than a generic fade, in keeping with the
 * hand-made/naive-art treatment used elsewhere on this page.
 */
function EmphasisCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border-[1.5px] border-primary-orange bg-proj-white px-5 py-6 md:rounded-xl md:px-10 md:py-6"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.55, 0.3, 0] }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary-orange/15 to-transparent"
      />
      <div className="relative flex items-center justify-center gap-2 md:gap-4">
        <EmphasisQuoteGlyph />
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
          className="font-nunito text-center text-[16px] leading-[26px] font-bold text-primary-black md:text-[20px] md:leading-[28px]"
        >
          {text}
        </motion.p>
        <EmphasisQuoteGlyph close />
      </div>
    </motion.div>
  );
}

/**
 * 為什麼做這個專案 — rebuilt against the current Figma (desktop node 755:2307 /
 * mobile 755:2758): a plain background-story paragraph, then a separately
 * emphasized pull-quote. Replaces the old "quote + 4 progressively-highlighted
 * steps" layout, which no longer matches the design.
 *
 * Content from `process.whyParagraph` / `whyParagraphMobile` (background
 * story) and `process.whyEmphasis` (the pull-quote).
 */
export function WhyThisProject({ process }: { process: Record<string, unknown> }) {
  const paragraph = process.whyParagraph as string | undefined;
  const paragraphMobile = (process.whyParagraphMobile as string | undefined) ?? paragraph;
  const emphasis = process.whyEmphasis as string | undefined;

  if (!paragraph || !emphasis) return null;

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-grey-50 px-6 py-8 md:min-h-0 md:px-[120px] md:py-[80px]">
      <div className="flex flex-col gap-5 md:gap-10">
        <SlideIn delay={0.05}>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
              Why This Project
            </span>
            <h3 className="font-nunito text-[24px] leading-[34px] font-bold text-primary-orange md:text-[36px] md:leading-[48px]">
              為什麼做這個專案？
            </h3>
            <div className="w-full border-t border-dashed border-black/10 md:hidden" />
          </div>
        </SlideIn>

        <div className="flex flex-col gap-4 md:gap-5">
          <ParagraphCard desktop={paragraph} mobile={paragraphMobile ?? paragraph} />
          <EmphasisCard text={emphasis} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * Section 5 -- On Site (展覽現場實況). Restored from the original site,
 * which had this as its own standalone section between the exhibition
 * zones and the closing reflection: a plain photo collage of the actual
 * installed exhibit, no video. Per Joe's explicit ask, the per-zone Live
 * recordings stay inside ExhibitionZones (each zone's own Design/Live
 * toggle) rather than being collected here -- this section's job is purely
 * "proof this got built", the textural evidence that the mockups above
 * became a real room people walked into, so it stays photo-only like the
 * original rather than re-showing the same footage a second time.
 *
 * Content model: reuses the `outcome` row's `items[0]` (the run-summary
 * sentence, e.g. "展覽期間...透過大螢幕觸控與沉浸式體驗...") as this
 * section's intro -- the same line the original site used here -- so
 * `Outcome.tsx` doesn't repeat it. The collage itself is `onsiteImageUrl`,
 * a real top-level field on the same row (not hardcoded), so it has the
 * admin's full upload dropzone like any other top-level media field --
 * swap it from the admin UI once a higher-resolution export exists.
 */
export function OnSite({ outcome }: { outcome: Record<string, unknown> }) {
  const items = Array.isArray(outcome.items) ? (outcome.items as string[]) : [];
  const intro = items[0];
  const collageUrl = (outcome.onsiteImageUrl as string | undefined) || "/work/tct/onsite/collage.webp";

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-10 md:gap-12">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <span className="font-nunito text-[14px] font-extrabold text-secondary-blue">ON SITE</span>
          <h3 className="font-nunito text-[22px] font-bold text-grey-800 md:text-[32px]">展覽現場實況</h3>
          {intro && (
            <p className="font-nunito max-w-[60ch] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
              {intro}
            </p>
          )}
        </SlideIn>

        <SlideIn delay={0.1} className="w-full">
          <div className="overflow-hidden rounded-[20px] border border-grey-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={collageUrl}
              alt="展覽現場實況：觀眾操作觸控螢幕與展區實景照片"
              className="w-full object-cover"
            />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

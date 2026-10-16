"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

interface Photo {
  url?: string;
  alt: string;
  delay: number;
  className: string;
  /** Starting offset this tile converges FROM as it scrolls into view --
   * each tile drifts in from its own direction + slight rotation so the
   * grid reads as four separate photos assembling into formation, rather
   * than the uniform fade-up every other SlideIn on this page uses. Skipped
   * under `prefers-reduced-motion` (plain fade only), same precedent as
   * Hero's TapRipple / ExhibitionZones' ScrollySteps. */
  from: { x: number; y: number; rotate: number };
}

/** One real-photo tile -- `object-cover` is fine here (unlike the
 * exhibition-zone screenshots, which needed `contain` to avoid cropping UI
 * chrome/text) since these are ordinary photographs where a small amount
 * of edge cropping to fill the tile reads as normal, not lossy. Sized
 * entirely by its grid/flex slot (`h-full`/`flex-*` in the parent), never
 * by its own aspect-ratio -- see `OnSite`'s layout comment for why. */
function PhotoTile({ url, alt, delay, className, from }: Photo) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 70, damping: 16, delay }}
    >
      <div className="h-full w-full overflow-hidden rounded-[16px] bg-grey-50 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} className="h-full w-full border border-grey-100 object-cover" />
        ) : (
          // Dashed border + icon, matching `MockupSlot`'s established
          // "media待上傳" convention rather than plain centered text, so an
          // empty slot reads as an intentional pending-upload state instead
          // of a broken image.
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-grey-300 p-4 text-center">
            <ImageSquare size={24} weight="light" className="text-grey-400" />
            <p className="font-nunito text-[11px] font-bold leading-relaxed text-grey-400">現場照片待上傳</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Section 5 -- On Site (展覽現場實況). Restored from the original site,
 * which had this as its own standalone section between the exhibition
 * zones and the closing reflection: real photos of the installed exhibit,
 * no video. Per Joe's explicit ask, the per-zone Live recordings stay
 * inside ExhibitionZones (each zone's own Design/Live toggle) rather than
 * being collected here -- this section's job is purely "proof this got
 * built", the textural evidence that the mockups above became a real room
 * people walked into.
 *
 * Laid out as a real masonry grid of 4 separate photos (one tall, one
 * wide, two small) rather than one flattened collage image -- each tile is
 * its own top-level `outcome.onsitePhotoNImageUrl` field, so each has its
 * own upload dropzone in the admin like every other media field on this
 * page.
 *
 * Grid math: the earlier version sized every tile by its own source
 * screenshot's aspect ratio (740/866, 588/375, ...), which meant the tall
 * left tile's height and the stacked right-column's total height (top +
 * gap + bottom row) were two numbers that just happened not to add up --
 * an uneven bottom edge, exactly Joe's "不平整的矩形" complaint. Fixed by
 * inverting the dependency: the OUTER grid gets one fixed `aspect-[]`, and
 * every tile fills its slot via `h-full`/`flex-[]` instead of declaring
 * its own ratio -- so the two columns are mathematically guaranteed to end
 * at the same height regardless of what the source photos' own dimensions
 * are. `object-cover` already crops each photo to whatever its slot ends
 * up being, same as before.
 */
export function OnSite({ outcome }: { outcome: Record<string, unknown> }) {
  const items = Array.isArray(outcome.items) ? (outcome.items as string[]) : [];
  const intro = items[0];

  const photo = (key: string) => outcome[key] as string | undefined;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-10 md:gap-12">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <SectionKicker color="blue">ON SITE</SectionKicker>
          <h2 className="font-display text-[24px] font-bold text-grey-800 md:text-[32px]">展覽現場實況</h2>
          {intro && (
            <p className="font-nunito max-w-[60ch] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
              {intro}
            </p>
          )}
        </SlideIn>

        <div className="grid aspect-[16/10] w-full grid-cols-2 gap-3 md:gap-4">
          <PhotoTile
            url={photo("onsitePhoto1ImageUrl")}
            alt="NTSO影音特區觸控螢幕實景"
            delay={0}
            from={{ x: -48, y: -36, rotate: -5 }}
            className="h-full"
          />
          <div className="flex h-full flex-col gap-3 md:gap-4">
            <PhotoTile
              url={photo("onsitePhoto2ImageUrl")}
              alt="舞台之外的風景展區實景"
              delay={0.08}
              from={{ x: 0, y: -56, rotate: 4 }}
              className="flex-[4]"
            />
            <div className="grid flex-[5] grid-cols-2 gap-3 md:gap-4">
              <PhotoTile
                url={photo("onsitePhoto3ImageUrl")}
                alt="國臺交之音世界地圖展區實景"
                delay={0.16}
                from={{ x: -56, y: 32, rotate: -6 }}
                className="h-full"
              />
              <PhotoTile
                url={photo("onsitePhoto4ImageUrl")}
                alt="觀眾參觀展區走道實景"
                delay={0.24}
                from={{ x: 56, y: 32, rotate: 6 }}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

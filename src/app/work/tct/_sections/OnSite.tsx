"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Photo {
  url?: string;
  alt: string;
  delay: number;
  className: string;
}

/** One real-photo tile -- `object-cover` is fine here (unlike the
 * exhibition-zone screenshots, which needed `contain` to avoid cropping UI
 * chrome/text) since these are ordinary photographs where a small amount
 * of edge cropping to fill the tile reads as normal, not lossy. */
function PhotoTile({ url, alt, delay, className }: Photo) {
  return (
    <SlideIn delay={delay} className={className}>
      <div className="h-full w-full overflow-hidden rounded-[16px] bg-grey-50 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} className="h-full w-full border border-grey-100 object-cover" />
        ) : (
          // Dashed border + icon, matching `MockupSlot`'s established
          // "media待上傳" convention -- see ExhibitionZones.tsx's DeviceFrame
          // empty state for the same fix applied there.
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-grey-300 p-4 text-center">
            <ImageSquare size={24} weight="light" className="text-grey-400" />
            <p className="font-nunito text-[11px] font-bold leading-relaxed text-grey-400">現場照片待上傳</p>
          </div>
        )}
      </div>
    </SlideIn>
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
 * wide, two small) rather than one flattened collage image -- the
 * previous version used a single pre-composited screenshot of the whole
 * grid, which meant there was nothing for the admin to individually
 * replace. Each tile is its own top-level `outcome.onsitePhotoNImageUrl`
 * field, so each has its own upload dropzone in the admin like every
 * other media field on this page.
 *
 * Content model: reuses the `outcome` row's `items[0]` (the run-summary
 * sentence, e.g. "展覽期間...透過大螢幕觸控與沉浸式體驗...") as this
 * section's intro -- the same line the original site used here -- so
 * `Outcome.tsx` doesn't repeat it.
 */
export function OnSite({ outcome }: { outcome: Record<string, unknown> }) {
  const items = Array.isArray(outcome.items) ? (outcome.items as string[]) : [];
  const intro = items[0];

  const photo = (key: string) => outcome[key] as string | undefined;

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

        <div className="grid w-full grid-cols-2 gap-3 md:gap-4">
          <PhotoTile
            url={photo("onsitePhoto1ImageUrl")}
            alt="NTSO影音特區觸控螢幕實景"
            delay={0.1}
            className="row-span-2 aspect-[740/866]"
          />
          <div className="flex flex-col gap-3 md:gap-4">
            <PhotoTile
              url={photo("onsitePhoto2ImageUrl")}
              alt="舞台之外的風景展區實景"
              delay={0.15}
              className="aspect-[588/375]"
            />
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <PhotoTile
                url={photo("onsitePhoto3ImageUrl")}
                alt="國臺交之音世界地圖展區實景"
                delay={0.2}
                className="aspect-[294/418]"
              />
              <PhotoTile
                url={photo("onsitePhoto4ImageUrl")}
                alt="觀眾參觀展區走道實景"
                delay={0.25}
                className="aspect-[314/418]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

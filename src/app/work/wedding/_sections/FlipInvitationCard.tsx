"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { MouseTilt } from "@/components/design-system/MouseTilt";

type FlipState = 0 | 1 | 2;

function FacePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-[20px] border-2 border-dashed border-grey-300 bg-grey-50 text-center text-grey-500">
      <p className="font-nunito px-4 text-[11px] font-bold">{label}</p>
    </div>
  );
}

interface FlipInvitationCardProps {
  /** Big card front + small card front + the real paperclip, all one flat
   * photo/export -- baked together in Joe's own design tool rather than
   * composited live (see conversation: live-compositing a separate clip
   * overlay over separate card layers never read as convincingly "real"
   * at small render sizes, however much the clip graphic itself was
   * tuned). This is the *only* image shown for the big card's front -- it
   * never gets swapped out, so its pixels are truly static across states
   * 0 and 1 (see `smallBackComposedImageUrl`). */
  frontComposedImageUrl?: string;
  /** An overlay the SAME full canvas size as `frontComposedImageUrl`,
   * transparent everywhere except the small card's own rectangle, which
   * shows the small card's back (the 回文/info side) + the clip. Stacked
   * directly on top of `frontComposedImageUrl` at `inset-0` and faded in
   * only for state 1 -- NOT a second full composite swapped in for the
   * whole card. Two full composites that only differ in one corner still
   * read as the big card "flickering" on every crossfade, however small
   * the actual pixel difference, because the whole image element gets
   * replaced; an overlay whose only non-transparent pixels are the
   * changing ones means the big card's own `<img>` element is never
   * touched at all during this transition. */
  smallBackComposedImageUrl?: string;
  /** The big card's own back + the clip (shown from its own back, since
   * it's a continuous physical object still pinned once the card's
   * turned over) -- a full separate photo, swapped in via a real flip
   * rather than overlaid, since the big card's geometry genuinely changes
   * here. */
  backComposedImageUrl?: string;
}

/**
 * Click-to-cycle presentation of the print invitation's three real states
 * (大卡小卡皆正面 → 小卡翻面露出回文 → 大卡翻面露出背面). Previously this
 * assembled every state live from 4 separate photographed faces plus a
 * CSS-positioned paperclip overlay -- a real `transform-style:preserve-3d`
 * flip per card, with the clip as a floating absolutely-positioned image
 * on top. That fought CSS the whole way and, per Joe, never actually
 * looked like the real object no matter how the clip graphic was tuned.
 * Then it briefly became three full flat composites swapped in and out --
 * simpler, but swapping the *whole* big-card image for the 0↔1 transition
 * still read as the big card changing (either flipping, or just
 * flickering on a crossfade) even though its own pixels never actually
 * differ between those two states.
 *
 * Now the big card's front is ONE static image
 * (`frontComposedImageUrl`) that's always rendered and never swapped
 * across states 0 and 1; `smallBackComposedImageUrl` is a same-size
 * transparent-everywhere-but-the-small-card overlay that just fades in
 * on top of it for state 1. Only the 1→2 and 2→0 transitions -- the big
 * card genuinely turning to its own back and back again -- swap the
 * whole image, via a real rotateY-out/rotateY-in flip.
 *
 * Wrapped in `MouseTilt` so the whole card tilts toward the cursor on
 * desktop, independent of the click-driven flip (see MouseTilt's own
 * doc comment for why those two rotateY sources don't fight each other).
 */
export function FlipInvitationCard({
  frontComposedImageUrl,
  smallBackComposedImageUrl,
  backComposedImageUrl,
}: FlipInvitationCardProps) {
  const [state, setState] = useState<FlipState>(0);

  const hasAnyMedia = Boolean(frontComposedImageUrl || smallBackComposedImageUrl || backComposedImageUrl);
  if (!hasAnyMedia) {
    return <MockupSlot label="紙本喜帖 素材製作中" aspect="aspect-[3/4]" />;
  }

  const isBack = state === 2;
  const showSmallBack = state === 1;
  const nextHint = state === 0 ? "點擊查看小卡背面" : state === 1 ? "點擊查看大卡背面" : "點擊返回正面";

  return (
    <MouseTilt className="block">
      <button
        type="button"
        onClick={() => setState((s) => ((s + 1) % 3) as FlipState)}
        aria-label={nextHint}
        className="group relative block aspect-[3/4] w-full cursor-pointer [perspective:1600px] [transform-style:preserve-3d]"
      >
        <AnimatePresence mode="wait">
          {isBack ? (
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 [backface-visibility:hidden]"
            >
              {backComposedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={backComposedImageUrl} alt="紙本喜帖背面（含迴紋針）" className="h-full w-full object-contain" />
              ) : (
                <FacePlaceholder label="背面 素材製作中" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 [backface-visibility:hidden]"
            >
              <div className="relative h-full w-full">
                {frontComposedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={frontComposedImageUrl}
                    alt="紙本喜帖正面（含小卡正面與迴紋針）"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : (
                  <FacePlaceholder label="正面 素材製作中" />
                )}
                {smallBackComposedImageUrl && (
                  <motion.img
                    src={smallBackComposedImageUrl}
                    alt="紙本喜帖正面（小卡翻至背面，含迴紋針）"
                    animate={{ opacity: showSmallBack ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discoverability hint -- tap-to-flip isn't a default web pattern,
            so without this nothing signals the card is interactive. Per
            Figma: a white rounded pill with a soft drop-shadow sitting near
            the card's bottom edge (not the black blurred pill this used to
            be). */}
        <span className="pointer-events-none absolute bottom-[9%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-proj-white px-2.5 py-2 font-nunito text-[12px] font-bold text-grey-800 shadow-[0px_2px_4px_rgba(9,9,9,0.2)] transition-opacity group-active:opacity-60">
          <ArrowsClockwise size={16} weight="bold" />
          {nextHint}
        </span>
      </button>
    </MouseTilt>
  );
}

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
   * tuned). */
  frontComposedImageUrl?: string;
  /** Same big card front + clip, but with the small card showing its back
   * (the 回文/info side) instead. */
  smallBackComposedImageUrl?: string;
  /** The big card's own back -- unchanged from before, since the small
   * card (and clip) aren't part of this face at all. */
  backImageUrl?: string;
}

/**
 * Click-to-cycle presentation of the print invitation's three real states
 * (大卡小卡皆正面 → 小卡翻面露出回文 → 大卡翻面露出背面). Previously this
 * assembled every state live from 4 separate photographed faces plus a
 * CSS-positioned paperclip overlay -- a real `transform-style:preserve-3d`
 * flip per card, with the clip as a floating absolutely-positioned image
 * on top. That fought CSS the whole way (a `filter` on the wrong element
 * silently flattens its children's 3D space and breaks
 * `backface-visibility`; a clip sized as a fraction of the card reads as
 * convincing "pinching" at a 360px test width and as illegible scribble at
 * the ~220px the card actually renders at in the grid) and, per Joe, never
 * actually looked like the real object no matter how the clip was tuned.
 *
 * Now there are three flat, pre-composited images (the clip baked in by
 * Joe's own design tool, pixel-perfect, at whatever size it's displayed)
 * and this component just swaps between them -- no live layering, no
 * separate clip element, no backface-visibility/preserve-3d/filter
 * interactions to get wrong.
 *
 * `state` cycles 0 → 1 → 2 → 0 on each tap; each transition swaps the
 * `<img>` via AnimatePresence with a rotateY-out/rotateY-in pair, which
 * reads as the card flipping even though (for the 0↔1 transition
 * especially) it's really just two different flat photos -- the big
 * card's own geometry doesn't actually change between those two, only
 * the small card's area does, but animating the swap as a flip rather
 * than a crossfade keeps all three transitions feeling consistent.
 *
 * Wrapped in `MouseTilt` so the whole card tilts toward the cursor on
 * desktop, independent of the click-driven flip (see MouseTilt's own
 * doc comment for why those two rotateY sources don't fight each other).
 */
export function FlipInvitationCard({
  frontComposedImageUrl,
  smallBackComposedImageUrl,
  backImageUrl,
}: FlipInvitationCardProps) {
  const [state, setState] = useState<FlipState>(0);

  const hasAnyMedia = Boolean(frontComposedImageUrl || smallBackComposedImageUrl || backImageUrl);
  if (!hasAnyMedia) {
    return <MockupSlot label="紙本喜帖 素材製作中" aspect="aspect-[3/4]" />;
  }

  const faces: { src?: string; alt: string; placeholder: string }[] = [
    { src: frontComposedImageUrl, alt: "紙本喜帖正面（含小卡正面）", placeholder: "正面 素材製作中" },
    { src: smallBackComposedImageUrl, alt: "紙本喜帖正面（小卡翻至背面）", placeholder: "小卡背面 素材製作中" },
    { src: backImageUrl, alt: "紙本喜帖背面", placeholder: "背面 素材製作中" },
  ];
  const nextHint = state === 0 ? "點擊查看小卡背面" : state === 1 ? "點擊查看大卡背面" : "點擊返回正面";
  const current = faces[state];

  return (
    <MouseTilt className="block">
      <button
        type="button"
        onClick={() => setState((s) => ((s + 1) % 3) as FlipState)}
        aria-label={nextHint}
        className="group relative block aspect-[3/4] w-full cursor-pointer [perspective:1600px] [transform-style:preserve-3d]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 [backface-visibility:hidden]"
          >
            {current.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.src} alt={current.alt} className="h-full w-full object-contain" />
            ) : (
              <FacePlaceholder label={current.placeholder} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Discoverability hint -- tap-to-flip isn't a default web pattern,
            so without this nothing signals the card is interactive. */}
        <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary-black/70 px-3 py-1.5 font-nunito text-[11px] font-bold text-proj-white backdrop-blur-sm transition-opacity group-active:opacity-60">
          <ArrowsClockwise size={14} weight="bold" />
          {nextHint}
        </span>
      </button>
    </MouseTilt>
  );
}

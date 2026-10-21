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
  /** The big card's own back + the clip, baked in the same way -- the clip
   * stays part of every exported state (it's a continuous physical object
   * pinned to the card, so it's still there once the card's turned over),
   * not just the two front-facing ones. */
  backComposedImageUrl?: string;
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
 * Now there are three flat, pre-composited images -- one per real-object
 * state, the clip baked into all three by Joe's own design tool (it's a
 * continuous physical object, so it's still in frame once the card's
 * flipped to its back too) -- and this component just swaps between them,
 * pixel-perfect at whatever size it's displayed. No live layering, no
 * separate clip element, no backface-visibility/preserve-3d/filter
 * interactions to get wrong.
 *
 * `state` cycles 0 → 1 → 2 → 0 on each tap, swapping the `<img>` via
 * AnimatePresence. The 0↔1 transition only touches the small card -- the
 * big card's own pixels are identical between those two photos -- so it
 * crossfades rather than flips; flipping the *whole* image there read as
 * the big card turning over for no reason, when nothing about it actually
 * changed. Only the 1→2 and 2→0 transitions (the big card genuinely
 * turning to its own back, and back again) get the rotateY-out/rotateY-in
 * flip. `state` and `isBigFlip` (which kind the in-flight transition is)
 * are kept in one `useState` and updated together from the same click, so
 * they're never a render apart from each other.
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
  const [{ state, isBigFlip }, setFlip] = useState<{ state: FlipState; isBigFlip: boolean }>({
    state: 0,
    isBigFlip: false,
  });

  const hasAnyMedia = Boolean(frontComposedImageUrl || smallBackComposedImageUrl || backComposedImageUrl);
  if (!hasAnyMedia) {
    return <MockupSlot label="紙本喜帖 素材製作中" aspect="aspect-[3/4]" />;
  }

  const faces: { src?: string; alt: string; placeholder: string }[] = [
    { src: frontComposedImageUrl, alt: "紙本喜帖正面（含小卡正面與迴紋針）", placeholder: "正面 素材製作中" },
    { src: smallBackComposedImageUrl, alt: "紙本喜帖正面（小卡翻至背面，含迴紋針）", placeholder: "小卡背面 素材製作中" },
    { src: backComposedImageUrl, alt: "紙本喜帖背面（含迴紋針）", placeholder: "背面 素材製作中" },
  ];
  const nextHint = state === 0 ? "點擊查看小卡背面" : state === 1 ? "點擊查看大卡背面" : "點擊返回正面";
  const current = faces[state];

  function handleClick() {
    setFlip(({ state: s }) => {
      const next = ((s + 1) % 3) as FlipState;
      return { state: next, isBigFlip: s === 2 || next === 2 };
    });
  }

  return (
    <MouseTilt className="block">
      <button
        type="button"
        onClick={handleClick}
        aria-label={nextHint}
        className="group relative block aspect-[3/4] w-full cursor-pointer [perspective:1600px] [transform-style:preserve-3d]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={isBigFlip ? { rotateY: -90, opacity: 0 } : { opacity: 0 }}
            animate={isBigFlip ? { rotateY: 0, opacity: 1 } : { opacity: 1 }}
            exit={isBigFlip ? { rotateY: 90, opacity: 0 } : { opacity: 0 }}
            transition={{ duration: isBigFlip ? 0.4 : 0.25, ease: "easeInOut" }}
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

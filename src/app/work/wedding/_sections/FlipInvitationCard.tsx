"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import { MockupSlot } from "@/components/design-system/MockupSlot";

type FlipState = 0 | 1 | 2;

function FacePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-[20px] border-2 border-dashed border-grey-300 bg-grey-50 text-center text-grey-500">
      <p className="font-nunito px-4 text-[11px] font-bold">{label}</p>
    </div>
  );
}

/**
 * A star-shaped paperclip (two slightly offset, open star-wire loops --
 * the real object has its wire looped around twice, not closed) pinching
 * the small card to the big one. Pure SVG rather than a photo, so it's a
 * crisp vector at any size, and the silver gradient sits on the stroke
 * rather than a flat colour so it reads as bent metal, not a flat icon.
 * The `id` suffix on the gradient avoids collisions if this card ever
 * renders twice on one page.
 */
function SilverPaperclip({ className }: { className?: string }) {
  const gradientId = `wedding-silver-clip-${useId()}`;
  return (
    <svg viewBox="0 0 100 94" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#f6f6f8" />
          <stop offset="20%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#8f8f99" />
          <stop offset="55%" stopColor="#dedee2" />
          <stop offset="75%" stopColor="#a6a6b0" />
          <stop offset="100%" stopColor="#f2f2f4" />
        </linearGradient>
      </defs>
      {/* Outer loop */}
      <path
        d="M49.44,6.07 L49.91,14.05 L60.44,41 L89.34,39.67 L66.97,58.01 L77.17,85.09 L52.81,69.48 L30.21,87.55 L37.53,59.55 L13.36,43.65 L42.25,41.95 L37.85,36.51"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner loop -- slightly smaller and rotated, like the second wrap of a real paperclip's wire */}
      <path
        d="M52.04,11.05 L51.67,18.04 L57.87,40.29 L80.91,41.72 L61.67,54.48 L67.43,76.84 L49.35,62.48 L29.86,74.87 L37.93,53.24 L20.13,38.53 L43.19,39.52 L39.92,34.49"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FlipInvitationCardProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  smallFrontImageUrl?: string;
  smallBackImageUrl?: string;
}

/**
 * Click-to-flip presentation of the print invitation's three real states
 * (大卡小卡皆正面 → 小卡翻面露出回文 → 大卡翻面露出背面), composited from
 * 4 photographed faces rather than a video/GIF or an AI-generated render
 * — real CSS 3D transforms over real photos keep every line of text on
 * the card crisp (nothing is regenerated or re-rasterized through a
 * video codec), which was the whole risk with the Google Flow idea.
 * Tap-to-advance (not autoplay or hover) per Joe's explicit call — this
 * section's own signature motif, not reused from any other touchpoint on
 * the page.
 *
 * `state` cycles 0 → 1 → 2 → 0 on each tap:
 *   0: big card front + small card front (resting state)
 *   1: big card front + small card flipped to its back (the 回文)
 *   2: big card flipped to its back (small card fades out — it's pinned
 *      to the front face, so there's nothing to show it against)
 *
 * Standard CSS flip-card technique: a `perspective`-bearing wrapper, a
 * `rotateY`-animated `transform-style: preserve-3d` layer per card, and
 * two `backface-visibility: hidden` faces inside it (the back face
 * pre-rotated 180deg so it only becomes visible once its parent reaches
 * 180deg) -- framer-motion drives the parent's rotation, the static
 * Tailwind arbitrary-property classes on the two face children never
 * animate themselves, so the two don't fight over the `transform` style.
 */
export function FlipInvitationCard({
  frontImageUrl,
  backImageUrl,
  smallFrontImageUrl,
  smallBackImageUrl,
}: FlipInvitationCardProps) {
  const [state, setState] = useState<FlipState>(0);

  const hasAnyMedia = Boolean(frontImageUrl || backImageUrl || smallFrontImageUrl || smallBackImageUrl);
  if (!hasAnyMedia) {
    return <MockupSlot label="紙本喜帖 素材製作中" aspect="aspect-[3/4]" />;
  }

  const bigFlipped = state === 2;
  const smallFlipped = state >= 1;
  const nextHint = state === 0 ? "點擊查看小卡背面" : state === 1 ? "點擊查看大卡背面" : "點擊返回正面";

  return (
    <button
      type="button"
      onClick={() => setState((s) => ((s + 1) % 3) as FlipState)}
      aria-label={nextHint}
      className="group relative block aspect-[3/4] w-full cursor-pointer [perspective:1600px]"
    >
      {/* Big card */}
      <motion.div
        animate={{ rotateY: bigFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {frontImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={frontImageUrl} alt="紙本喜帖正面" className="h-full w-full object-contain" />
          ) : (
            <FacePlaceholder label="正面 素材製作中" />
          )}
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {backImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backImageUrl} alt="紙本喜帖背面" className="h-full w-full object-contain" />
          ) : (
            <FacePlaceholder label="背面 素材製作中" />
          )}
        </div>
      </motion.div>

      {/* Small card, pinned near the top -- fades out once the big card
          itself has flipped, since it's physically attached to the big
          card's front face.

          Split into two nested motion.div's rather than one. The outer
          one needs `drop-shadow-[...]`, but per the CSS Filter Effects
          spec any element with a `filter` is forced to render its
          children as `transform-style: flat` regardless of what
          `transform-style` it's given -- so with the rotateY flip and
          the two [backface-visibility:hidden] faces on *that same*
          element (as this used to be), the 3D space collapsed: the
          "back" face never actually got hidden, and what showed through
          was the front face's own content rendered as a flat mirror
          (confirmed by reproducing it with a minimal repro). The inner
          wrapper below carries the rotateY animation, the preserve-3d,
          and the two faces, but no filter of its own, so its 3D space
          stays intact and backface-visibility works as intended. */}
      {(smallFrontImageUrl || smallBackImageUrl) && (
        <motion.div
          animate={{ opacity: bigFlipped ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute top-[8%] right-[6%] aspect-[3/4] w-[36%] rotate-[-3deg] drop-shadow-[0_10px_16px_rgba(64,50,42,0.3)]"
        >
          <motion.div
            animate={{ rotateY: smallFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative h-full w-full [transform-style:preserve-3d]"
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              {smallFrontImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={smallFrontImageUrl} alt="小卡正面" className="h-full w-full rounded-[8px] object-contain" />
              ) : (
                <FacePlaceholder label="小卡正面" />
              )}
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              {smallBackImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={smallBackImageUrl} alt="小卡背面" className="h-full w-full rounded-[8px] object-contain" />
              ) : (
                <FacePlaceholder label="小卡背面" />
              )}
            </div>
          </motion.div>

          {/* Pins the card on at a fixed angle, independent of the flip --
              a real clip wouldn't rotate with the card underneath it. */}
          <SilverPaperclip className="pointer-events-none absolute -top-[9%] -left-[15%] w-[34%] rotate-[14deg] drop-shadow-[0_4px_6px_rgba(64,50,42,0.4)]" />
        </motion.div>
      )}

      {/* Discoverability hint -- tap-to-flip isn't a default web pattern,
          so without this nothing signals the card is interactive. */}
      <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary-black/70 px-3 py-1.5 font-nunito text-[11px] font-bold text-proj-white backdrop-blur-sm transition-opacity group-active:opacity-60">
        <ArrowsClockwise size={14} weight="bold" />
        {nextHint}
      </span>
    </button>
  );
}

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
 * A star-shaped paperclip, redrawn to match Joe's own reference photo of
 * the real object pinned to a corkboard: an outer star loop, a smaller
 * offset inner star (the wire's second wrap, not concentric with the
 * first), and -- the detail the earlier version was missing -- a small
 * round hook looping off the top of the outer star, which is the part
 * that actually catches over the top edge of a card stack. Pure SVG
 * rather than the reference photo itself: that photo can't be used
 * as-is (see conversation), but it gave an exact shape/proportion
 * reference to redraw from. The `id` suffix on the gradient avoids
 * collisions if this card ever renders twice on one page.
 *
 * Each loop is drawn TWICE to read as round bent wire rather than a flat
 * grey ribbon: a wider base stroke carries a multi-stop silver gradient
 * (alternating light/dark bands, the way a bent wire catches and loses
 * the light at each bend), then a thin near-white stroke follows the
 * exact same path down the middle -- that bright centre line is what
 * actually sells "shiny metal", since a flat single-gradient stroke just
 * reads as a grey outline no matter how many colour stops it has.
 */
function SilverPaperclip({ className }: { className?: string }) {
  const gradientId = `wedding-silver-clip-${useId()}`;
  const outerPath =
    "M56,14 A9,9 0 1 1 55,13.3 L42.51,32.15 L53.98,58.71 L82.82,56.37 L61.1,75.49 L72.24,102.19 L47.35,87.44 L25.4,106.29 L31.73,78.06 L7.03,63 L35.83,60.3 L30.58,54.26";
  const innerPath =
    "M63.17,33.41 L62.07,40.32 L65.07,58.93 L83.68,61.93 L66.91,70.54 L69.8,89.17 L56.44,75.88 L39.62,84.38 L48.12,67.56 L34.83,54.2 L53.46,57.09 L50.74,51.74";
  return (
    <svg viewBox="0 0 92 112" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="5%" y1="0%" x2="95%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="14%" stopColor="#c6c6cc" />
          <stop offset="28%" stopColor="#84848d" />
          <stop offset="44%" stopColor="#e9e9ec" />
          <stop offset="58%" stopColor="#6c6c75" />
          <stop offset="76%" stopColor="#d6d6da" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={outerPath} stroke={`url(#${gradientId})`} strokeWidth={2.6} />
        <path d={outerPath} stroke="#ffffff" strokeOpacity={0.75} strokeWidth={0.8} />
        <path d={innerPath} stroke={`url(#${gradientId})`} strokeWidth={2.3} />
        <path d={innerPath} stroke="#ffffff" strokeOpacity={0.75} strokeWidth={0.7} />
      </g>
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
  const resting = state === 0;
  const nextHint = state === 0 ? "點擊查看小卡背面" : state === 1 ? "點擊查看大卡背面" : "點擊返回正面";

  return (
    <button
      type="button"
      onClick={() => setState((s) => ((s + 1) % 3) as FlipState)}
      aria-label={nextHint}
      className="group relative block aspect-[3/4] w-full cursor-pointer [perspective:1600px]"
    >
      {/* Big card + small card + clip float together as one pinned
          object, not a flat pasted-on image -- a slow, tiny, looping
          rotate/y drift (only while resting; collapsed back to 0 the
          moment a flip starts, so it never fights the flip's own
          rotateY) is what actually reads as "hanging and swaying"
          rather than static. This wrapper (not the button) is also
          what carries [perspective]'s shared 3D space down to both
          cards' own rotateY flips below -- it has no `filter`, so
          unlike the small card's own wrapper (see below) it never
          needs the two-layer split to keep preserve-3d intact. */}
      <motion.div
        animate={resting ? { rotate: [-1.4, 1.4, -1.4], y: [0, -6, 0] } : { rotate: 0, y: 0 }}
        transition={
          resting
            ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4, ease: "easeOut" }
        }
        className="absolute inset-0 [transform-style:preserve-3d]"
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
            className="absolute top-[8%] right-[6%] aspect-[3/4] w-[36%] drop-shadow-[0_10px_16px_rgba(64,50,42,0.3)]"
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

            {/* Straddles the seam between the two cards -- its lower half
                overlaps the small card's top edge, its upper half spills
                onto the big card behind it, so it reads as pinching both
                layers together rather than floating beside the small
                card. Pinned at a fixed angle outside the flip's rotateY
                chain, since a real clip wouldn't rotate with the card
                turning underneath it. */}
            <SilverPaperclip className="pointer-events-none absolute -top-[22%] left-[30%] w-[34%] aspect-[92/112] rotate-[12deg] drop-shadow-[0_3px_5px_rgba(64,50,42,0.4)]" />
          </motion.div>
        )}
      </motion.div>

      {/* Discoverability hint -- tap-to-flip isn't a default web pattern,
          so without this nothing signals the card is interactive. */}
      <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary-black/70 px-3 py-1.5 font-nunito text-[11px] font-bold text-proj-white backdrop-blur-sm transition-opacity group-active:opacity-60">
        <ArrowsClockwise size={14} weight="bold" />
        {nextHint}
      </span>
    </button>
  );
}

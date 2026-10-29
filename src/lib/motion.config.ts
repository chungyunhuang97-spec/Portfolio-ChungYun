/**
 * Every duration / easing / stagger used by the homepage Projects section
 * choreography (Star Drop + secondary motion), in one place so the whole
 * sequence can be retimed without hunting through components. Durations
 * are seconds (GSAP's unit).
 */
export const projectsMotion = {
  /** Section top must be this far into the viewport (fraction of its
   * height from the bottom) before cards/heading enter. */
  enterThreshold: { desktop: 0.3, mobile: 0.15 },

  star: {
    /** Total rotation the star picks up over the Hero -> Projects scrub. */
    flightRotation: 300,
    /** GSAP scrub smoothing (seconds of lag behind the scrollbar). */
    scrub: 0.6,
    landBounce: { from: 1.15, duration: 0.45, ease: "back.out(3)" },
    /** Mobile/touch replacement for the flight: in-place spin pop. */
    pop: { fromScale: 0.2, fromRotation: -160, duration: 0.6, ease: "back.out(1.8)" },
  },

  ripple: { duration: 0.6, ease: "power2.inOut" },

  posterPaste: {
    duration: 0.7,
    stagger: 0.06,
    fromY: 40,
    fromScale: 0.92,
    /** Absolute initial tilt (deg), alternating sign by index when a card
     * has no `enter_rotation` override. */
    rotationRange: [3, 6] as const,
    ease: "back.out(1.4)",
    /** Mobile/touch: translate + fade only. */
    mobile: { duration: 0.5, stagger: 0.06, fromY: 24, ease: "power3.out" },
    /** Delay after the ripple starts before the first card lands. */
    delayAfterLanding: 0.15,
  },

  numberFlip: { duration: 0.3, ease: "power2.out" },
  maskReveal: { duration: 0.35, ease: "power3.out" },

  decoration: {
    draw: { duration: 0.5, ease: "power1.inOut" },
    pop: { duration: 0.45, ease: "back.out(2.2)" },
    /** Start after the card itself has mostly landed. */
    delay: 0.25,
  },

  heading: {
    eyebrow: { duration: 0.3, ease: "power1.out" },
    letters: { duration: 0.45, stagger: 0.03, ease: "power3.out" },
  },

  /** Desktop/Wide only; max fraction of cover height the image travels. */
  coverParallax: 0.08,

  /** prefers-reduced-motion / choreography disabled: opacity only. */
  reduced: { duration: 0.2 },
} as const;

/** Initial entrance tilt for card `index`: the admin override when set,
 * otherwise alternating -/+ within `rotationRange`. */
export function enterRotationFor(index: number, override: number | null): number {
  if (override !== null) return override;
  const [min, max] = projectsMotion.posterPaste.rotationRange;
  const magnitude = min + ((index * 7) % (max - min + 1));
  return index % 2 === 0 ? -magnitude : magnitude;
}

/** Homepage "02 / ABOUT" motion (components/about/AboutMotion.tsx). */
export const aboutMotion = {
  enterThreshold: projectsMotion.enterThreshold,

  statement: {
    /** Unfilled characters sit at this opacity until the scrub reaches them. */
    dimOpacity: 0.3,
    /** Scrub range on the statement itself (ScrollTrigger start/end). */
    start: "top 80%",
    end: "bottom 40%",
    scrub: 0.5,
    /** Phone / touch: line-by-line fade instead of a scrub. */
    lines: { duration: 0.5, stagger: 0.12, fromY: 14, ease: "power2.out" },
  },

  highlighter: { duration: 0.45, ease: "power2.inOut" },

  photo: { duration: 0.9, fromY: 80, fromRotation: 10, ease: "power3.out" },
  sticker: { duration: 0.5, delay: 0.55, ease: "power2.out" },

  /** Bento poster-paste values, with the tilt halved. */
  traits: { ...projectsMotion.posterPaste, rotationScale: 0.5 },

  stats: { duration: 0.8, ease: "power2.out" },
} as const;

/** Homepage "03 / VIDEO WORKS" motion (components/video-works). */
export const videoMotion = {
  enterThreshold: projectsMotion.enterThreshold,

  /** Blue -> ink film-strip wipe, left to right. */
  wipe: { duration: 0.9, ease: "power2.inOut" },

  /** Entrance: cards start stacked in the middle and deal outwards. */
  deal: {
    delay: 0.35,
    duration: 0.7,
    stagger: 0.07,
    stackOffsetY: 6,
    stackRotation: 4,
    ease: "back.out(1.5)",
    settle: { from: 1.05, duration: 0.35, ease: "back.out(2)" },
    playPop: { duration: 0.35, ease: "back.out(2.5)" },
    /** Phone: cards slide in from the right one after another. */
    mobile: { fromX: 80, duration: 0.5, stagger: 0.07, ease: "power3.out" },
  },

  categories: { fromX: -16, duration: 0.4, stagger: 0.06, ease: "power2.out" },

  /** Category switch: collapse + flip out, then flip in + deal (<=700ms). */
  shuffle: {
    out: { duration: 0.25, ease: "power2.in" },
    in: { duration: 0.35, stagger: 0.04, ease: "back.out(1.4)" },
    titleChars: { duration: 0.3, stagger: 0.02, ease: "power3.out" },
    counter: { duration: 0.3, ease: "power2.out" },
    /** Phone: fade out -> fade in with a small shift. */
    mobile: { out: 0.15, in: 0.25, shiftY: 10 },
  },

  /** Fan arc for neighbour cards (desktop / tablet): sink + tilt per step. */
  arc: { sinkPx: 10, rotationDeg: 4 },

  /** prefers-reduced-motion / choreography disabled. */
  reduced: { duration: 0.2 },
} as const;

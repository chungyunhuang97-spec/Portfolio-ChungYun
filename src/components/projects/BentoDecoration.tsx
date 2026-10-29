import type { Decoration, DecorationPosition } from "@/lib/types";
import {
  DoodleEye,
  DoodlePlus,
  DoodleScribble,
  DoodleSpiral,
  DoodleStar,
} from "@/components/design-system/doodles";

/** Sticker anchored on a card corner, half hanging off the edge so it
 * never sits over the middle of the cover. Top-right is shifted left to
 * clear the arrow button. */
const POSITION: Record<DecorationPosition, string> = {
  "top-left": "left-0 top-0 -translate-x-[30%] -translate-y-[35%]",
  "top-right": "right-16 top-0 -translate-y-[45%]",
  "bottom-left": "bottom-0 left-0 -translate-x-[30%] translate-y-[35%]",
  "bottom-right": "bottom-0 right-0 translate-x-[30%] translate-y-[35%]",
};

/** `draw` decorations get a stroke-dashoffset reveal, `pop` ones a
 * scale+rotate pop (see ProjectsSection's choreography). */
const KIND: Record<Exclude<Decoration, "none">, "draw" | "pop"> = {
  spiral: "draw",
  eye: "draw",
  zigzag: "draw",
  star: "pop",
  plus: "pop",
};

export function BentoDecoration({
  decoration,
  position,
  animate,
  className,
}: {
  decoration: Exclude<Decoration, "none">;
  position: DecorationPosition;
  animate: boolean;
  className?: string;
}) {
  const svgClass = "h-auto w-full";
  return (
    <span
      aria-hidden
      data-decoration={animate ? KIND[decoration] : undefined}
      className={`pointer-events-none absolute z-10 block w-12 md:w-14 desk:w-16 ${POSITION[position]} ${className ?? ""}`}
    >
      {decoration === "star" && <DoodleStar className={svgClass} />}
      {decoration === "plus" && <DoodlePlus className={svgClass} />}
      {decoration === "spiral" && <DoodleSpiral className={svgClass} strokeWidth={7} />}
      {decoration === "zigzag" && <DoodleScribble className={svgClass} strokeWidth={7} />}
      {decoration === "eye" && <DoodleEye className={svgClass} strokeWidth={7} />}
    </span>
  );
}

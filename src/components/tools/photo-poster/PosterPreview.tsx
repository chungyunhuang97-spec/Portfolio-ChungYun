"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { BracketOption, Cutout, FontOption, ShapeOption } from "./types";
import { buildCaptionTokens, clampPct } from "./useCutoutLayout";

interface CoverGeometry {
  boxW: number;
  boxH: number;
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
}

/** Replicates `background-size: cover; background-position: center` math by
 * hand so the same numbers can be reused to crop a small inline thumbnail
 * out of the exact same image, at the exact same scale. */
function computeCoverGeometry(boxW: number, boxH: number, naturalW: number, naturalH: number): CoverGeometry {
  if (!boxW || !boxH || !naturalW || !naturalH) {
    return { boxW, boxH, renderedW: boxW, renderedH: boxH, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.max(boxW / naturalW, boxH / naturalH);
  const renderedW = naturalW * scale;
  const renderedH = naturalH * scale;
  return {
    boxW,
    boxH,
    renderedW,
    renderedH,
    offsetX: (boxW - renderedW) / 2,
    offsetY: (boxH - renderedH) / 2,
  };
}

export interface PosterPreviewProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
  imageUrl: string | null;
  caption: string;
  cutouts: Cutout[];
  onCutoutsChange: (next: Cutout[]) => void;
  locked: boolean;
  squareSizePx: number;
  baseFontSizePx: number;
  fontOption: FontOption;
  bracket: BracketOption;
  shape: ShapeOption;
  topBgColor: string;
  textColor: string;
}

export function PosterPreview({
  canvasRef,
  width,
  height,
  imageUrl,
  caption,
  cutouts,
  onCutoutsChange,
  locked,
  squareSizePx,
  baseFontSizePx,
  fontOption,
  bracket,
  shape,
  topBgColor,
  textColor,
}: PosterPreviewProps) {
  const bottomZoneRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const dragState = useRef<{ id: string; startX: number; startY: number; originXPct: number; originYPct: number } | null>(
    null,
  );

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const el = bottomZoneRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      setBoxSize({ w, h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const geometry = computeCoverGeometry(boxSize.w, boxSize.h, natural.w, natural.h);
  const squareXPct = boxSize.w ? (squareSizePx / boxSize.w) * 100 : 0;
  const squareYPct = boxSize.h ? (squareSizePx / boxSize.h) * 100 : 0;

  const tokens = buildCaptionTokens(caption, cutouts);
  const cutoutById = new Map(cutouts.map((c) => [c.id, c]));

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>, cutout: Cutout) {
    if (locked || !boxSize.w || !boxSize.h) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      id: cutout.id,
      startX: e.clientX,
      startY: e.clientY,
      originXPct: cutout.xPct,
      originYPct: cutout.yPct,
    };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    if (!drag || !boxSize.w || !boxSize.h) return;
    const dxPct = ((e.clientX - drag.startX) / boxSize.w) * 100;
    const dyPct = ((e.clientY - drag.startY) / boxSize.h) * 100;
    const nextX = clampPct(drag.originXPct + dxPct, squareXPct);
    const nextY = clampPct(drag.originYPct + dyPct, squareYPct);
    onCutoutsChange(cutouts.map((c) => (c.id === drag.id ? { ...c, xPct: nextX, yPct: nextY } : c)));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function thumbStyle(cutout: Cutout): React.CSSProperties {
    // xPct/yPct are relative to the *visible* box, not the full scaled
    // image. The box's own viewport starts `-offsetX`/`-offsetY` pixels
    // into the scaled image (offsetX/Y are <= 0, per computeCoverGeometry),
    // so that's the base to add the on-box pixel offset to, giving the
    // target point's position within the full scaled image.
    const left = -geometry.offsetX + (cutout.xPct / 100) * boxSize.w;
    const top = -geometry.offsetY + (cutout.yPct / 100) * boxSize.h;
    return {
      width: squareSizePx,
      height: squareSizePx,
      display: "inline-block",
      verticalAlign: "middle",
      backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
      backgroundColor: imageUrl ? undefined : "#d4d4d8",
      backgroundSize: `${geometry.renderedW}px ${geometry.renderedH}px`,
      // Negate numerically (not by string-prefixing "-") since left/top are
      // already negative whenever the cover-cropped image overflows its
      // box on that axis -- string-prefixing would emit invalid double
      // negatives like "--131px", which the browser silently drops,
      // leaving the previous (stale) background-position in place.
      backgroundPosition: `${-left}px ${-top}px`,
      backgroundRepeat: "no-repeat",
      clipPath: shape.clipPath,
    };
  }

  return (
    <div
      ref={canvasRef}
      className="flex w-full flex-col overflow-hidden shadow-sm"
      style={{ aspectRatio: `${width} / ${height}`, backgroundColor: topBgColor }}
    >
      {/* Top zone: poetic caption with inline cropped-photo thumbnails */}
      <div
        data-role="top-zone"
        className="flex flex-shrink-0 flex-wrap content-start items-center gap-x-1 gap-y-2 px-[6%] py-[7%]"
        style={{
          color: textColor,
          fontFamily: `${fontOption.cssVar}, ${fontOption.fallback}`,
          fontSize: baseFontSizePx,
          lineHeight: 1.5,
        }}
      >
        {tokens.map((token, i) =>
          token.kind === "word" ? (
            <span key={i}>{token.text}</span>
          ) : (
            <span key={i} className="inline-flex items-center" style={{ fontSize: baseFontSizePx }}>
              {bracket.open}
              <span data-cutout-id={token.cutoutId} style={thumbStyle(cutoutById.get(token.cutoutId)!)} />
              {bracket.close}
            </span>
          ),
        )}
      </div>

      {/* Bottom zone: the source photo with draggable cutout windows */}
      <div ref={bottomZoneRef} className="relative min-h-0 flex-1 select-none touch-none bg-neutral-200">
        {imageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${geometry.renderedW}px ${geometry.renderedH}px`,
              backgroundPosition: `${geometry.offsetX}px ${geometry.offsetY}px`,
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
            尚未上傳照片
          </div>
        )}
        {imageUrl &&
          cutouts.map((cutout) => (
            <div
              key={cutout.id}
              data-cutout-id={cutout.id}
              onPointerDown={(e) => handlePointerDown(e, cutout)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="absolute shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
              style={{
                left: `${cutout.xPct}%`,
                top: `${cutout.yPct}%`,
                width: squareSizePx,
                height: squareSizePx,
                backgroundColor: topBgColor,
                clipPath: shape.clipPath,
                cursor: locked ? "default" : "grab",
              }}
            />
          ))}
      </div>
    </div>
  );
}

import type { BracketOption, Cutout, ShapeOption } from "./types";
import { buildCaptionTokens } from "./useCutoutLayout";
import { canvasShapePath } from "./shapes";

interface CoverGeometry {
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
}

function coverGeometry(boxW: number, boxH: number, naturalW: number, naturalH: number): CoverGeometry {
  const scale = Math.max(boxW / naturalW, boxH / naturalH);
  const renderedW = naturalW * scale;
  const renderedH = naturalH * scale;
  return { renderedW, renderedH, offsetX: (boxW - renderedW) / 2, offsetY: (boxH - renderedH) / 2 };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load source image"));
    img.src = src;
  });
}

interface LineItem {
  kind: "word" | "cutout";
  text?: string;
  cutoutId?: string;
  x: number;
  width: number;
}

export interface RenderPosterParams {
  width: number;
  height: number;
  imageUrl: string;
  caption: string;
  cutouts: Cutout[];
  shape: ShapeOption;
  bracket: BracketOption;
  topBgColor: string;
  textColor: string;
  baseFontSizePx: number;
  squareSizePx: number;
  /** Resolved CSS font-family string (read from the live preview's
   * computed style) so the exported text uses the exact font the user
   * sees, including hashed next/font family names. */
  fontFamily: string;
  /** CSS px width the slider-driven values above are calibrated against
   * (the live preview's current rendered width) -- everything is scaled
   * up uniformly from there to the export resolution, the same idea as
   * html-to-image's pixelRatio, but computed by hand. */
  previewWidthPx: number;
}

/** Renders the poster directly onto a <canvas>, entirely by hand --
 * deliberately not a DOM screenshot (html-to-image/html2canvas-style
 * libraries rasterize via an SVG <foreignObject>, which WebKit/Safari is
 * known to handle unreliably for background-image + clip-path together,
 * silently dropping content instead of erroring). Canvas 2D's clip(),
 * drawImage() and Path2D are solid across all engines including iOS
 * Safari, so this is the reliable option for a tool meant to be used and
 * shared from a phone. */
export async function renderPosterToCanvas(params: RenderPosterParams): Promise<HTMLCanvasElement> {
  const {
    width,
    height,
    imageUrl,
    caption,
    cutouts,
    shape,
    bracket,
    topBgColor,
    textColor,
    baseFontSizePx,
    squareSizePx,
    fontFamily,
    previewWidthPx,
  } = params;

  const scale = previewWidthPx ? width / previewWidthPx : 1;
  const fontPx = Math.max(1, baseFontSizePx * scale);
  const squarePx = Math.max(1, squareSizePx * scale);
  const gapX = 4 * scale; // matches Tailwind gap-x-1 (0.25rem)
  const gapY = 8 * scale; // matches Tailwind gap-y-2 (0.5rem)
  const padX = width * 0.06; // matches px-[6%]
  const padY = width * 0.07; // matches py-[7%] -- CSS % padding resolves against width, not height
  const lineHeight = fontPx * 1.5;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = topBgColor;
  ctx.fillRect(0, 0, width, height);

  const img = await loadImage(imageUrl);

  ctx.font = `${fontPx}px ${fontFamily}`;
  const bracketOpenW = bracket.open ? ctx.measureText(bracket.open).width : 0;
  const bracketCloseW = bracket.close ? ctx.measureText(bracket.close).width : 0;

  const tokens = buildCaptionTokens(caption, cutouts);
  const availableWidth = Math.max(1, width - padX * 2);

  // --- Layout pass: word-wrap the token stream (mirrors the live
  // preview's flex-wrap layout) without drawing anything yet, so we know
  // the text block's total height before deciding where the photo starts.
  const lines: LineItem[][] = [];
  let currentLine: LineItem[] = [];
  let cursorX = 0;

  function commitLine() {
    if (currentLine.length) lines.push(currentLine);
    currentLine = [];
    cursorX = 0;
  }

  for (const token of tokens) {
    if (token.kind === "word") {
      const w = ctx.measureText(token.text).width;
      if (cursorX > 0 && cursorX + w > availableWidth) commitLine();
      currentLine.push({ kind: "word", text: token.text, x: cursorX, width: w });
      cursorX += w + gapX;
    } else {
      const w = bracketOpenW + squarePx + bracketCloseW;
      if (cursorX > 0 && cursorX + w > availableWidth) commitLine();
      currentLine.push({ kind: "cutout", cutoutId: token.cutoutId, x: cursorX, width: w });
      cursorX += w + gapX;
    }
  }
  commitLine();

  const rowHeights = lines.map((line) => (line.some((it) => it.kind === "cutout") ? Math.max(lineHeight, squarePx) : lineHeight));
  const totalTextHeight = rowHeights.reduce((a, b) => a + b, 0) + gapY * Math.max(0, lines.length - 1);
  const topZoneHeight = Math.min(height, padY * 2 + totalTextHeight);
  const bottomZoneY = topZoneHeight;
  const bottomZoneHeight = Math.max(0, height - topZoneHeight);

  const bottomGeom = coverGeometry(width, bottomZoneHeight, img.naturalWidth, img.naturalHeight);
  const cutoutById = new Map(cutouts.map((c) => [c.id, c]));

  function cutoutImagePoint(cutout: Cutout) {
    // Same math as the live preview's thumbStyle: where this cutout's
    // top-left point falls within the full *scaled* source image.
    return {
      left: -bottomGeom.offsetX + (cutout.xPct / 100) * width,
      top: -bottomGeom.offsetY + (cutout.yPct / 100) * bottomZoneHeight,
    };
  }

  // --- Paint pass: caption text + inline cropped thumbnails ---
  ctx.font = `${fontPx}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = "alphabetic";

  let rowY = padY;
  lines.forEach((line, rowIndex) => {
    const rowHeight = rowHeights[rowIndex];
    const baselineY = rowY + rowHeight / 2 + fontPx * 0.35;

    line.forEach((item) => {
      const drawX = padX + item.x;
      if (item.kind === "word") {
        ctx.fillText(item.text!, drawX, baselineY);
        return;
      }
      const cutout = cutoutById.get(item.cutoutId!);
      if (!cutout) return;

      const boxY = rowY + (rowHeight - squarePx) / 2;
      if (bracket.open) ctx.fillText(bracket.open, drawX, baselineY);
      const imgX = drawX + bracketOpenW;

      if (bottomZoneHeight > 0) {
        const { left, top } = cutoutImagePoint(cutout);
        const path = canvasShapePath(shape.id, imgX, boxY, squarePx);
        ctx.save();
        ctx.clip(path);
        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          imgX - left,
          boxY - top,
          bottomGeom.renderedW,
          bottomGeom.renderedH,
        );
        ctx.restore();
      }

      if (bracket.close) ctx.fillText(bracket.close, imgX + squarePx, baselineY);
    });
    rowY += rowHeight + gapY;
  });

  // --- Bottom zone: full photo, then the shaped mask "holes" ---
  if (bottomZoneHeight > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, bottomZoneY, width, bottomZoneHeight);
    ctx.clip();
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      bottomGeom.offsetX,
      bottomZoneY + bottomGeom.offsetY,
      bottomGeom.renderedW,
      bottomGeom.renderedH,
    );
    ctx.restore();

    ctx.fillStyle = topBgColor;
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 4 * scale;
    ctx.shadowOffsetY = 1 * scale;
    cutouts.forEach((cutout) => {
      const x = (cutout.xPct / 100) * width;
      const y = bottomZoneY + (cutout.yPct / 100) * bottomZoneHeight;
      ctx.fill(canvasShapePath(shape.id, x, y, squarePx));
    });
    ctx.shadowColor = "transparent";
  }

  return canvas;
}

"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { BRACKET_OPTIONS, FONT_OPTIONS, generatePoeticCaption, SHAPE_OPTIONS } from "./constants";
import { CanvasSizeStep } from "./CanvasSizeStep";
import { ControlPanel } from "./ControlPanel";
import { PosterPreview } from "./PosterPreview";
import type { BracketStyleId, CanvasPreset, Cutout, FontOptionId, ShapeId } from "./types";
import { randomizeCutouts, resizeCutouts, wordCountOf } from "./useCutoutLayout";

const DEFAULT_CUTOUT_COUNT = 6;
const INITIAL_CAPTION = generatePoeticCaption();

export function PhotoPosterTool() {
  const [preset, setPreset] = useState<CanvasPreset | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState(INITIAL_CAPTION);
  const [cutouts, setCutouts] = useState<Cutout[]>(() =>
    randomizeCutouts(DEFAULT_CUTOUT_COUNT, wordCountOf(INITIAL_CAPTION)),
  );
  const [locked, setLocked] = useState(false);
  const [shapeId, setShapeId] = useState<ShapeId>("square");
  const [scaleMultiplier, setScaleMultiplier] = useState(2);
  const [baseFontSizePx, setBaseFontSizePx] = useState(32);
  const [fontOptionId, setFontOptionId] = useState<FontOptionId>("sans");
  const [bracketId, setBracketId] = useState<BracketStyleId>("round-small");
  const [topBgColor, setTopBgColor] = useState("#ebebeb");
  const [textColor, setTextColor] = useState("#111111");
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCutoutCountChange = useCallback(
    (n: number) => {
      setCutouts((prev) => resizeCutouts(prev, n, wordCountOf(caption)));
    },
    [caption],
  );

  // Re-rolls both the photo position *and* which word in the caption each
  // cutout's thumbnail lands after -- the user types their own caption, so
  // this is the one "shuffle the cutouts" action rather than two separate
  // randomizers.
  const handleRandomize = useCallback(() => {
    setCutouts((prev) => randomizeCutouts(prev.length, wordCountOf(caption)));
  }, [caption]);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current || !preset) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const renderedWidth = canvasRef.current.getBoundingClientRect().width;
      const pixelRatio = renderedWidth ? preset.width / renderedWidth : 1;
      const dataUrl = await toPng(canvasRef.current, { pixelRatio, cacheBust: true });
      const link = document.createElement("a");
      link.download = "photo-poster.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }, [preset]);

  if (!preset) {
    return <CanvasSizeStep onSelect={setPreset} />;
  }

  const fontOption = FONT_OPTIONS.find((f) => f.id === fontOptionId)!;
  const bracket = BRACKET_OPTIONS.find((b) => b.id === bracketId)!;
  const shape = SHAPE_OPTIONS.find((s) => s.id === shapeId)!;
  const squareSizePx = baseFontSizePx * scaleMultiplier;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
      <div className="w-full lg:w-80 lg:flex-shrink-0">
        <ControlPanel
          preset={preset}
          onChangeSize={() => setPreset(null)}
          imageUrl={imageUrl}
          onImageChange={setImageUrl}
          caption={caption}
          onCaptionChange={setCaption}
          onRegenerateCaption={() => setCaption(generatePoeticCaption())}
          cutoutCount={cutouts.length}
          onCutoutCountChange={handleCutoutCountChange}
          shapeId={shapeId}
          onShapeChange={setShapeId}
          scaleMultiplier={scaleMultiplier}
          onScaleChange={setScaleMultiplier}
          baseFontSizePx={baseFontSizePx}
          onFontSizeChange={setBaseFontSizePx}
          locked={locked}
          onToggleLocked={() => setLocked((v) => !v)}
          onRandomize={handleRandomize}
          fontOptionId={fontOptionId}
          onFontOptionChange={setFontOptionId}
          bracketId={bracketId}
          onBracketChange={setBracketId}
          topBgColor={topBgColor}
          onTopBgColorChange={setTopBgColor}
          textColor={textColor}
          onTextColorChange={setTextColor}
          onExport={handleExport}
          exporting={exporting}
        />
      </div>

      <div className="mx-auto w-full max-w-md">
        <PosterPreview
          canvasRef={canvasRef}
          width={preset.width}
          height={preset.height}
          imageUrl={imageUrl}
          caption={caption}
          cutouts={cutouts}
          onCutoutsChange={setCutouts}
          locked={locked}
          squareSizePx={squareSizePx}
          baseFontSizePx={baseFontSizePx}
          fontOption={fontOption}
          bracket={bracket}
          shape={shape}
          topBgColor={topBgColor}
          textColor={textColor}
        />
        <p className="mt-3 text-center text-xs text-ink-faint">
          畫布解析度：{preset.width} × {preset.height} · 按住下半部方塊可自由拖曳
        </p>
      </div>
    </div>
  );
}

export function PhotoPosterHeader() {
  return (
    <div className="border-b border-line bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
          <CaretLeft size={16} />
          回作品集
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { renderBody, SECTION_LABELS } from "@/components/SectionBlock";
import type { Project, ProjectSection } from "@/lib/types";
import {
  BREAKPOINTS,
  CANVAS_WIDTH,
  type Breakpoint,
  type LayoutBlock,
  type PageLayout,
  type TextAlign,
} from "@/lib/layout-types";
import {
  savePageLayoutBreakpoint,
  updateHeroText,
  updateSectionText,
} from "@/lib/layout-actions";
import { buildDefaultBlocksForBreakpoint } from "@/lib/layout-data";

interface CanvasEditorProps {
  project: Project;
  sections: ProjectSection[];
  initialLayout: PageLayout;
}

const BREAKPOINT_LABELS: Record<Breakpoint, string> = {
  desktop: "電腦",
  tablet: "平板",
  mobile: "手機",
};

export function CanvasEditor({ project, sections, initialLayout }: CanvasEditorProps) {
  const [layout, setLayout] = useState<PageLayout>(initialLayout);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [altHeld, setAltHeld] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<HTMLDivElement[]>([]);
  const [guidelineTargets, setGuidelineTargets] = useState<HTMLDivElement[]>([]);

  const elementRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const selectoRef = useRef<Selecto>(null);

  const blocks = layout[breakpoint];
  const canvasWidth = CANVAS_WIDTH[breakpoint];
  const canvasHeight = useMemo(
    () => Math.max(600, blocks.reduce((max, b) => Math.max(max, b.y + b.height), 0) + 120),
    [blocks]
  );

  // Derived purely from already-known block geometry (canvas-space x/y/w/h),
  // no DOM measurement needed -- avoids reading refs during render/effects.
  const measure = useMemo(() => {
    if (!altHeld || selectedIds.length !== 1 || !hoveredId || hoveredId === selectedIds[0]) {
      return null;
    }
    const from = blocks.find((b) => b.id === selectedIds[0]);
    const to = blocks.find((b) => b.id === hoveredId);
    if (!from || !to) return null;
    return { from, to };
  }, [altHeld, hoveredId, selectedIds, blocks]);

  // react-moveable/react-selecto read the DOM directly and must not render
  // during SSR/first paint (they'd fight hydration) -- this mount flag is
  // the standard, intentional exception to "don't setState in an effect".
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Reset selection whenever the block list identity changes (breakpoint
  // switch, or an element that was selected no longer exists in this
  // breakpoint's block list). This synchronizes React state with a change
  // that originates outside any single event handler (switching breakpoints
  // swaps the entire `blocks` array), so it belongs in an effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds((prev) => prev.filter((id) => blocks.some((b) => b.id === id)));
  }, [blocks]);

  // Re-resolve the actual DOM elements for the current selection (and for
  // every unselected sibling, used as Figma-style snap guidelines) whenever
  // the selection or the mounted canvas changes (ref reads live here, in an
  // effect, not during render).
  useEffect(() => {
    const selected = selectedIds
      .map((id) => elementRefs.current.get(id))
      .filter((el): el is HTMLDivElement => Boolean(el));
    setSelectedTargets(selected);

    const guidelines = blocks
      .filter((b) => !selectedIds.includes(b.id))
      .map((b) => elementRefs.current.get(b.id))
      .filter((el): el is HTMLDivElement => Boolean(el));
    setGuidelineTargets(guidelines);
  }, [selectedIds, blocks, mounted]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Alt") setAltHeld(true);
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Alt") setAltHeld(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  function updateBlock(id: string, patch: Partial<LayoutBlock>) {
    setLayout((prev) => ({
      ...prev,
      [breakpoint]: prev[breakpoint].map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function alignSelected(mode: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") {
    if (selectedIds.length === 0) return;
    const selected = blocks.filter((b) => selectedIds.includes(b.id));
    if (selected.length === 0) return;

    let ref: number;
    if (mode === "left") ref = Math.min(...selected.map((b) => b.x));
    else if (mode === "right") ref = Math.max(...selected.map((b) => b.x + b.width));
    else if (mode === "hcenter") ref = Math.min(...selected.map((b) => b.x + b.width / 2));
    else if (mode === "top") ref = Math.min(...selected.map((b) => b.y));
    else if (mode === "bottom") ref = Math.max(...selected.map((b) => b.y + b.height));
    else ref = Math.min(...selected.map((b) => b.y + b.height / 2));

    setLayout((prev) => ({
      ...prev,
      [breakpoint]: prev[breakpoint].map((b) => {
        if (!selectedIds.includes(b.id)) return b;
        if (mode === "left") return { ...b, x: ref };
        if (mode === "right") return { ...b, x: ref - b.width };
        if (mode === "hcenter") return { ...b, x: ref - b.width / 2 };
        if (mode === "top") return { ...b, y: ref };
        if (mode === "bottom") return { ...b, y: ref - b.height };
        return { ...b, y: ref - b.height / 2 };
      }),
    }));
  }

  function setTextAlign(align: TextAlign) {
    setLayout((prev) => ({
      ...prev,
      [breakpoint]: prev[breakpoint].map((b) =>
        selectedIds.includes(b.id) ? { ...b, textAlign: align } : b
      ),
    }));
  }

  // Escape hatch: if manual dragging/resizing has left this breakpoint's
  // layout in a broken/overlapping state, throw it away and regenerate the
  // same clean vertical stack that a brand-new page starts from. Only
  // touches the current breakpoint -- the others are untouched, matching
  // the "each breakpoint is independent" model.
  function resetToDefault() {
    if (
      !confirm(
        `確定要將「${BREAKPOINT_LABELS[breakpoint]}」版面重設為預設排版嗎？此斷點目前的手動調整會被清除（不影響其他斷點，重設後需要按「儲存」才會生效）。`
      )
    ) {
      return;
    }
    const fresh = buildDefaultBlocksForBreakpoint(
      breakpoint,
      Boolean(project.tagline),
      Boolean(project.subtitle),
      sections
    );
    setLayout((prev) => ({ ...prev, [breakpoint]: fresh }));
    setSelectedIds([]);
  }

  function handleSave() {
    startSaving(async () => {
      const result = await savePageLayoutBreakpoint(project.slug, breakpoint, layout[breakpoint]);
      setSaveMessage(result.success ? `已儲存（${BREAKPOINT_LABELS[breakpoint]}）` : `儲存失敗：${result.error}`);
      setTimeout(() => setSaveMessage(null), 3000);
    });
  }

  function handleHeroBlur(field: "title" | "subtitle" | "tagline", value: string) {
    if (value === (project as unknown as Record<string, string>)[field]) return;
    startSaving(async () => {
      await updateHeroText(project.id, project.slug, field, value);
    });
  }

  function handleSectionBlur(sectionId: string, value: string) {
    startSaving(async () => {
      await updateSectionText(sectionId, project.slug, value);
    });
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-admin-bg">
      <Toolbar
        breakpoint={breakpoint}
        onBreakpointChange={setBreakpoint}
        onAlign={alignSelected}
        onTextAlign={setTextAlign}
        hasSelection={selectedIds.length > 0}
        canAlignGroup={selectedIds.length > 1}
        onSave={handleSave}
        isSaving={isSaving}
        saveMessage={saveMessage}
        slug={project.slug}
        onResetToDefault={resetToDefault}
      />

      <div ref={setContainerEl} className="relative flex-1 overflow-auto bg-admin-canvas p-16">
        <div
          ref={setCanvasEl}
          className="relative mx-auto bg-white shadow-lg"
          style={{ width: canvasWidth, height: canvasHeight }}
          onMouseLeave={() => setHoveredId(null)}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              ref={(el) => {
                if (el) elementRefs.current.set(block.id, el);
                else elementRefs.current.delete(block.id);
              }}
              data-block-id={block.id}
              className={`canvas-item absolute outline-1 outline-dashed outline-transparent hover:outline-admin-accent/50 ${
                selectedIds.includes(block.id) ? "outline-admin-accent outline-2" : ""
              }`}
              style={{
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height,
                textAlign: block.textAlign,
                zIndex: block.zIndex,
              }}
              onMouseEnter={() => setHoveredId(block.id)}
              onClick={(e) => {
                if (altHeld) return;
                e.stopPropagation();
                setSelectedIds([block.id]);
              }}
            >
              <EditableBlockContent
                block={block}
                project={project}
                sections={sections}
                onHeroBlur={handleHeroBlur}
                onSectionBlur={handleSectionBlur}
              />
            </div>
          ))}

          {measure && <MeasureOverlay from={measure.from} to={measure.to} />}

          {mounted && canvasEl && (
            <Selecto
              ref={selectoRef}
              container={canvasEl}
              dragContainer={canvasEl}
              selectableTargets={[".canvas-item"]}
              hitRate={0}
              selectByClick
              selectFromInside={false}
              toggleContinueSelect={["shift"]}
              onSelect={(e) => {
                const ids = e.selected
                  .map((el) => (el as HTMLElement).dataset.blockId)
                  .filter((id): id is string => Boolean(id));
                setSelectedIds(ids);
              }}
            />
          )}

          {mounted && canvasEl && selectedTargets.length > 0 && (
            <Moveable
              target={selectedTargets}
              container={canvasEl}
              draggable
              resizable
              keepRatio={false}
              // Scroll-awareness: the canvas lives inside the overflow-auto
              // panel below (containerRef), and without telling Moveable
              // about that scroll container, its drag/resize math is
              // computed once from a stale bounding rect -- any scroll
              // (including auto-scroll near the edges while dragging) makes
              // the box visibly drift away from the cursor. This is what
              // caused resize to "跑掉".
              scrollable
              scrollContainer={containerEl ?? undefined}
              scrollThreshold={40}
              onScroll={({ scrollContainer, direction }) => {
                scrollContainer.scrollBy(direction[0] * 12, direction[1] * 12);
              }}
              // Figma/Framer-style smart guides: snap to the canvas bounds
              // AND to every other block's edges/centers, with visible
              // snap lines, instead of freehand pixel-guessing.
              snappable
              snapGap
              snapDirections={{ top: true, right: true, bottom: true, left: true, center: true, middle: true }}
              elementSnapDirections={{ top: true, right: true, bottom: true, left: true, center: true, middle: true }}
              snapThreshold={5}
              isDisplaySnapDigit
              elementGuidelines={guidelineTargets}
              bounds={{ left: 0, top: 0, right: canvasWidth, bottom: canvasHeight, position: "css" }}
              onDrag={({ target, left, top }) => {
                (target as HTMLElement).style.left = `${left}px`;
                (target as HTMLElement).style.top = `${top}px`;
              }}
              onDragEnd={({ target }) => {
                const id = (target as HTMLElement).dataset.blockId;
                if (!id) return;
                updateBlock(id, {
                  x: parseFloat((target as HTMLElement).style.left),
                  y: parseFloat((target as HTMLElement).style.top),
                });
              }}
              onDragGroup={({ events }) => {
                events.forEach(({ target, left, top }) => {
                  (target as HTMLElement).style.left = `${left}px`;
                  (target as HTMLElement).style.top = `${top}px`;
                });
              }}
              onDragGroupEnd={({ events }) => {
                events.forEach(({ target }) => {
                  const id = (target as HTMLElement).dataset.blockId;
                  if (!id) return;
                  updateBlock(id, {
                    x: parseFloat((target as HTMLElement).style.left),
                    y: parseFloat((target as HTMLElement).style.top),
                  });
                });
              }}
              onResize={({ target, width, height, drag }) => {
                (target as HTMLElement).style.width = `${width}px`;
                (target as HTMLElement).style.height = `${height}px`;
                (target as HTMLElement).style.left = `${drag.left}px`;
                (target as HTMLElement).style.top = `${drag.top}px`;
              }}
              onResizeEnd={({ target }) => {
                const el = target as HTMLElement;
                const id = el.dataset.blockId;
                if (!id) return;
                updateBlock(id, {
                  x: parseFloat(el.style.left),
                  y: parseFloat(el.style.top),
                  width: parseFloat(el.style.width),
                  height: parseFloat(el.style.height),
                });
              }}
              // Multi-select resize was previously unhandled entirely --
              // dragging a handle with 2+ blocks selected did nothing at
              // all (no live feedback, no persisted change), since Moveable
              // only auto-applies transforms for target arrays with 2+
              // elements when onResizeGroup/onResizeGroupEnd exist.
              onResizeGroup={({ events }) => {
                events.forEach(({ target, width, height, drag }) => {
                  (target as HTMLElement).style.width = `${width}px`;
                  (target as HTMLElement).style.height = `${height}px`;
                  (target as HTMLElement).style.left = `${drag.left}px`;
                  (target as HTMLElement).style.top = `${drag.top}px`;
                });
              }}
              onResizeGroupEnd={({ events }) => {
                events.forEach(({ target }) => {
                  const el = target as HTMLElement;
                  const id = el.dataset.blockId;
                  if (!id) return;
                  updateBlock(id, {
                    x: parseFloat(el.style.left),
                    y: parseFloat(el.style.top),
                    width: parseFloat(el.style.width),
                    height: parseFloat(el.style.height),
                  });
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  breakpoint,
  onBreakpointChange,
  onAlign,
  onTextAlign,
  hasSelection,
  canAlignGroup,
  onSave,
  isSaving,
  saveMessage,
  slug,
  onResetToDefault,
}: {
  breakpoint: Breakpoint;
  onBreakpointChange: (bp: Breakpoint) => void;
  onAlign: (mode: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => void;
  onTextAlign: (align: TextAlign) => void;
  hasSelection: boolean;
  canAlignGroup: boolean;
  onSave: () => void;
  isSaving: boolean;
  saveMessage: string | null;
  slug: string;
  onResetToDefault: () => void;
}) {
  return (
    <div className="admin-shell flex items-center justify-between border-b border-admin-border bg-admin-surface px-6 py-3">
      <div className="flex items-center gap-4">
        <a
          href={`/admin/projects/${slug}`}
          className="text-xs font-medium tracking-[0.1em] text-admin-text-faint transition-colors hover:text-admin-text"
        >
          ← BACK
        </a>
        <div className="flex gap-1 rounded-md border border-admin-border p-1">
          {BREAKPOINTS.map((bp) => (
            <button
              key={bp}
              onClick={() => onBreakpointChange(bp)}
              className={`rounded px-3 py-1 text-xs font-medium tracking-wide transition-colors ${
                breakpoint === bp ? "bg-admin-text text-white" : "text-admin-text-faint hover:text-admin-text"
              }`}
            >
              {BREAKPOINT_LABELS[bp]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex gap-1 ${hasSelection ? "" : "pointer-events-none opacity-30"}`}>
          {(["left", "hcenter", "right"] as const).map((mode) => (
            <button
              key={mode}
              disabled={!canAlignGroup}
              onClick={() => onAlign(mode)}
              className="rounded px-2 py-1 text-xs text-admin-text-faint hover:bg-admin-surface-hover hover:text-admin-text disabled:opacity-30"
              title={`水平對齊：${mode}`}
            >
              {mode === "left" ? "⊢" : mode === "hcenter" ? "⊣⊢" : "⊣"}
            </button>
          ))}
          {(["top", "vcenter", "bottom"] as const).map((mode) => (
            <button
              key={mode}
              disabled={!canAlignGroup}
              onClick={() => onAlign(mode)}
              className="rounded px-2 py-1 text-xs text-admin-text-faint hover:bg-admin-surface-hover hover:text-admin-text disabled:opacity-30"
              title={`垂直對齊：${mode}`}
            >
              {mode === "top" ? "⊤" : mode === "vcenter" ? "⊤⊥" : "⊥"}
            </button>
          ))}
          <span className="mx-1 w-px self-stretch bg-admin-border" />
          {(["left", "center", "right"] as TextAlign[]).map((align) => (
            <button
              key={align}
              onClick={() => onTextAlign(align)}
              className="rounded px-2 py-1 text-xs text-admin-text-faint hover:bg-admin-surface-hover hover:text-admin-text"
              title={`文字對齊：${align}`}
            >
              {align === "left" ? "≡←" : align === "center" ? "≡" : "≡→"}
            </button>
          ))}
        </div>

        <button
          onClick={onResetToDefault}
          className="rounded px-2 py-1 text-xs text-admin-text-faint hover:bg-admin-surface-hover hover:text-admin-text"
          title="重設此斷點為預設排版"
        >
          重設版面
        </button>

        {saveMessage && <span className="text-xs text-admin-text-faint">{saveMessage}</span>}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-md bg-admin-text px-4 py-2 text-xs font-medium tracking-[0.1em] text-white transition-colors hover:bg-admin-accent disabled:opacity-50"
        >
          {isSaving ? "儲存中…" : "儲存"}
        </button>
      </div>
    </div>
  );
}

function MeasureOverlay({ from, to }: { from: LayoutBlock; to: LayoutBlock }) {
  const rel = (block: LayoutBlock) => ({
    left: block.x,
    top: block.y,
    right: block.x + block.width,
    bottom: block.y + block.height,
  });
  const a = rel(from);
  const b = rel(to);

  // Horizontal gap (if boxes don't overlap on X)
  const gapX = b.left > a.right ? b.left - a.right : a.left > b.right ? a.left - b.right : null;
  // Vertical gap (if boxes don't overlap on Y)
  const gapY = b.top > a.bottom ? b.top - a.bottom : a.top > b.bottom ? a.top - b.bottom : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {gapX !== null && (
        <div
          className="absolute flex items-center justify-center bg-admin-accent/90 text-[10px] text-white"
          style={{
            left: Math.min(a.right, b.right),
            top: (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2 - 8,
            width: gapX,
            height: 16,
          }}
        >
          {Math.round(gapX)}px
        </div>
      )}
      {gapY !== null && (
        <div
          className="absolute flex items-center justify-center bg-admin-accent/90 text-[10px] text-white"
          style={{
            top: Math.min(a.bottom, b.bottom),
            left: (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2 - 16,
            height: gapY,
            width: 32,
          }}
        >
          {Math.round(gapY)}px
        </div>
      )}
    </div>
  );
}

function EditableBlockContent({
  block,
  project,
  sections,
  onHeroBlur,
  onSectionBlur,
}: {
  block: LayoutBlock;
  project: Project;
  sections: ProjectSection[];
  onHeroBlur: (field: "title" | "subtitle" | "tagline", value: string) => void;
  onSectionBlur: (sectionId: string, value: string) => void;
}) {
  if (block.kind === "hero-tagline") {
    return (
      <EditableText
        blockKey={block.id}
        className="text-xs tracking-[0.25em] text-accent uppercase"
        initialValue={project.tagline ?? ""}
        onBlur={(v) => onHeroBlur("tagline", v)}
      />
    );
  }
  if (block.kind === "hero-title") {
    return (
      <EditableText
        blockKey={block.id}
        className="text-3xl leading-tight tracking-tight md:text-5xl"
        initialValue={project.title}
        onBlur={(v) => onHeroBlur("title", v)}
      />
    );
  }
  if (block.kind === "hero-subtitle") {
    return (
      <EditableText
        blockKey={block.id}
        className="text-lg leading-relaxed text-ink-muted"
        initialValue={project.subtitle ?? ""}
        onBlur={(v) => onHeroBlur("subtitle", v)}
      />
    );
  }
  if (block.kind === "hero-meta") {
    const metaItems = [project.category, project.role, project.timeframe, project.client, project.team].filter(
      (v): v is string => Boolean(v)
    );
    return (
      <p className="pointer-events-none flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-faint">
        {metaItems.join(" · ")}
      </p>
    );
  }
  if (block.kind === "hero-tags") {
    return (
      <div className="pointer-events-none flex flex-wrap gap-x-4 gap-y-1">
        {project.tags.map((tag) => (
          <span key={tag} className="text-[11px] tracking-[0.15em] text-ink-faint">
            {tag.toUpperCase()}
          </span>
        ))}
      </div>
    );
  }
  if (block.kind === "section" && block.sectionId) {
    const section = sections.find((s) => s.id === block.sectionId);
    if (!section) return null;
    const isPlainText = typeof section.content.text === "string";
    return (
      <div className="h-full overflow-auto">
        <p className="pointer-events-none text-xs tracking-[0.2em] text-ink-faint">
          {SECTION_LABELS[section.section_type]}
        </p>
        <div className="mt-2">
          {isPlainText ? (
            <EditableText
              blockKey={block.id}
              className="max-w-[65ch] text-base leading-relaxed text-ink-muted"
              initialValue={(section.content.text as string) ?? ""}
              onBlur={(v) => onSectionBlur(section.id, v)}
            />
          ) : (
            <div className="pointer-events-none">{renderBody(section.section_type, section.content)}</div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Uncontrolled contentEditable: the DOM owns the text while typing. We only
 * set it once (on mount / when the block identity changes) and read the
 * final value on blur to persist. A React-controlled contentEditable would
 * fight the browser's own cursor/selection on every keystroke re-render.
 */
function EditableText({
  blockKey,
  initialValue,
  onBlur,
  className,
}: {
  blockKey: string;
  initialValue: string;
  onBlur: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastBlockKey = useRef<string | null>(null);

  useEffect(() => {
    if (ref.current && lastBlockKey.current !== blockKey) {
      ref.current.textContent = initialValue;
      lastBlockKey.current = blockKey;
    }
    // Only re-seed the DOM text when we're looking at a different block
    // (e.g. switching breakpoints) -- never while the same block is being
    // typed into.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${className ?? ""} cursor-text rounded outline-none focus:bg-accent/5`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onBlur={(e) => onBlur(e.currentTarget.textContent ?? "")}
    />
  );
}

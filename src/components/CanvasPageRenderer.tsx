import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { renderBody, SECTION_LABELS } from "@/components/SectionBlock";
import type { Project, ProjectSection } from "@/lib/types";
import { CANVAS_WIDTH, type Breakpoint, type LayoutBlock, type PageLayout } from "@/lib/layout-types";

interface CanvasPageRendererProps {
  project: Project;
  sections: ProjectSection[];
  layout: PageLayout;
}

const BREAKPOINT_VISIBILITY: Record<Breakpoint, string> = {
  desktop: "hidden lg:block",
  tablet: "hidden md:block lg:hidden",
  mobile: "block md:hidden",
};

/**
 * Renders the three independently-authored breakpoint canvases. Only one is
 * visible at a time via Tailwind responsive display classes -- there is no
 * runtime interpolation between breakpoints, matching the "true free-drag,
 * each device laid out by hand" decision.
 */
export function CanvasPageRenderer({ project, sections, layout }: CanvasPageRendererProps) {
  return (
    <>
      {(Object.keys(layout) as Breakpoint[]).map((bp) => (
        <div key={bp} className={BREAKPOINT_VISIBILITY[bp]}>
          <BreakpointCanvas breakpoint={bp} project={project} sections={sections} blocks={layout[bp]} />
        </div>
      ))}
    </>
  );
}

function BreakpointCanvas({
  breakpoint,
  project,
  sections,
  blocks,
}: {
  breakpoint: Breakpoint;
  project: Project;
  sections: ProjectSection[];
  blocks: LayoutBlock[];
}) {
  const canvasWidth = CANVAS_WIDTH[breakpoint];
  const height = blocks.reduce((max, b) => Math.max(max, b.y + b.height), 0) + 80;
  const sectionById = new Map(sections.map((s) => [s.id, s]));

  return (
    <div className="mx-auto" style={{ width: canvasWidth, maxWidth: "100%" }}>
      <div className="relative" style={{ width: canvasWidth, height }}>
        {blocks.map((block) => (
          <div
            key={block.id}
            style={{
              position: "absolute",
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              textAlign: block.textAlign,
              zIndex: block.zIndex,
            }}
          >
            <BlockContent block={block} project={project} sectionById={sectionById} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockContent({
  block,
  project,
  sectionById,
}: {
  block: LayoutBlock;
  project: Project;
  sectionById: Map<string, ProjectSection>;
}) {
  switch (block.kind) {
    case "hero-tagline":
      return <p className="text-xs tracking-[0.25em] text-accent">{project.tagline?.toUpperCase()}</p>;
    case "hero-title":
      return <h1 className="text-3xl leading-tight tracking-tight md:text-5xl">{project.title}</h1>;
    case "hero-subtitle":
      return <p className="text-lg leading-relaxed text-ink-muted">{project.subtitle}</p>;
    case "hero-meta": {
      const metaItems = [project.category, project.role, project.timeframe, project.client, project.team].filter(
        (v): v is string => Boolean(v)
      );
      return (
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-faint">
          {metaItems.map((item, i) => (
            <span key={item}>
              {item}
              {i < metaItems.length - 1 && <span className="mx-2">·</span>}
            </span>
          ))}
        </p>
      );
    }
    case "hero-tags":
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {project.tags.map((tag) => (
            <span key={tag} className="text-[11px] tracking-[0.15em] text-ink-faint">
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      );
    case "section": {
      const section = block.sectionId ? sectionById.get(block.sectionId) : undefined;
      if (!section) return null;
      return (
        <div className="h-full overflow-auto">
          <p className="text-xs tracking-[0.2em] text-ink-faint">{SECTION_LABELS[section.section_type]}</p>
          <div className="mt-2">{renderBody(section.section_type, section.content)}</div>
        </div>
      );
    }
    default:
      return null;
  }
}

export function ExternalLinkChip({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide transition-colors hover:border-accent hover:text-accent"
    >
      View live
      <ArrowUpRight size={16} weight="light" />
    </a>
  );
}

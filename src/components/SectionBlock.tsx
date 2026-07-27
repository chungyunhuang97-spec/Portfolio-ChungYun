import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ProjectSection, SectionType } from "@/lib/types";

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "",
  overview: "OVERVIEW",
  challenge: "THE CHALLENGE",
  role: "ROLE & CONTRIBUTION",
  process: "PROCESS",
  outcome: "OUTCOME",
  reflection: "REFLECTION",
};

const ROLE_KEY_LABELS: Record<string, string> = {
  position: "定位",
  decision_ownership: "決策歸屬",
  ai_collaboration: "AI 協作分工",
};

type ListItem = string | { title: string; desc: string };

function isTitledItem(item: ListItem): item is { title: string; desc: string } {
  return typeof item === "object" && item !== null && "title" in item;
}

function ItemList({ items }: { items: ListItem[] }) {
  if (items.length === 0) return null;

  const titled = items.every(isTitledItem);

  if (titled) {
    return (
      <div className="mt-4 divide-y divide-line">
        {(items as { title: string; desc: string }[]).map((item) => (
          <div key={item.title} className="py-4 first:pt-0">
            <h4 className="text-base">{item.title}</h4>
            <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ol className="mt-4 space-y-3">
      {(items as string[]).map((item, i) => (
        <li key={i} className="flex gap-4 text-sm leading-relaxed text-ink-muted">
          <span className="mt-0.5 shrink-0 font-mono text-xs text-ink-faint">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="max-w-[65ch]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function DemoLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide transition-colors hover:border-accent hover:text-accent"
    >
      View demo
      <ArrowUpRight size={14} weight="light" />
    </a>
  );
}

export function SectionBlock({ section }: { section: ProjectSection }) {
  const { section_type, content } = section;
  const label = SECTION_LABELS[section_type];

  return (
    <div className="grid grid-cols-1 gap-4 py-10 first:pt-0 md:grid-cols-[200px_1fr] md:gap-10">
      <p className="text-xs tracking-[0.2em] text-ink-faint">{label}</p>
      <div>{renderBody(section_type, content)}</div>
    </div>
  );
}

function renderBody(sectionType: SectionType, content: Record<string, unknown>) {
  // role: fixed set of labeled fields
  if (sectionType === "role") {
    const entries = Object.entries(content).filter(([, v]) => typeof v === "string");
    return (
      <div className="space-y-6">
        {entries.map(([key, value]) => (
          <div key={key}>
            <h4 className="text-sm tracking-[0.1em] text-accent">
              {ROLE_KEY_LABELS[key] ?? key}
            </h4>
            <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              {value as string}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // process with strategies + zones (NTSO case)
  if (Array.isArray(content.strategies) || Array.isArray(content.zones)) {
    const note = typeof content.note === "string" ? content.note : null;
    const strategies = (content.strategies as ListItem[] | undefined) ?? [];
    const zones = (content.zones as ListItem[] | undefined) ?? [];
    return (
      <div>
        {note && <p className="text-sm leading-relaxed text-ink-muted">{note}</p>}
        {strategies.length > 0 && <ItemList items={strategies} />}
        {zones.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm tracking-[0.1em] text-accent">展區</h4>
            <ItemList items={zones} />
          </div>
        )}
      </div>
    );
  }

  // process with narrative + tech_stack (yangbei case)
  if (typeof content.narrative === "string") {
    return (
      <div>
        <p className="text-sm leading-relaxed text-ink-muted">{content.narrative as string}</p>
        {typeof content.tech_stack === "string" && (
          <p className="mt-3 font-mono text-xs tracking-wide text-ink-faint">
            {content.tech_stack as string}
          </p>
        )}
      </div>
    );
  }

  // outcome as narrative status (yangbei case)
  if (typeof content.status === "string") {
    return (
      <p className="max-w-[65ch] text-sm leading-relaxed text-ink-muted">
        {content.status as string}
      </p>
    );
  }

  // items-based content: challenge / process / outcome / reflection
  if (Array.isArray(content.items)) {
    const note = typeof content.note === "string" ? content.note : null;
    const demoUrl = typeof content.demo_url === "string" ? content.demo_url : null;
    return (
      <div>
        {note && <p className="text-sm italic leading-relaxed text-ink-faint">{note}</p>}
        <ItemList items={content.items as ListItem[]} />
        {demoUrl && <DemoLink url={demoUrl} />}
      </div>
    );
  }

  // plain text: overview / challenge / reflection
  if (typeof content.text === "string") {
    if (sectionType === "reflection") {
      return (
        <blockquote className="max-w-[65ch] border-l-2 border-accent pl-6 text-lg leading-relaxed text-ink">
          {content.text as string}
        </blockquote>
      );
    }
    return (
      <p className="max-w-[65ch] text-base leading-relaxed text-ink-muted">
        {content.text as string}
      </p>
    );
  }

  return null;
}

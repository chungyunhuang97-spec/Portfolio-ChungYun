import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getProjectWithSectionsAdmin } from "@/lib/admin-data";
import { deleteSection, updateProjectMeta, upsertSection } from "@/lib/admin-actions";
import { ProjectMetaForm } from "@/components/admin/ProjectMetaForm";
import { SectionAccordion } from "@/components/admin/SectionAccordion";
import { AddSectionForm } from "@/components/admin/AddSectionForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ChangesProvider } from "@/components/admin/ChangesContext";
import { GlobalSaveBar } from "@/components/admin/GlobalSaveBar";
import type { SectionType } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectEditPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getProjectWithSectionsAdmin(slug);

  if (!result) {
    notFound();
  }

  const { project, sections } = result;

  async function saveMeta(
    projectId: string,
    projectSlug: string,
    fields: Parameters<typeof updateProjectMeta>[2]
  ) {
    "use server";
    return updateProjectMeta(projectId, projectSlug, fields);
  }

  async function saveSection(
    sectionType: string,
    content: Record<string, unknown>,
    displayOrder: number
  ) {
    "use server";
    return upsertSection(project.id, project.slug, sectionType, content, displayOrder);
  }

  async function removeSection(sectionId: string) {
    "use server";
    return deleteSection(sectionId, project.slug);
  }

  return (
    <ChangesProvider>
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-admin-text-faint">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-admin-text"
          >
            <ArrowLeft size={12} weight="bold" />
            ADMIN
          </Link>
          <CaretRight size={10} weight="bold" />
          <span className="truncate text-admin-text">{project.title}</span>
        </nav>

        <GlobalSaveBar />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-admin-text">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-admin-text-faint">/work/{project.slug}</p>
          </div>
          <a
            href={`/work/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-admin-border px-4 py-2 text-xs font-medium tracking-wide text-admin-text-muted transition-colors hover:border-admin-accent hover:text-admin-accent"
          >
            查看前台頁面
            <ArrowSquareOut size={14} weight="bold" />
          </a>
        </div>

        <div className="mt-10 max-w-3xl">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">DETAILS</h2>
          <div className="mt-4 rounded-lg border border-admin-border bg-admin-surface p-5">
            <ProjectMetaForm project={project} onSave={saveMeta} />
          </div>
        </div>

        <div className="mt-10 max-w-3xl">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">SECTIONS</h2>
          <div className="mt-4 space-y-3">
            {sections.map((section) => {
              async function save(content: Record<string, unknown>) {
                "use server";
                return saveSection(section.section_type, content, section.display_order);
              }
              return (
                <SectionAccordion
                  key={section.id}
                  section={section}
                  onSave={save}
                  onDelete={removeSection}
                  mediaPathPrefix={`${project.slug}/${section.section_type}`}
                  defaultOpen={sections.length === 1}
                />
              );
            })}
          </div>

          <div className="mt-4">
            <AddSectionForm
              existingTypes={sections.map((s) => s.section_type as SectionType)}
              nextDisplayOrder={sections.length}
              onAdd={saveSection}
            />
          </div>
        </div>
      </div>
    </ChangesProvider>
  );
}

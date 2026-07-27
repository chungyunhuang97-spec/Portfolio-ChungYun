import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getProjectWithSectionsAdmin } from "@/lib/admin-data";
import { deleteSection, updateProjectMeta, upsertSection } from "@/lib/admin-actions";
import { ProjectMetaForm } from "@/components/admin/ProjectMetaForm";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { AddSectionForm } from "@/components/admin/AddSectionForm";
import { DeleteSectionButton } from "@/components/admin/DeleteSectionButton";
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
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} weight="light" />
        BACK
      </Link>
      <h1 className="mt-4 text-2xl">{project.title}</h1>
      <p className="mt-1 font-mono text-xs text-ink-faint">/work/{project.slug}</p>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-xs tracking-[0.2em] text-ink-faint">DETAILS</h2>
        <div className="mt-4">
          <ProjectMetaForm project={project} onSave={saveMeta} />
        </div>
      </div>

      <div className="mt-14 max-w-3xl">
        <h2 className="text-xs tracking-[0.2em] text-ink-faint">SECTIONS</h2>
        <div className="mt-4 divide-y divide-line border-t border-line">
          {sections.map((section) => {
            async function save(content: Record<string, unknown>) {
              "use server";
              return saveSection(section.section_type, content, section.display_order);
            }
            return (
              <div key={section.id} className="py-8 first:pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm tracking-[0.15em] text-accent">
                    {section.section_type.toUpperCase()}
                  </h3>
                  <DeleteSectionButton sectionId={section.id} onDelete={removeSection} />
                </div>
                <ContentEditor initialContent={section.content} onSave={save} />
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <AddSectionForm
            existingTypes={sections.map((s) => s.section_type as SectionType)}
            nextDisplayOrder={sections.length}
            onAdd={saveSection}
          />
        </div>
      </div>
    </div>
  );
}

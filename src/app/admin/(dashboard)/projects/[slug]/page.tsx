import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getAllProjectsAdmin, getProjectWithSectionsAdmin } from "@/lib/admin-data";
import { deleteSection, updateProjectMeta, upsertSection } from "@/lib/admin-actions";
import { ProjectMetaForm } from "@/components/admin/ProjectMetaForm";
import { SectionAccordion } from "@/components/admin/SectionAccordion";
import { AddSectionForm } from "@/components/admin/AddSectionForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ChangesProvider } from "@/components/admin/ChangesContext";
import { GlobalSaveBar } from "@/components/admin/GlobalSaveBar";
import { ProjectPreviewShell, PreviewToggleButton } from "@/components/admin/ProjectPreviewShell";
import type { SectionType } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectEditPage({ params }: PageProps) {
  const { slug } = await params;
  // Independent queries -- run them together instead of one after another.
  const [result, allProjects] = await Promise.all([getProjectWithSectionsAdmin(slug), getAllProjectsAdmin()]);

  if (!result) {
    notFound();
  }

  const { project, sections } = result;

  const siblingProjects = allProjects
    .filter((p) => p.project_type === "case_study" && p.id !== project.id)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      card_size: p.card_size,
      is_visible: p.is_visible,
      card_theme: p.card_theme,
    }));

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
      <ProjectPreviewShell slug={project.slug}>
      <div>
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-admin-text-faint">
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
              <h1 className="text-3xl font-semibold text-admin-text md:text-4xl">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-admin-text-faint">/work/{project.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <PreviewToggleButton />
            <a
              href={`/work/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-press inline-flex items-center gap-1.5 rounded-full border border-admin-border bg-white px-4 py-2 text-xs font-medium tracking-wide text-admin-text-muted transition-colors hover:border-admin-ink hover:text-admin-ink"
            >
              查看前台頁面
              <ArrowSquareOut size={14} weight="bold" />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
          <span className="text-admin-text-faint">快速跳到：</span>
          <a href="#group-basic" className="rounded-full bg-white px-3 py-1 text-admin-text-muted transition-colors hover:bg-admin-lime hover:text-admin-ink">基本資訊</a>
          <a href="#group-publish" className="rounded-full bg-white px-3 py-1 text-admin-text-muted transition-colors hover:bg-admin-lime hover:text-admin-ink">發佈設定</a>
          <a href="#group-cover" className="rounded-full bg-white px-3 py-1 text-admin-text-muted transition-colors hover:bg-admin-lime hover:text-admin-ink">首頁卡片</a>
          <a href="#page-sections" className="rounded-full bg-white px-3 py-1 text-admin-text-muted transition-colors hover:bg-admin-lime hover:text-admin-ink">頁面內容區塊（{sections.length}）</a>
        </div>

        <div className="mt-10 max-w-3xl">
          <h2 className="text-base font-semibold text-admin-text">專案資訊</h2>
          <p className="mt-1 text-sm text-admin-text-muted">標題、發佈狀態與首頁卡片的外觀。點開各分組編輯。</p>
          <div className="mt-4">
            <ProjectMetaForm project={project} onSave={saveMeta} siblingProjects={siblingProjects} />
          </div>
        </div>

        <div id="page-sections" className="mt-12 max-w-3xl scroll-mt-32">
          <h2 className="text-base font-semibold text-admin-text">頁面內容區塊</h2>
          <p className="mt-1 text-sm text-admin-text-muted">專案頁由這些區塊組成，點開區塊編輯文字與圖片。</p>
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
      </ProjectPreviewShell>
    </ChangesProvider>
  );
}

import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPageLayout, buildDefaultLayout } from "@/lib/layout-data";
import { CanvasEditor } from "@/components/admin/CanvasEditor";
import type { Project, ProjectSection } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Full-bleed visual canvas editor. Deliberately NOT nested under the
 * src/app/admin/(dashboard) route group -- that layout imposes a fixed
 * header + max-w-[1400px] centered container which is wrong for a
 * full-screen drag-and-drop canvas. Auth is checked the same way as the
 * dashboard layout (redirect to /admin/login if no session).
 */
export default async function ProjectEditPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Note: getProjectWithSections only returns published projects (it's the
  // public-facing query). The canvas editor should also work on drafts, so
  // we query directly here instead of reusing it.
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Project>();

  if (!project) {
    notFound();
  }

  const { data: sectionsData } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });
  const sections = (sectionsData ?? []) as ProjectSection[];

  const savedLayout = await getPageLayout(slug);
  const layout =
    savedLayout && (savedLayout.desktop.length > 0 || savedLayout.tablet.length > 0 || savedLayout.mobile.length > 0)
      ? savedLayout
      : buildDefaultLayout(Boolean(project.tagline), Boolean(project.subtitle), sections);

  return <CanvasEditor project={project} sections={sections} initialLayout={layout} />;
}

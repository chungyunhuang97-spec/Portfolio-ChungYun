import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getAdjacentProjects, getProjectWithSections } from "@/lib/data";
import { getPageLayout, buildDefaultLayout } from "@/lib/layout-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EDIT_MODE_COOKIE } from "@/lib/edit-mode-constants";
import { FadeIn } from "@/components/FadeIn";
import { SectionBlock } from "@/components/SectionBlock";
import { CanvasPageRenderer } from "@/components/CanvasPageRenderer";
import { CanvasEditor } from "@/components/admin/CanvasEditor";
import { EditModeToggle } from "@/components/admin/EditModeToggle";
import type { Project, ProjectSection } from "@/lib/types";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectWithSections(slug);

  if (!result) {
    return { title: "Not found" };
  }

  return {
    title: `${result.project.title} — Chung Yun Huang`,
    description: result.project.subtitle ?? undefined,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  // Admin check happens on every visit to a project page (not just /admin/*)
  // so the edit toggle can live directly on the real page instead of behind
  // a separate dashboard. Anonymous visitors never trigger the true branch
  // below, so they never see any edit UI or draft content.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = Boolean(user);
  const cookieStore = await cookies();
  const editModeOn = isAdmin && cookieStore.get(EDIT_MODE_COOKIE)?.value === "1";

  if (isAdmin) {
    // Admins can see/edit drafts too, so this bypasses the public
    // published-only query.
    const { data: adminProject } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<Project>();

    if (!adminProject) {
      notFound();
    }

    const { data: sectionsData } = await supabase
      .from("project_sections")
      .select("*")
      .eq("project_id", adminProject.id)
      .order("display_order", { ascending: true });
    const sections = (sectionsData ?? []) as ProjectSection[];

    if (editModeOn) {
      const savedLayout = await getPageLayout(slug);
      const layout =
        savedLayout &&
        (savedLayout.desktop.length > 0 || savedLayout.tablet.length > 0 || savedLayout.mobile.length > 0)
          ? savedLayout
          : buildDefaultLayout(Boolean(adminProject.tagline), Boolean(adminProject.subtitle), sections);

      return (
        <>
          <CanvasEditor project={adminProject} sections={sections} initialLayout={layout} />
          <EditModeToggle editModeOn />
        </>
      );
    }

    // Admin, but edit mode is off: fall through to the normal view below,
    // using admin-visible (possibly-draft) data, with the toggle overlaid.
    return (
      <>
        <ProjectPageView project={adminProject} sections={sections} slug={slug} />
        <EditModeToggle editModeOn={false} />
      </>
    );
  }

  const result = await getProjectWithSections(slug);

  if (!result) {
    notFound();
  }

  return <ProjectPageView project={result.project} sections={result.sections} slug={slug} />;
}

async function ProjectPageView({
  project,
  sections,
  slug,
}: {
  project: Project;
  sections: ProjectSection[];
  slug: string;
}) {
  // Pages with a saved canvas layout (built via the visual editor) render
  // through the absolute-positioned CanvasPageRenderer instead of the
  // default document-flow layout below. Pages without one keep working
  // exactly as before -- this is additive, not a replacement of every page.
  const canvasLayout = await getPageLayout(slug);
  const hasCanvasLayout =
    canvasLayout &&
    (canvasLayout.desktop.length > 0 || canvasLayout.tablet.length > 0 || canvasLayout.mobile.length > 0);

  const heroSection = sections.find((s) => s.section_type === "hero");
  const bodySections = sections.filter((s) => s.section_type !== "hero");

  const heroTitle = (heroSection?.content.title as string | undefined) ?? project.title;
  const heroSubtitle =
    (heroSection?.content.subtitle as string | undefined) ?? project.subtitle ?? null;
  const heroTagline = heroSection?.content.tagline as string | undefined;

  const metaItems = [project.category, project.role, project.timeframe, project.client, project.team].filter(
    (v): v is string => Boolean(v)
  );

  const { prev, next } = await getAdjacentProjects(slug);

  if (hasCanvasLayout && canvasLayout) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-6 pt-10 md:px-10">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} weight="light" />
            ALL WORK
          </Link>
        </div>
        <div className="px-6 py-10 md:px-10">
          <CanvasPageRenderer project={project} sections={sections} layout={canvasLayout} />
        </div>
        <ProjectFooterNav prev={prev} next={next} />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1400px] px-6 pt-10 md:px-10">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} weight="light" />
          ALL WORK
        </Link>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 pb-16 pt-8 md:px-10 md:pb-24 md:pt-10">
        <FadeIn>
          {heroTagline && (
            <p className="text-xs tracking-[0.25em] text-accent">{heroTagline.toUpperCase()}</p>
          )}
          <h1 className="mt-4 max-w-[20ch] text-3xl leading-tight tracking-tight md:text-5xl">
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ink-muted">
              {heroSubtitle}
            </p>
          )}

          {metaItems.length > 0 && (
            <p className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-faint">
              {metaItems.map((item, i) => (
                <span key={item}>
                  {item}
                  {i < metaItems.length - 1 && <span className="mx-2">·</span>}
                </span>
              ))}
            </p>
          )}

          {project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[11px] tracking-[0.15em] text-ink-faint">
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {project.external_url && (
            <a
              href={project.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide transition-colors hover:border-accent hover:text-accent"
            >
              View live
              <ArrowUpRight size={16} weight="light" />
            </a>
          )}
        </FadeIn>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] divide-y divide-line px-6 md:px-10">
          {bodySections.map((section) => (
            <FadeIn key={section.id}>
              <SectionBlock section={section} />
            </FadeIn>
          ))}
        </div>
      </section>

      <ProjectFooterNav prev={prev} next={next} />
    </main>
  );
}

function ProjectFooterNav({
  prev,
  next,
}: {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  return (
    <>
      {(prev || next) && (
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0 md:px-10">
            {prev ? (
              <Link
                href={`/work/${prev.slug}`}
                className="group flex items-center justify-between gap-4 px-6 py-8 md:px-10"
              >
                <div>
                  <p className="text-xs tracking-[0.2em] text-ink-faint">PREVIOUS</p>
                  <p className="mt-2 text-lg transition-colors group-hover:text-accent">
                    {prev.title}
                  </p>
                </div>
                <ArrowLeft
                  size={18}
                  weight="light"
                  className="shrink-0 text-ink-faint transition-transform group-hover:-translate-x-1 group-hover:text-accent"
                />
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className="group flex items-center justify-between gap-4 px-6 py-8 md:px-10"
              >
                <div className="md:text-right md:ml-auto">
                  <p className="text-xs tracking-[0.2em] text-ink-faint">NEXT</p>
                  <p className="mt-2 text-lg transition-colors group-hover:text-accent">
                    {next.title}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  weight="light"
                  className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent md:order-first"
                />
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 text-sm text-ink-faint md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Chung Yun Huang</p>
          <a href="mailto:chungyunhuang97@gmail.com" className="transition-colors hover:text-ink">
            chungyunhuang97@gmail.com
          </a>
        </div>
      </footer>
    </>
  );
}

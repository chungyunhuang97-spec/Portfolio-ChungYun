import Link from "next/link";
import { getAllProjectsAdmin, getAllSiteContentAdmin } from "@/lib/admin-data";

const STATUS_COLOR: Record<string, string> = {
  published: "text-emerald-700",
  draft: "text-ink-faint",
  archived: "text-ink-faint",
};

export default async function AdminDashboard() {
  const [projects, siteContent] = await Promise.all([
    getAllProjectsAdmin(),
    getAllSiteContentAdmin(),
  ]);

  const caseStudies = projects.filter((p) => p.project_type === "case_study");
  const sideProjects = projects.filter((p) => p.project_type === "side_project");

  return (
    <div>
      <section>
        <h2 className="text-xs tracking-[0.2em] text-ink-faint">SITE CONTENT</h2>
        <div className="mt-4 divide-y divide-line border-t border-line">
          {siteContent.map((item) => (
            <Link
              key={item.key}
              href={`/admin/site-content/${item.key}`}
              className="flex items-center justify-between py-4 transition-colors hover:text-accent"
            >
              <span className="text-sm">{item.key}</span>
              <span className="text-xs text-ink-faint">Edit →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xs tracking-[0.2em] text-ink-faint">CASE STUDIES</h2>
        <div className="mt-4 divide-y divide-line border-t border-line">
          {caseStudies.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.slug}`}
              className="flex items-center justify-between py-4 transition-colors hover:text-accent"
            >
              <div>
                <span className="text-sm">{project.title}</span>
                <span className={`ml-3 text-xs ${STATUS_COLOR[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <span className="text-xs text-ink-faint">Edit →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xs tracking-[0.2em] text-ink-faint">SIDE PROJECTS</h2>
        <div className="mt-4 divide-y divide-line border-t border-line">
          {sideProjects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.slug}`}
              className="flex items-center justify-between py-4 transition-colors hover:text-accent"
            >
              <div>
                <span className="text-sm">{project.title}</span>
                <span className={`ml-3 text-xs ${STATUS_COLOR[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <span className="text-xs text-ink-faint">Edit →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

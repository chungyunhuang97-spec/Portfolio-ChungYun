import { getAllProjectsAdmin, getAllSiteContentAdmin } from "@/lib/admin-data";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";

export default async function AdminDashboard() {
  const [projects, siteContent] = await Promise.all([
    getAllProjectsAdmin(),
    getAllSiteContentAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-admin-text">Dashboard</h1>
      <div className="mt-6">
        <AdminDashboardOverview projects={projects} siteContent={siteContent} />
      </div>
    </div>
  );
}

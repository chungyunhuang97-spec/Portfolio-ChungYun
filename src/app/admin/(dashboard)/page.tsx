import {
  getAllProjectsAdmin,
  getAllSiteContentAdmin,
  getAllVideoWorksAdmin,
  getVideoSectionSettingsAdmin,
} from "@/lib/admin-data";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";

export default async function AdminDashboard() {
  const [projects, siteContent, videoSectionSettings, videoWorks] = await Promise.all([
    getAllProjectsAdmin(),
    getAllSiteContentAdmin(),
    getVideoSectionSettingsAdmin(),
    getAllVideoWorksAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-admin-text">Dashboard</h1>
      <div className="mt-6">
        <AdminDashboardOverview
          projects={projects}
          siteContent={siteContent}
          videoSectionSettings={videoSectionSettings}
          videoWorkCount={videoWorks.length}
        />
      </div>
    </div>
  );
}

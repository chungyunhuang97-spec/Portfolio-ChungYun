import {
  getAllProjectsAdmin,
  getAllSiteContentAdmin,
  getVideoCategoriesWithVideosAdmin,
  getVideoSectionSettingsAdmin,
} from "@/lib/admin-data";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";

export default async function AdminDashboard() {
  const [projects, siteContent, videoSectionSettings, videoCategories] = await Promise.all([
    getAllProjectsAdmin(),
    getAllSiteContentAdmin(),
    getVideoSectionSettingsAdmin(),
    getVideoCategoriesWithVideosAdmin(),
  ]);

  return (
    <div>
      <div>
        <AdminDashboardOverview
          projects={projects}
          siteContent={siteContent}
          videoSectionSettings={videoSectionSettings}
          videoWorkCount={videoCategories.reduce((n, c) => n + c.videos.length, 0)}
        />
      </div>
    </div>
  );
}

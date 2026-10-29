import { getVideoCategoriesWithVideosAdmin, getVideoSectionSettingsAdmin } from "@/lib/admin-data";
import { updateVideoSectionVisibility } from "@/lib/admin-actions";
import { VideoSectionVisibilityToggle } from "@/components/admin/about-video/VideoSectionVisibilityToggle";
import { VideoCategoryBoard } from "@/components/admin/about-video/VideoLists";
import { NewCategoryForm } from "@/components/admin/about-video/VideoCategoryForms";

export default async function VideosAdminPage() {
  const [categories, settings] = await Promise.all([
    getVideoCategoriesWithVideosAdmin(),
    getVideoSectionSettingsAdmin(),
  ]);

  async function saveVisibility(settingsId: string, isVisible: boolean) {
    "use server";
    return updateVideoSectionVisibility(settingsId, isVisible);
  }
  const missing = categories.reduce((n, c) => n + c.videos.filter((v) => !v.poster_image).length, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-admin-text">影片作品</h1>
      <p className="mt-1 text-sm text-admin-text-faint">
        首頁「03 / VIDEO WORKS」的分類與影片。拖曳左側把手排序；分類編號依順序自動產生（01 開始）。
      </p>
      {settings && (
        <div className="mt-6">
          <VideoSectionVisibilityToggle settings={settings} onSave={saveVisibility} />
        </div>
      )}
      {missing > 0 && (
        <p className="mt-4 rounded-md border border-admin-danger bg-admin-danger-soft px-3 py-2 text-sm text-admin-danger">
          有 {missing} 支影片缺少縮圖，首頁會先顯示海報卡。
        </p>
      )}

      <div className="mt-6">
        <NewCategoryForm />
      </div>

      <div className="mt-6">
        <VideoCategoryBoard categories={categories} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getAllVideoWorksAdmin, getVideoSectionSettingsAdmin } from "@/lib/admin-data";
import { updateVideoSectionVisibility } from "@/lib/admin-actions";
import { VideoSectionVisibilityToggle } from "@/components/admin/video-section/VideoSectionVisibilityToggle";
import type { VideoWork } from "@/lib/types";

function WorkRow({ work }: { work: VideoWork }) {
  return (
    <Link
      href={`/admin/video-section/${work.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-admin-surface-hover"
    >
      <span className="truncate text-sm text-admin-text">{work.title}</span>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] ${
            work.is_active ? "bg-admin-success-soft text-admin-success" : "bg-admin-border text-admin-text-faint"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {work.is_active ? "ACTIVE" : "INACTIVE"}
        </span>
        <span className="text-xs text-admin-text-faint">Edit →</span>
      </div>
    </Link>
  );
}

export default async function VideoSectionAdminPage() {
  const [settings, works] = await Promise.all([
    getVideoSectionSettingsAdmin(),
    getAllVideoWorksAdmin(),
  ]);

  const featured = works.filter((w) => w.type === "featured");
  const more = works.filter((w) => w.type === "more");

  async function saveVisibility(settingsId: string, isVisible: boolean) {
    "use server";
    return updateVideoSectionVisibility(settingsId, isVisible);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-admin-text">影片製作</h1>
      <p className="mt-1 text-sm text-admin-text-faint">管理首頁「影片製作」section 的顯示與作品內容。</p>

      <div className="mt-6">
        {settings ? (
          <VideoSectionVisibilityToggle settings={settings} onSave={saveVisibility} />
        ) : (
          <p className="rounded-lg border border-admin-border bg-admin-surface p-5 text-sm text-admin-danger">
            尚未初始化 video_section_settings，請聯絡開發者。
          </p>
        )}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">
            精選作品 FEATURED WORKS
          </h2>
          <Link
            href="/admin/video-section/new?type=featured"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-accent hover:underline"
          >
            <Plus size={14} weight="bold" />
            新增精選作品
          </Link>
        </div>
        <div className="mt-3 divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
          {featured.length === 0 && <p className="px-4 py-6 text-sm text-admin-text-faint">尚無作品</p>}
          {featured.map((work) => (
            <WorkRow key={work.id} work={work} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">
            更多作品 MORE WORKS
          </h2>
          <Link
            href="/admin/video-section/new?type=more"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-accent hover:underline"
          >
            <Plus size={14} weight="bold" />
            新增更多作品
          </Link>
        </div>
        <div className="mt-3 divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
          {more.length === 0 && <p className="px-4 py-6 text-sm text-admin-text-faint">尚無作品</p>}
          {more.map((work) => (
            <WorkRow key={work.id} work={work} />
          ))}
        </div>
      </section>
    </div>
  );
}

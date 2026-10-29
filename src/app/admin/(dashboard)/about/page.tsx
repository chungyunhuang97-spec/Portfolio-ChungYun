import { getAboutAdmin } from "@/lib/admin-data";
import { AboutEditor } from "@/components/admin/about-video/AboutEditor";

export default async function AboutAdminPage() {
  const data = await getAboutAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-admin-text">關於我</h1>
      <p className="mt-1 text-sm text-admin-text-faint">首頁「02 / ABOUT」區塊的宣言、介紹、照片、特質、數字與工具。</p>

      <div className="mt-8">
        {data.content ? (
          <AboutEditor data={{ ...data, content: data.content }} />
        ) : (
          <p className="rounded-lg border border-admin-border bg-admin-surface p-5 text-sm text-admin-danger">
            找不到 about_content。請先在 Supabase 執行
            supabase/migrations/20261030090000_about_video_v2/migration.sql。
          </p>
        )}
      </div>
    </div>
  );
}

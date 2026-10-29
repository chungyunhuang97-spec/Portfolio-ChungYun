import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getVideoCategoryAdmin } from "@/lib/admin-data";
import { SortableVideoList } from "@/components/admin/about-video/VideoLists";
import { NewVideoForm, VideoCategoryForm } from "@/components/admin/about-video/VideoCategoryForms";

export default async function VideoCategoryAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getVideoCategoryAdmin(id);
  if (!category) notFound();

  return (
    <div>
      <Link
        href="/admin/videos"
        className="inline-flex items-center gap-1.5 text-xs text-admin-text-faint transition-colors hover:text-admin-text"
      >
        <ArrowLeft size={12} weight="bold" />
        影片作品
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-admin-text">{category.title}</h1>

      <div className="mt-8 max-w-3xl rounded-lg border border-admin-border bg-admin-surface p-5">
        <VideoCategoryForm category={category} />
      </div>

      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">
          影片（{category.videos.length}）
        </h2>
        <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
          <SortableVideoList categoryId={category.id} videos={category.videos} />
        </div>
        <NewVideoForm categoryId={category.id} />
      </section>
    </div>
  );
}

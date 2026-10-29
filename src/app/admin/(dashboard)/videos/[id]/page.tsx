import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getVideoAdmin } from "@/lib/admin-data";
import { VideoEditor } from "@/components/admin/about-video/VideoEditor";

export default async function VideoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getVideoAdmin(id);
  if (!data) notFound();

  return (
    <div>
      <Link
        href={`/admin/videos/categories/${data.category.id}`}
        className="inline-flex items-center gap-1.5 text-xs text-admin-text-faint transition-colors hover:text-admin-text"
      >
        <ArrowLeft size={12} weight="bold" />
        {data.category.title}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-admin-text">{data.video.title}</h1>

      <div className="mt-8 max-w-4xl">
        <VideoEditor video={data.video} category={data.category} />
      </div>
    </div>
  );
}

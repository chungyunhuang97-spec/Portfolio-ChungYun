import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getVideoWorkWithReelLinksAdmin } from "@/lib/admin-data";
import {
  createReelLink,
  deleteReelLink,
  deleteVideoWork,
  updateReelLink,
  updateVideoWork,
  type ReelLinkFields,
  type VideoWorkFields,
} from "@/lib/admin-actions";
import { VideoWorkForm } from "@/components/admin/video-section/VideoWorkForm";
import { ReelLinksEditor } from "@/components/admin/video-section/ReelLinksEditor";
import { DeleteVideoWorkButton } from "@/components/admin/video-section/DeleteVideoWorkButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoWorkEditPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getVideoWorkWithReelLinksAdmin(id);

  if (!result) {
    notFound();
  }

  const { work, reelLinks } = result;

  async function saveWork(workId: string, fields: VideoWorkFields) {
    "use server";
    return updateVideoWork(workId, fields);
  }

  async function removeWork() {
    "use server";
    return deleteVideoWork(id);
  }

  async function addReelLink(fields: ReelLinkFields) {
    "use server";
    return createReelLink(id, fields);
  }

  async function saveReelLink(linkId: string, fields: ReelLinkFields) {
    "use server";
    return updateReelLink(linkId, id, fields);
  }

  async function removeReelLink(linkId: string) {
    "use server";
    return deleteReelLink(linkId, id);
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-admin-text-faint">
        <Link
          href="/admin/video-section"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-admin-text"
        >
          <ArrowLeft size={12} weight="bold" />
          影片製作
        </Link>
        <CaretRight size={10} weight="bold" />
        <span className="truncate text-admin-text">{work.title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-admin-text">{work.title}</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-admin-border px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-admin-text-muted">
          {work.type === "featured" ? "FEATURED" : "MORE"}
        </span>
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">DETAILS</h2>
        <div className="mt-4 rounded-lg border border-admin-border bg-admin-surface p-5">
          <VideoWorkForm work={work} onSave={saveWork} />
        </div>
      </div>

      {work.type === "more" && (
        <div className="mt-8 max-w-3xl">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">
            REEL 連結（僅教學 Reels 卡片使用）
          </h2>
          <div className="mt-4">
            <ReelLinksEditor
              reelLinks={reelLinks}
              onAdd={addReelLink}
              onSaveLink={saveReelLink}
              onDeleteLink={removeReelLink}
            />
          </div>
        </div>
      )}

      <div className="mt-10 max-w-3xl border-t border-admin-border pt-6">
        <DeleteVideoWorkButton onDelete={removeWork} />
      </div>
    </div>
  );
}

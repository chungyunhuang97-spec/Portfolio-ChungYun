import Link from "next/link";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { createVideoWork } from "@/lib/admin-actions";
import { CreateVideoWorkForm } from "@/components/admin/video-section/CreateVideoWorkForm";
import type { VideoWorkType } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewVideoWorkPage({ searchParams }: PageProps) {
  const { type: rawType } = await searchParams;
  const type: VideoWorkType = rawType === "more" ? "more" : "featured";

  async function create(title: string) {
    "use server";
    return createVideoWork(type, title);
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
        <span className="text-admin-text">新增作品</span>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold text-admin-text">
        新增{type === "featured" ? "精選" : "更多"}作品
      </h1>
      <p className="mt-1 text-sm text-admin-text-faint">
        先輸入標題建立作品，建立後會進到完整編輯頁面填寫其他欄位。
      </p>

      <div className="mt-6">
        <CreateVideoWorkForm type={type} onCreate={create} />
      </div>
    </div>
  );
}

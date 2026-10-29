import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getAllSiteContentAdmin } from "@/lib/admin-data";
import { updateSiteContent } from "@/lib/admin-actions";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { LEGACY_SITE_CONTENT } from "@/lib/about-video";
import { ChangesProvider } from "@/components/admin/ChangesContext";
import { GlobalSaveBar } from "@/components/admin/GlobalSaveBar";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function SiteContentEditPage({ params }: PageProps) {
  const { key } = await params;
  const allContent = await getAllSiteContentAdmin();
  const item = allContent.find((c) => c.key === key);

  if (!item) {
    notFound();
  }

  const legacy = LEGACY_SITE_CONTENT[key];

  async function save(content: Record<string, unknown>) {
    "use server";
    return updateSiteContent(key, content);
  }

  return (
    <ChangesProvider>
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-admin-text-faint">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-admin-text"
          >
            <ArrowLeft size={12} weight="bold" />
            ADMIN
          </Link>
          <CaretRight size={10} weight="bold" />
          <span className="truncate text-admin-text">{item.key}</span>
        </nav>

        <GlobalSaveBar />

        <h1 className="mt-4 text-2xl font-semibold text-admin-text">{item.key}</h1>

        {legacy && (
          <p className="mt-4 max-w-2xl rounded-md border border-admin-warning bg-admin-warning-soft px-4 py-3 text-sm text-admin-warning">
            首頁已經不再使用這筆舊資料。About 的宣言、介紹、照片、履歷、聯絡連結與特質，請到{" "}
            <Link href={legacy.href} className="font-medium underline underline-offset-2">
              {legacy.label}
            </Link>{" "}
            編輯。
          </p>
        )}

        <div className="mt-8 max-w-2xl rounded-lg border border-admin-border bg-admin-surface p-5">
          <ContentEditor
            initialContent={item.content}
            onSave={save}
            trackingId={`site-content-${item.key}`}
            trackingLabel={item.key}
          />
        </div>
      </div>
    </ChangesProvider>
  );
}

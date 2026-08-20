import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getAllSiteContentAdmin } from "@/lib/admin-data";
import { updateSiteContent } from "@/lib/admin-actions";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { ChangesProvider } from "@/components/admin/ChangesContext";
import { StickyChangesBar } from "@/components/admin/StickyChangesBar";

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

        <StickyChangesBar />

        <h1 className="mt-4 text-2xl font-semibold text-admin-text">{item.key}</h1>

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

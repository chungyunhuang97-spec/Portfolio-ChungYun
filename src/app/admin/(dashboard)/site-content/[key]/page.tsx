import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getAllSiteContentAdmin } from "@/lib/admin-data";
import { updateSiteContent } from "@/lib/admin-actions";
import { ContentEditor } from "@/components/admin/ContentEditor";

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
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} weight="light" />
        BACK
      </Link>
      <h1 className="mt-4 text-2xl">{item.key}</h1>

      <div className="mt-8 max-w-2xl">
        <ContentEditor initialContent={item.content} onSave={save} />
      </div>
    </div>
  );
}

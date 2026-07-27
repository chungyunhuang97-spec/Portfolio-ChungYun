import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
          <Link href="/admin" className="text-sm tracking-[0.15em] text-ink">
            ADMIN
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              target="_blank"
              className="text-xs tracking-[0.15em] text-ink-faint transition-colors hover:text-ink"
            >
              VIEW SITE
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">{children}</div>
    </div>
  );
}

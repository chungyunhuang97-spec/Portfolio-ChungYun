import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminSidebar, AdminSidebarProvider, AdminMenuButton } from "@/components/admin/AdminSidebar";
import { getAllProjectsAdmin, getAllSiteContentAdmin } from "@/lib/admin-data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [projects, siteContent] = await Promise.all([getAllProjectsAdmin(), getAllSiteContentAdmin()]);

  return (
    <AdminSidebarProvider>
      <div className="admin-shell min-h-[100dvh] bg-admin-bg text-admin-text">
        <AdminSidebar projects={projects} siteContent={siteContent} />

        <div className="md:pl-64">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-admin-border bg-admin-surface/95 px-4 py-3.5 backdrop-blur md:px-10">
            <div className="flex items-center gap-2">
              <AdminMenuButton />
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                target="_blank"
                className="text-xs font-medium tracking-[0.1em] text-admin-text-faint transition-colors hover:text-admin-text"
              >
                VIEW SITE
              </Link>
              <SignOutButton />
            </div>
          </header>
          <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-10 md:py-10">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}

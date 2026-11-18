import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminSidebar, AdminSidebarProvider, AdminMenuButton } from "@/components/admin/AdminSidebar";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { AdminClickFx } from "@/components/admin/AdminClickFx";
import { AdminFeedbackProvider } from "@/components/admin/AdminFeedback";
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
    <AdminFeedbackProvider>
      <AdminSidebarProvider>
        <AdminClickFx />
        <div className="admin-shell min-h-[100dvh] text-admin-text">
          <AdminSidebar projects={projects} siteContent={siteContent} />

          <div className="md:pl-[17rem]">
            <header className="sticky top-3 z-20 mx-3 mt-3 flex items-center justify-between rounded-full bg-admin-ink px-3 py-2 text-white shadow-[0_18px_40px_-20px_rgba(12,12,14,0.6)] md:ml-0 md:mr-4 md:mt-4 md:top-4">
              <div className="flex items-center gap-3">
                <AdminMenuButton />
                <p className="hidden items-center gap-2 pl-2 text-xs tracking-[0.2em] text-white/60 sm:flex">
                  <span className="size-1.5 rounded-full bg-admin-lime" />
                  CONTENT STUDIO
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="admin-press inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium tracking-[0.1em] text-white transition-colors hover:bg-admin-lime hover:text-admin-ink"
                >
                  VIEW SITE
                  <ArrowUpRight size={12} weight="bold" />
                </Link>
                <SignOutButton />
              </div>
            </header>
            <main className="admin-rise mx-auto max-w-[1400px] px-4 pb-16 pt-8 md:pl-2 md:pr-8 md:pt-10">{children}</main>
          </div>
        </div>
      </AdminSidebarProvider>
    </AdminFeedbackProvider>
  );
}

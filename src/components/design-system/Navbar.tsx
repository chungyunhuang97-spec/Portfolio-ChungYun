import Link from "next/link";

/**
 * Fixed top navigation for project (case-study) pages.
 * Reused across every case-study page and, eventually, the homepage.
 */
const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#work" },
  { label: "Contact", href: "mailto:chungyunhuang97@gmail.com" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <nav className="flex items-center gap-1 rounded-full border border-grey-100 bg-proj-white/90 px-2 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
        {LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-nunito rounded-full px-4 py-2 text-[13px] font-bold text-grey-900 transition-colors hover:bg-grey-100 hover:text-primary-orange md:text-[14px]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

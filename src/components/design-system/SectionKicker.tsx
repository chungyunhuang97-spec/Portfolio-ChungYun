import type { ReactNode } from "react";

/**
 * Small orange eyebrow label used above every section heading,
 * e.g. "◆ Project Overview".
 */
export function SectionKicker({
  icon = "◆",
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <p className="font-nunito flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-orange md:text-[13px]">
      <span aria-hidden>{icon}</span>
      {children}
    </p>
  );
}

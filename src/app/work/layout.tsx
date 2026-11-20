import type { ReactNode } from "react";
import { InlineEditRuntime } from "@/components/inline-edit/InlineEditRuntime";

export default function WorkLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <InlineEditRuntime />
    </>
  );
}

"use client";

import { useEffect } from "react";
import { ensureInit } from "@/components/inline-edit/store";

/**
 * Mounted on every /work page. Outside the admin preview iframe it does
 * nothing; inside it, it answers the admin's handshake so the page's text
 * becomes editable.
 */
export function InlineEditRuntime() {
  useEffect(() => {
    ensureInit();
  }, []);
  return null;
}

"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "admin-dev-mode";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * "Developer mode" for the admin editors: reveals the controls that change a
 * section's data *structure* (ADD FIELD, remove field, raw JSON). Off by
 * default so everyday content edits can't accidentally rename or delete a
 * key the public page depends on. Remembered per browser; if storage is
 * unavailable it just stays off.
 */
export function useAdminDevMode(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, read, () => false);
  function setOn(next: boolean) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* storage blocked -- the toggle just won't persist */
    }
    listeners.forEach((l) => l());
  }
  return [on, setOn];
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle, Warning, X } from "@phosphor-icons/react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
}

interface FeedbackApi {
  toast: (message: string, kind?: ToastKind) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

/**
 * One consistent place for admin feedback: a toast stack for save /
 * error messages, and a promise-based confirm dialog that replaces the
 * browser's `window.confirm`.
 */
export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), kind === "error" ? 7000 : 3000);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setDialog({ ...options, resolve });
      }),
    []
  );

  function answer(ok: boolean) {
    dialog?.resolve(ok);
    setDialog(null);
  }

  useEffect(() => {
    if (!dialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        dialog?.resolve(false);
        setDialog(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  const api = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={api}>
      {children}

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:left-auto md:right-6 md:translate-x-0 md:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-lg ${
              t.kind === "error"
                ? "border-admin-danger/30 bg-admin-danger-soft text-admin-danger"
                : t.kind === "success"
                  ? "border-admin-success/30 bg-admin-success-soft text-admin-success"
                  : "border-admin-border bg-admin-surface text-admin-text"
            }`}
          >
            {t.kind === "error" ? (
              <Warning size={16} weight="bold" className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
            )}
            <span className="min-w-0 flex-1 break-words">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="關閉"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        ))}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4" onClick={() => answer(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            className="w-full max-w-sm rounded-lg border border-admin-border bg-admin-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-confirm-title" className="text-sm font-semibold text-admin-text">
              {dialog.title}
            </h2>
            {dialog.message && <p className="mt-2 text-sm leading-relaxed text-admin-text-muted">{dialog.message}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-text-muted transition-colors hover:bg-admin-surface-hover"
              >
                取消
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => answer(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                  dialog.danger ? "bg-admin-danger hover:opacity-90" : "bg-admin-accent hover:bg-admin-accent-hover"
                }`}
              >
                {dialog.confirmLabel ?? "確定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

/** Safe outside the provider: falls back to the native confirm and no toasts. */
export function useAdminFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext);
  if (ctx) return ctx;
  return {
    toast: () => {},
    confirm: async (o) => window.confirm(o.message ? `${o.title}\n${o.message}` : o.title),
  };
}

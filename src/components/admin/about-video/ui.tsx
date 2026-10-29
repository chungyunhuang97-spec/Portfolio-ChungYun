"use client";

import type { ReactNode } from "react";

/** Form primitives shared by the About + Video Works admin editors, matching
 * the existing admin forms' look (see ProjectMetaForm / VideoWorkForm). */
const inputBase =
  "rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";

export const inputClass = `w-full ${inputBase}`;

/** Fixed-width variant for inline rows; pass the width class. */
export function inputClassW(width: string) {
  return `${width} shrink-0 ${inputBase}`;
}

export const labelClass = "text-[11px] font-medium tracking-[0.1em] text-admin-text-faint";

export function Field({
  label,
  hint,
  error,
  children,
  wide = false,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-admin-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-admin-text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={over ? "text-admin-danger" : "text-admin-text-faint"}>
      {value.length}/{max}
      {over ? " — 超過上限" : ""}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm text-admin-text ${disabled ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-admin-accent"
      />
      {label}
    </label>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">{children}</h2>
      {action}
    </div>
  );
}

export function Messages({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {errors.map((e) => (
        <p key={e} className="rounded-md bg-admin-danger-soft px-3 py-2 text-xs text-admin-danger">
          {e}
        </p>
      ))}
      {warnings.map((w) => (
        <p key={w} className="rounded-md bg-admin-warning-soft px-3 py-2 text-xs text-admin-warning">
          {w}
        </p>
      ))}
    </div>
  );
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SaveButton({
  status,
  disabled,
  onClick,
  error,
  label = "儲存",
}: {
  status: SaveStatus;
  disabled?: boolean;
  onClick: () => void;
  error?: string | null;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || status === "saving"}
        className="rounded-md bg-admin-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saving" ? "儲存中…" : label}
      </button>
      {status === "saved" && <span className="text-xs text-admin-success">已儲存</span>}
      {status === "error" && error && <span className="text-xs text-admin-danger">{error}</span>}
    </div>
  );
}

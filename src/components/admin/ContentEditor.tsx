"use client";

import { useMemo, useState } from "react";
import { Plus, Trash, CaretDown, CaretUp } from "@phosphor-icons/react";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import { useTrackChanges } from "@/components/admin/ChangesContext";

type FieldType = "text" | "string-list" | "title-desc-list" | "media" | "raw";

interface Field {
  key: string;
  type: FieldType;
  value: unknown;
}

// Field keys ending in one of these suffixes are treated as media (image/
// video) fields even though the underlying JSONB value is just a plain
// string URL -- Postgres JSONB has no concept of a "media" type, so the
// key name is the only stable signal we have across reloads.
const MEDIA_KEY_PATTERN = /(_media_url|_image_url|_video_url)$/i;
const DESKTOP_MOBILE_PATTERN = /desktop|mobile/i;

function detectType(value: unknown, key?: string): FieldType {
  if (key && MEDIA_KEY_PATTERN.test(key) && (typeof value === "string" || value == null)) {
    return "media";
  }
  if (typeof value === "string") return "text";
  if (Array.isArray(value)) {
    if (value.length === 0) return "string-list";
    if (value.every((v) => typeof v === "string")) return "string-list";
    if (
      value.every(
        (v) => typeof v === "object" && v !== null && "title" in v && "desc" in v
      )
    )
      return "title-desc-list";
  }
  return "raw";
}

function contentToFields(content: Record<string, unknown>): Field[] {
  return Object.entries(content).map(([key, value]) => ({
    key,
    type: detectType(value, key),
    value,
  }));
}

function fieldsToContent(fields: Field[]): Record<string, unknown> {
  const content: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.key.trim() === "") continue;
    content[field.key] = field.value;
  }
  return content;
}

function humanizeKey(key: string) {
  return key
    .replace(/(_media_url|_image_url|_video_url|MediaUrl|ImageUrl|VideoUrl)$/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toUpperCase();
}

type GroupedField =
  | { kind: "single"; field: Field; index: number }
  | {
      kind: "pair";
      base: string;
      desktop: { field: Field; index: number };
      mobile: { field: Field; index: number };
    };

/**
 * Media fields that follow the desktopMediaUrl / mobileMediaUrl naming
 * convention render as one side-by-side pair instead of two identical,
 * unrelated-looking dropzones -- this is the convention already used
 * across the Metro page's fields (e.g. interfaceSearchDesktopMediaUrl /
 * interfaceSearchMobileMediaUrl).
 */
function groupFields(fields: Field[]): GroupedField[] {
  const used = new Set<number>();
  const result: GroupedField[] = [];

  for (let i = 0; i < fields.length; i++) {
    if (used.has(i)) continue;
    const field = fields[i];

    if (field.type === "media" && DESKTOP_MOBILE_PATTERN.test(field.key)) {
      const isDesktop = /desktop/i.test(field.key);
      const base = field.key.replace(/desktop/i, "").replace(/mobile/i, "");
      const partnerIndex = fields.findIndex((f, j) => {
        if (used.has(j) || j === i || f.type !== "media") return false;
        const fBase = f.key.replace(/desktop/i, "").replace(/mobile/i, "");
        if (fBase !== base) return false;
        return /desktop/i.test(f.key) !== isDesktop;
      });

      if (partnerIndex !== -1) {
        used.add(i);
        used.add(partnerIndex);
        const desktopEntry = isDesktop ? { field, index: i } : { field: fields[partnerIndex], index: partnerIndex };
        const mobileEntry = isDesktop ? { field: fields[partnerIndex], index: partnerIndex } : { field, index: i };
        result.push({ kind: "pair", base, desktop: desktopEntry, mobile: mobileEntry });
        continue;
      }
    }

    used.add(i);
    result.push({ kind: "single", field, index: i });
  }

  return result;
}

function inputClass() {
  return "w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";
}

function fieldLabelClass() {
  return "text-[11px] font-medium tracking-[0.1em] text-admin-text-faint";
}

function FieldEditor({
  field,
  onChange,
  mediaPathPrefix,
}: {
  field: Field;
  onChange: (value: unknown) => void;
  mediaPathPrefix?: string;
}) {
  const [rawText, setRawText] = useState(() => JSON.stringify(field.value, null, 2));
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);

  if (field.type === "media") {
    return (
      <AdminMediaDropzone
        value={(field.value as string) ?? ""}
        onChange={onChange}
        mediaPathPrefix={mediaPathPrefix ? `${mediaPathPrefix}/${field.key}` : field.key}
      />
    );
  }

  if (field.type === "text") {
    return (
      <textarea
        rows={field.value && (field.value as string).length > 80 ? 4 : 2}
        value={field.value as string}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass()}
      />
    );
  }

  if (field.type === "string-list") {
    const items = (field.value as string[]) ?? [];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className={inputClass()}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-md px-2 text-admin-text-faint transition-colors hover:bg-admin-danger-soft hover:text-admin-danger"
              aria-label="Remove item"
            >
              <Trash size={16} weight="light" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-muted transition-colors hover:text-admin-accent"
        >
          <Plus size={14} weight="bold" />
          ADD ITEM
        </button>
      </div>
    );
  }

  if (field.type === "title-desc-list") {
    const items = (field.value as { title: string; desc: string }[]) ?? [];
    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-md border border-admin-border bg-admin-surface p-3">
            <div className="flex items-center gap-2">
              <input
                placeholder="Title"
                value={item.title}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], title: e.target.value };
                  onChange(next);
                }}
                className={inputClass()}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-md px-2 text-admin-text-faint transition-colors hover:bg-admin-danger-soft hover:text-admin-danger"
                aria-label="Remove item"
              >
                <Trash size={16} weight="light" />
              </button>
            </div>
            <textarea
              placeholder="Description"
              rows={2}
              value={item.desc}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], desc: e.target.value };
                onChange(next);
              }}
              className={inputClass()}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { title: "", desc: "" }])}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-muted transition-colors hover:text-admin-accent"
        >
          <Plus size={14} weight="bold" />
          ADD ITEM
        </button>
      </div>
    );
  }

  // raw fallback for shapes the structured editor doesn't recognize
  return (
    <div>
      <textarea
        rows={6}
        value={rawText}
        onChange={(e) => {
          setRawText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            setRawJsonError(null);
            onChange(parsed);
          } catch {
            setRawJsonError("Invalid JSON — not saved yet");
          }
        }}
        className={`${inputClass()} font-mono text-xs`}
      />
      {rawJsonError && <p className="mt-1 text-xs text-admin-danger">{rawJsonError}</p>}
    </div>
  );
}

export function ContentEditor({
  initialContent,
  onSave,
  saveLabel = "Save",
  mediaPathPrefix,
  trackingId,
  trackingLabel,
}: {
  initialContent: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  saveLabel?: string;
  // Used to namespace uploaded files in Storage, e.g. "metro/hero".
  mediaPathPrefix?: string;
  // Identifies this editor to the surrounding ChangesProvider/sticky bar.
  // Falls back to mediaPathPrefix, then a generic id -- safe to omit
  // entirely when this editor isn't inside a ChangesProvider.
  trackingId?: string;
  trackingLabel?: string;
}) {
  const [fields, setFields] = useState<Field[]>(() => contentToFields(initialContent));
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState(() => JSON.stringify(initialContent, null, 2));
  const [rawError, setRawError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [baseline, setBaseline] = useState<Record<string, unknown>>(initialContent);

  function updateField(index: number, value: unknown) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function addField() {
    if (!newFieldKey.trim()) return;
    const defaultValue: unknown =
      newFieldType === "text"
        ? ""
        : newFieldType === "media"
          ? ""
          : newFieldType === "string-list"
            ? []
            : newFieldType === "title-desc-list"
              ? []
              : {};
    setFields((prev) => [...prev, { key: newFieldKey.trim(), type: newFieldType, value: defaultValue }]);
    setNewFieldKey("");
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);

    let content: Record<string, unknown>;
    if (rawMode) {
      try {
        content = JSON.parse(rawText);
      } catch {
        setStatus("error");
        setErrorMessage("Raw JSON is invalid — fix it before saving.");
        return;
      }
    } else {
      content = fieldsToContent(fields);
    }

    const result = await onSave(content);
    if (result.success) {
      setBaseline(content);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Unknown error");
    }
  }

  function toggleRawMode() {
    if (!rawMode) {
      setRawText(JSON.stringify(fieldsToContent(fields), null, 2));
      setRawMode(true);
    } else {
      try {
        const parsed = JSON.parse(rawText);
        setFields(contentToFields(parsed));
        setRawError(null);
        setRawMode(false);
      } catch {
        setRawError("Fix invalid JSON before switching back to the structured view.");
      }
    }
  }

  const currentContent = useMemo(() => {
    if (!rawMode) return fieldsToContent(fields);
    try {
      return JSON.parse(rawText);
    } catch {
      return null;
    }
  }, [rawMode, fields, rawText]);

  const isDirty = currentContent !== null && JSON.stringify(currentContent) !== JSON.stringify(baseline);

  const grouped = useMemo(() => groupFields(fields), [fields]);

  useTrackChanges(
    trackingId ?? mediaPathPrefix ?? "editor",
    trackingLabel ?? saveLabel,
    isDirty,
    handleSave
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleRawMode}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-faint transition-colors hover:text-admin-text"
        >
          {rawMode ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
          {rawMode ? "STRUCTURED VIEW" : "ADVANCED: EDIT RAW JSON"}
        </button>
        {isDirty && status !== "saving" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-warning" />
            未儲存
          </span>
        )}
        {status === "saving" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-text-faint" />
            儲存中…
          </span>
        )}
        {status === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-success">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-success" />
            已儲存
          </span>
        )}
        {status === "error" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-danger" />
            {errorMessage}
          </span>
        )}
      </div>

      {rawError && <p className="mt-2 text-xs text-admin-danger">{rawError}</p>}

      {rawMode ? (
        <textarea
          rows={16}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className={`${inputClass()} mt-3 font-mono text-xs`}
        />
      ) : (
        <div className="mt-4 space-y-6">
          {grouped.map((g) => {
            if (g.kind === "pair") {
              return (
                <div key={g.base}>
                  <label className={`${fieldLabelClass()} mb-2 block`}>{humanizeKey(g.base)}</label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-[10px] tracking-[0.1em] text-admin-text-faint">DESKTOP</p>
                      <AdminMediaDropzone
                        value={(g.desktop.field.value as string) ?? ""}
                        onChange={(v) => updateField(g.desktop.index, v)}
                        mediaPathPrefix={
                          mediaPathPrefix ? `${mediaPathPrefix}/${g.desktop.field.key}` : g.desktop.field.key
                        }
                        compact
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] tracking-[0.1em] text-admin-text-faint">MOBILE</p>
                      <AdminMediaDropzone
                        value={(g.mobile.field.value as string) ?? ""}
                        onChange={(v) => updateField(g.mobile.index, v)}
                        mediaPathPrefix={
                          mediaPathPrefix ? `${mediaPathPrefix}/${g.mobile.field.key}` : g.mobile.field.key
                        }
                        compact
                      />
                    </div>
                  </div>
                </div>
              );
            }

            const { field, index } = g;
            return (
              <div key={field.key + index}>
                <div className="mb-2 flex items-center justify-between">
                  <label className={fieldLabelClass()}>{field.key.toUpperCase()}</label>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="rounded-md p-1 text-admin-text-faint transition-colors hover:bg-admin-danger-soft hover:text-admin-danger"
                    aria-label={`Remove field ${field.key}`}
                  >
                    <Trash size={14} weight="light" />
                  </button>
                </div>
                <FieldEditor field={field} onChange={(value) => updateField(index, value)} mediaPathPrefix={mediaPathPrefix} />
              </div>
            );
          })}

          <div className="flex flex-wrap items-end gap-2 border-t border-admin-border pt-4">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass()}>NEW FIELD KEY</label>
              <input
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                placeholder="e.g. subtitle"
                className={`${inputClass()} w-48`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass()}>TYPE</label>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                className={`${inputClass()} w-40`}
              >
                <option value="text">Text</option>
                <option value="string-list">List of text</option>
                <option value="title-desc-list">List of title + description</option>
                <option value="media">Media (image/video)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1.5 rounded-md border border-admin-border px-3 py-2 text-xs font-medium text-admin-text-muted transition-colors hover:border-admin-accent hover:text-admin-accent"
            >
              <Plus size={14} weight="bold" />
              ADD FIELD
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

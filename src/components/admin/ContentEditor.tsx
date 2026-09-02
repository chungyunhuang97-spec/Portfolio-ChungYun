"use client";

import { useMemo, useState } from "react";
import { Plus, Trash, CaretDown, CaretUp } from "@phosphor-icons/react";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import { useTrackChanges } from "@/components/admin/ChangesContext";

type FieldType = "text" | "string-list" | "title-desc-list" | "object-list" | "media" | "raw";

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
const HEX_COLOR_PATTERN = /^#[0-9a-f]{3}([0-9a-f]{3}([0-9a-f]{2})?)?$/i;

function isSimpleValue(v: unknown): v is string | number | boolean {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}

// An "object-list" row: every value on the object is either a primitive
// (rendered as a plain input, or a color swatch when it looks like a hex
// value) or a short list of strings (rendered as a couple of compact
// inline inputs, e.g. `mediaLabels: ["Before", "After"]`). Anything more
// nested than that still falls through to the raw JSON editor.
function isObjectListItem(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  return Object.values(v).every(
    (val) => isSimpleValue(val) || val == null || (Array.isArray(val) && val.every((x) => typeof x === "string"))
  );
}

function detectType(value: unknown, key?: string): FieldType {
  if (key && MEDIA_KEY_PATTERN.test(key) && (typeof value === "string" || value == null)) {
    return "media";
  }
  if (typeof value === "string") return "text";
  if (Array.isArray(value)) {
    if (value.length === 0) return "string-list";
    if (value.every((v) => typeof v === "string")) return "string-list";
    if (value.every((v) => typeof v === "object" && v !== null && "title" in v && "desc" in v)) {
      return "title-desc-list";
    }
    if (value.every(isObjectListItem)) return "object-list";
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

// Same idea as humanizeKey but for a bare object-list item key ("hex",
// "painLabel", "mediaLabels") -- no media-suffix stripping needed here.
function humanizeItemKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toUpperCase();
}

/**
 * Turns an array-field key into the stem used to find its per-row media
 * siblings, e.g. "showcaseRows" -> "showcase_row". Naive pluralization
 * (strip a trailing "s") is enough for every real case in this codebase
 * (rows/cards/items/colors/inputs) -- it doesn't need to be linguistically
 * correct, just consistent with however the array field itself was named.
 */
function arrayFieldStem(key: string): string {
  const snake = key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
  const stripped = snake.endsWith("s") ? snake.slice(0, -1) : snake;
  return stripped;
}

interface AttachedMedia {
  label: string;
  field: Field;
  index: number;
}

type GroupedField =
  | { kind: "single"; field: Field; index: number }
  | {
      kind: "pair";
      base: string;
      desktop: { field: Field; index: number };
      mobile: { field: Field; index: number };
    }
  | {
      kind: "object-list";
      field: Field;
      index: number;
      // 0-based row index -> media fields belonging to that row.
      mediaByRow: Map<number, AttachedMedia[]>;
    };

/**
 * Groups the flat field list two ways:
 * 1. `desktopMediaUrl` / `mobileMediaUrl` pairs render side by side instead
 *    of as two identical-looking, seemingly-unrelated dropzones.
 * 2. Any top-level media field whose key matches an object-list array
 *    field's naming stem + row number (e.g. `showcaseRows` pairs with
 *    `showcase_row1_before_media_url` / `showcase_row1_after_media_url` for
 *    row index 0) is pulled OUT of the flat field list entirely and
 *    rendered inline inside that row's own card instead -- otherwise
 *    Postgres's jsonb key ordering (not insertion order) can scatter a
 *    section's own media upload far away from the rest of that section's
 *    content, which is confusing to edit against (reported: media fields
 *    "都移到後面才上傳，這樣有點混亂").
 */
function groupFields(fields: Field[]): GroupedField[] {
  const used = new Set<number>();
  const result: GroupedField[] = [];

  // Pass 1: object-list fields claim their per-row media siblings first,
  // so pass 2's desktop/mobile pairing never sees already-claimed fields.
  const objectListStems = fields
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.type === "object-list");

  const mediaByRowByField = new Map<number, Map<number, AttachedMedia[]>>();

  for (const { f: listField, i: listIndex } of objectListStems) {
    const stem = arrayFieldStem(listField.key);
    const items = Array.isArray(listField.value) ? listField.value : [];
    const mediaByRow = new Map<number, AttachedMedia[]>();

    items.forEach((_, rowIdx) => {
      const rowPattern = new RegExp(`^${stem}_?${rowIdx + 1}_(.+)$`, "i");
      fields.forEach((f, i) => {
        if (used.has(i) || f.type !== "media" || i === listIndex) return;
        const m = f.key.match(rowPattern);
        if (!m) return;
        used.add(i);
        const label = humanizeItemKey(m[1].replace(MEDIA_KEY_PATTERN, ""));
        const list = mediaByRow.get(rowIdx) ?? [];
        list.push({ label, field: f, index: i });
        mediaByRow.set(rowIdx, list);
      });
    });

    if (mediaByRow.size > 0) mediaByRowByField.set(listIndex, mediaByRow);
  }

  for (let i = 0; i < fields.length; i++) {
    if (used.has(i)) continue;
    const field = fields[i];

    if (field.type === "object-list") {
      used.add(i);
      result.push({ kind: "object-list", field, index: i, mediaByRow: mediaByRowByField.get(i) ?? new Map() });
      continue;
    }

    if (field.type === "media" && DESKTOP_MOBILE_PATTERN.test(field.key)) {
      const isDesktop = /desktop/i.test(field.key);
      const base = field.key.replace(/desktop/i, "").replace(/mobile/i, "");
      const partnerIndex = fields.findIndex((f, j) => {
        if (used.has(j) || j === i || f.type !== "media") return false;
        const fBase = f.key.replace(/desktop/i, "").replace(/mobile/i, "");
        if (fBase !== base) return false;
        return /desktop/i.test(f.key) !== isDesktop;
      });

      if (partnerIndex !== -1 && !used.has(partnerIndex)) {
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

/** One value inside an object-list row: a hex-looking string gets a real
 * color swatch (`<input type="color">`) synced with a text fallback (for
 * values the color input can't represent, e.g. 8-digit hex with alpha);
 * everything else is a plain, freely-editable text input -- never raw
 * JSON. */
function ObjectListValueEditor({
  itemKey,
  value,
  onChange,
}: {
  itemKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (typeof value === "string" && HEX_COLOR_PATTERN.test(value)) {
    const colorInputValue = value.length === 4 || value.length === 5 ? expandShortHex(value) : value.slice(0, 7);
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorInputValue}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-admin-border bg-admin-surface p-0.5"
          aria-label={`${itemKey} color`}
        />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass()} />
      </div>
    );
  }

  if (Array.isArray(value)) {
    const items = value as string[];
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <input
            key={i}
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className={`${inputClass()} w-auto flex-1 basis-32`}
          />
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-admin-border accent-admin-accent"
      />
    );
  }

  if (typeof value === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className={inputClass()}
      />
    );
  }

  const text = (value as string) ?? "";
  const long = text.length > 60;
  return long ? (
    <textarea rows={2} value={text} onChange={(e) => onChange(e.target.value)} className={inputClass()} />
  ) : (
    <input value={text} onChange={(e) => onChange(e.target.value)} className={inputClass()} />
  );
}

function expandShortHex(hex: string) {
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`;
}

function ObjectListEditor({
  items,
  onChange,
  mediaByRow,
  onRowMediaChange,
  mediaPathPrefix,
}: {
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  mediaByRow: Map<number, AttachedMedia[]>;
  onRowMediaChange: (fieldIndex: number, value: unknown) => void;
  mediaPathPrefix?: string;
}) {
  const templateKeys = items[0] ? Object.keys(items[0]) : [];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-md border border-admin-border bg-admin-surface p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium tracking-[0.1em] text-admin-text-faint">
              #{i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-md px-2 text-admin-text-faint transition-colors hover:bg-admin-danger-soft hover:text-admin-danger"
              aria-label="Remove item"
            >
              <Trash size={16} weight="light" />
            </button>
          </div>

          {Object.entries(item).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <label className="text-[10px] tracking-[0.08em] text-admin-text-faint">{humanizeItemKey(k)}</label>
              <ObjectListValueEditor
                itemKey={k}
                value={v}
                onChange={(nv) => {
                  const next = [...items];
                  next[i] = { ...next[i], [k]: nv };
                  onChange(next);
                }}
              />
            </div>
          ))}

          {(mediaByRow.get(i) ?? []).map((m) => (
            <div key={m.field.key} className="space-y-1">
              <label className="text-[10px] tracking-[0.08em] text-admin-text-faint">{m.label}</label>
              <AdminMediaDropzone
                value={(m.field.value as string) ?? ""}
                onChange={(v) => onRowMediaChange(m.index, v)}
                mediaPathPrefix={mediaPathPrefix ? `${mediaPathPrefix}/${m.field.key}` : m.field.key}
                compact
              />
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, Object.fromEntries(templateKeys.map((k) => [k, ""]))])}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-muted transition-colors hover:text-admin-accent"
      >
        <Plus size={14} weight="bold" />
        ADD ITEM
      </button>
    </div>
  );
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
            : newFieldType === "title-desc-list" || newFieldType === "object-list"
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

            if (g.kind === "object-list") {
              const { field, index, mediaByRow } = g;
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
                  <ObjectListEditor
                    items={(field.value as Record<string, unknown>[]) ?? []}
                    onChange={(v) => updateField(index, v)}
                    mediaByRow={mediaByRow}
                    onRowMediaChange={updateField}
                    mediaPathPrefix={mediaPathPrefix}
                  />
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
                <option value="object-list">List of items</option>
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

"use client";

import { useState } from "react";
import { Plus, Trash, CaretDown, CaretUp } from "@phosphor-icons/react";

type FieldType = "text" | "string-list" | "title-desc-list" | "raw";

interface Field {
  key: string;
  type: FieldType;
  value: unknown;
}

function detectType(value: unknown): FieldType {
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
    type: detectType(value),
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

function inputClass() {
  return "w-full border border-line bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
}

function FieldEditor({
  field,
  onChange,
}: {
  field: Field;
  onChange: (value: unknown) => void;
}) {
  const [rawText, setRawText] = useState(() => JSON.stringify(field.value, null, 2));
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);

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
              className="shrink-0 px-2 text-ink-faint transition-colors hover:text-red-700"
              aria-label="Remove item"
            >
              <Trash size={16} weight="light" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center gap-1.5 text-xs tracking-wide text-ink-faint transition-colors hover:text-accent"
        >
          <Plus size={14} weight="light" />
          ADD ITEM
        </button>
      </div>
    );
  }

  if (field.type === "title-desc-list") {
    const items = (field.value as { title: string; desc: string }[]) ?? [];
    return (
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-2 border border-line p-3">
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
                className="shrink-0 px-2 text-ink-faint transition-colors hover:text-red-700"
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
          className="inline-flex items-center gap-1.5 text-xs tracking-wide text-ink-faint transition-colors hover:text-accent"
        >
          <Plus size={14} weight="light" />
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
      {rawJsonError && <p className="mt-1 text-xs text-red-700">{rawJsonError}</p>}
    </div>
  );
}

export function ContentEditor({
  initialContent,
  onSave,
  saveLabel = "Save",
}: {
  initialContent: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  saveLabel?: string;
}) {
  const [fields, setFields] = useState<Field[]>(() => contentToFields(initialContent));
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState(() => JSON.stringify(initialContent, null, 2));
  const [rawError, setRawError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleRawMode}
          className="inline-flex items-center gap-1.5 text-xs tracking-wide text-ink-faint transition-colors hover:text-ink"
        >
          {rawMode ? <CaretUp size={14} weight="light" /> : <CaretDown size={14} weight="light" />}
          {rawMode ? "STRUCTURED VIEW" : "ADVANCED: EDIT RAW JSON"}
        </button>
      </div>

      {rawError && <p className="mt-2 text-xs text-red-700">{rawError}</p>}

      {rawMode ? (
        <textarea
          rows={16}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className={`${inputClass()} mt-3 font-mono text-xs`}
        />
      ) : (
        <div className="mt-4 space-y-6">
          {fields.map((field, i) => (
            <div key={field.key + i}>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs tracking-[0.15em] text-ink-faint">
                  {field.key.toUpperCase()}
                </label>
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="text-ink-faint transition-colors hover:text-red-700"
                  aria-label={`Remove field ${field.key}`}
                >
                  <Trash size={14} weight="light" />
                </button>
              </div>
              <FieldEditor field={field} onChange={(value) => updateField(i, value)} />
            </div>
          ))}

          <div className="flex flex-wrap items-end gap-2 border-t border-line pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-[0.15em] text-ink-faint">NEW FIELD KEY</label>
              <input
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                placeholder="e.g. subtitle"
                className={`${inputClass()} w-48`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-[0.15em] text-ink-faint">TYPE</label>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                className={`${inputClass()} w-40`}
              >
                <option value="text">Text</option>
                <option value="string-list">List of text</option>
                <option value="title-desc-list">List of title + description</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1.5 border border-line px-3 py-2 text-xs tracking-wide text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Plus size={14} weight="light" />
              ADD FIELD
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm tracking-wide text-bg transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : saveLabel}
        </button>
        {status === "saved" && <span className="text-sm text-emerald-700">Saved</span>}
        {status === "error" && <span className="text-sm text-red-700">{errorMessage}</span>}
      </div>
    </div>
  );
}

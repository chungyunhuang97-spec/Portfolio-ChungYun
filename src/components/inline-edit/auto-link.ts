"use client";

import { getIn, type InlineContent } from "@/lib/inline-edit";
import {
  getState,
  handleEditableKeyDown,
  isBeingEdited,
  post,
  setLocalValue,
  subscribe,
  type State,
} from "@/components/inline-edit/store";

/**
 * Makes CMS text editable in the admin preview without touching any page's
 * code.
 *
 * The admin sends every editor's SAVED content (what this page was rendered
 * from). Each string in it is indexed by its text; then every text node on
 * the page whose text equals one of those strings is turned into an
 * editable element linked to that field. Typing there is routed to the
 * matching admin form exactly like an explicit <Editable>.
 *
 * Rules that keep the matching honest:
 * - Only exact (whitespace-normalised) matches count. Text the page builds
 *   by transforming a value (splitting lines, joining strings) won't match;
 *   use <Editable> for those.
 * - Text the pages commonly split -- paragraphs on line breaks, "**bold**"
 *   runs -- is also indexed piece by piece. Editing one piece rewrites
 *   just that piece inside the full saved value.
 * - URLs, colours, ids and other non-copy strings are never indexed.
 * - If the same text is saved in several fields, edits go to all of them
 *   (they render identically, so they stay identical). Section content
 *   wins over project-level fields when both hold the same text.
 * - A linked element whose text later changes (e.g. a tab switch re-renders
 *   it) is re-matched, or unlinked if it no longer matches anything.
 */

interface Ref {
  target: string;
  path: string;
  /** Index of a piece of the value (see SEGMENT_SPLIT), or undefined for all of it. */
  seg?: number;
}

/** Splits pages apply to copy before rendering it. Capturing, so pieces sit at even indexes. */
const SEGMENT_SPLIT = /(\n+|\*\*)/;

interface Link {
  refs: Ref[];
  onInput: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: (e: MouseEvent) => void;
}

const SKIP_KEY = /(url|src|href|color|colour|icon|variant|theme|layout|align|style)$/i;
const SKIP_EXACT_KEY = new Set(["id", "slug", "status", "type", "key"]);
const SKIP_VALUE = /^(https?:|data:|\/|#[0-9a-f]{3,8}$)|\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|m4v)(\?.*)?$/i;
const SKIP_PARENT = "script,style,noscript,textarea,input,select,option,title,[data-pf-editable],[data-pf-ignore]";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function isCopy(key: string, value: string) {
  if (SKIP_EXACT_KEY.has(key) || SKIP_KEY.test(key)) return false;
  const v = norm(value);
  if (v.length < 2 || /^\d{1,2}$/.test(v)) return false;
  return !SKIP_VALUE.test(v);
}

function collectLeaves(value: unknown, path: string[], out: [string, string][]) {
  if (typeof value === "string") {
    const key = path[path.length - 1] ?? "";
    // Array items take their meaning from the array's key ("tagline.0").
    const named = /^\d+$/.test(key) ? (path[path.length - 2] ?? "") : key;
    if (isCopy(named, value)) out.push([path.join("."), value]);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectLeaves(v, [...path, String(i)], out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectLeaves(v, [...path, k], out);
  }
}

function buildIndex(saved: State["saved"]) {
  const index = new Map<string, Ref[]>();
  for (const [target, content] of Object.entries(saved)) {
    if (!content) continue;
    const leaves: [string, string][] = [];
    collectLeaves(content, [], leaves);
    const add = (key: string, ref: Ref) => {
      const refs = index.get(key) ?? [];
      refs.push(ref);
      index.set(key, refs);
    };
    for (const [path, value] of leaves) {
      add(norm(value), { target, path });
      const parts = value.split(SEGMENT_SPLIT);
      if (parts.length > 1) {
        for (let i = 0; i < parts.length; i += 2) {
          const piece = norm(parts[i]);
          if (piece.length >= 2) add(piece, { target, path, seg: i / 2 });
        }
      }
    }
  }
  for (const [key, refs] of index) {
    const sectionRefs = refs.filter((r) => r.target !== "project");
    if (sectionRefs.length > 0 && sectionRefs.length < refs.length) index.set(key, sectionRefs);
  }
  return index;
}

/** What a linked field should currently show: the live draft, else the saved value. */
function currentText(ref: Ref, s: State): string | undefined {
  const full = fullText(ref, s);
  if (full === undefined || ref.seg === undefined) return full;
  return full.split(SEGMENT_SPLIT)[ref.seg * 2];
}

/** The whole field's current value (ignores `seg`). */
function fullText(ref: Ref, s: State): string | undefined {
  const draft = s.overrides[ref.target];
  if (draft !== undefined) {
    const v = getIn(draft as InlineContent, ref.path);
    if (typeof v === "string") return v;
    if (v === null) return "";
  }
  const saved = getIn(s.saved[ref.target], ref.path);
  return typeof saved === "string" ? saved : undefined;
}

function setText(el: HTMLElement, text: string) {
  const only = el.childNodes.length === 1 ? el.firstChild : null;
  if (only && only.nodeType === Node.TEXT_NODE) only.nodeValue = text;
  else el.textContent = text;
}

let started = false;

export function startAutoLink() {
  if (started) return;
  started = true;

  const links = new Map<HTMLElement, Link>();
  let index = buildIndex(getState().saved);
  let lastSaved = getState().saved;
  let lastOverrides = getState().overrides;
  let scanTimer: number | undefined;

  function link(el: HTMLElement, refs: Ref[]) {
    const existing = links.get(el);
    if (existing) {
      existing.refs = refs;
      return;
    }
    const l: Link = {
      refs,
      onInput: () => {
        const typed = el.textContent ?? "";
        const s = getState();
        for (const r of l.refs) {
          let value = typed;
          if (r.seg !== undefined) {
            // Put the edited piece back into the full text, keeping the
            // line breaks / ** markers around it.
            const parts = (fullText(r, s) ?? "").split(SEGMENT_SPLIT);
            parts[r.seg * 2] = typed;
            value = parts.join("");
          }
          setLocalValue(r.target, r.path, value);
          post({ type: "edit", target: r.target, path: r.path, value });
        }
      },
      onKeyDown: (e) => handleEditableKeyDown(e, el, false),
      onFocus: () => post({ type: "focus", target: l.refs[0].target, path: l.refs[0].path }),
      // Catch up on anything the admin form changed while this was focused.
      onBlur: () => applyOverrides(),
      // While editing, clicks on the text shouldn't follow links or flip tabs.
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
    };
    el.setAttribute("data-pf-editable", "");
    el.setAttribute("data-placeholder", "輸入文字");
    el.setAttribute("contenteditable", "plaintext-only");
    el.spellcheck = false;
    el.addEventListener("input", l.onInput);
    el.addEventListener("keydown", l.onKeyDown);
    el.addEventListener("focus", l.onFocus);
    el.addEventListener("blur", l.onBlur);
    el.addEventListener("click", l.onClick);
    links.set(el, l);
  }

  function unlink(el: HTMLElement) {
    const l = links.get(el);
    if (!l) return;
    el.removeAttribute("data-pf-editable");
    el.removeAttribute("data-placeholder");
    el.removeAttribute("contenteditable");
    el.removeEventListener("input", l.onInput);
    el.removeEventListener("keydown", l.onKeyDown);
    el.removeEventListener("focus", l.onFocus);
    el.removeEventListener("blur", l.onBlur);
    el.removeEventListener("click", l.onClick);
    links.delete(el);
  }

  function scan() {
    const s = getState();

    // 1. Re-check what's already linked: drop removed elements, re-match
    //    elements whose text the page itself changed.
    for (const [el, l] of links) {
      if (!el.isConnected) {
        links.delete(el);
        continue;
      }
      if (isBeingEdited(el)) continue;
      const expected = currentText(l.refs[0], s);
      const shown = norm(el.textContent ?? "");
      if (expected !== undefined && norm(expected) === shown) continue;
      const refs = index.get(shown);
      if (refs) l.refs = refs;
      else unlink(el);
    }

    // 2. Link new matches.
    const found: [Text, Ref[]][] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text;
      const parent = text.parentElement;
      if (!parent || parent.closest(SKIP_PARENT)) continue;
      const key = norm(text.nodeValue ?? "");
      if (!key) continue;
      const refs = index.get(key);
      if (refs) found.push([text, refs]);
    }
    for (const [text, refs] of found) {
      const parent = text.parentElement;
      if (!parent || parent.closest("[data-pf-editable]")) continue;
      const meaningful = Array.from(parent.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE || norm(n.nodeValue ?? "") !== ""
      );
      if (meaningful.length === 1) {
        link(parent, refs);
      } else {
        // Shares its element with other text/elements ("01 / {title}"):
        // give it a span of its own.
        const span = document.createElement("span");
        parent.insertBefore(span, text);
        span.appendChild(text);
        link(span, refs);
      }
    }
  }

  function scheduleScan(delay = 150) {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(scan, delay);
  }

  /** Copies live drafts from the admin forms into linked elements. */
  function applyOverrides() {
    const s = getState();
    for (const [el, l] of links) {
      if (isBeingEdited(el) || !el.isConnected) continue;
      const text = currentText(l.refs[0], s);
      if (text !== undefined && el.textContent !== text) setText(el, text);
    }
  }

  subscribe(() => {
    const s = getState();
    if (s.saved !== lastSaved) {
      lastSaved = s.saved;
      index = buildIndex(s.saved);
      scheduleScan();
    }
    if (s.overrides !== lastOverrides) {
      lastOverrides = s.overrides;
      applyOverrides();
    }
  });

  // Clicking over to the admin form doesn't blur the element inside this
  // iframe; resync when the frame itself loses focus.
  window.addEventListener("blur", applyOverrides);

  new MutationObserver(() => scheduleScan()).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Let hydration and entrance animations settle before the first pass.
  scheduleScan(300);
}

import type { CaptionToken, Cutout } from "./types";

let idCounter = 0;
function makeId() {
  idCounter += 1;
  return `cutout-${idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Keeps existing cutouts (and their positions) when only growing/shrinking
 * the count, so nudging the "count" slider doesn't reshuffle everything. */
export function resizeCutouts(current: Cutout[], count: number): Cutout[] {
  if (count === current.length) return current;
  if (count < current.length) return current.slice(0, count);
  const next = [...current];
  while (next.length < count) {
    next.push(randomCutout());
  }
  return next;
}

function randomCutout(): Cutout {
  return {
    id: makeId(),
    xPct: 10 + Math.random() * 70,
    yPct: 10 + Math.random() * 70,
  };
}

export function randomizeCutouts(count: number): Cutout[] {
  return Array.from({ length: count }, randomCutout);
}

export function clampPct(value: number, maxSizePct: number): number {
  return Math.min(Math.max(value, 0), Math.max(0, 100 - maxSizePct));
}

/** Distributes `cutoutIds` evenly across the words of `caption`, inserting
 * each marker right after a word so the flow reads like the reference tool
 * ("Warm (img) lanterns glow like (img) luminous jewels ..."). Slots are
 * spaced using (count + 1) divisions so markers don't cluster at the ends;
 * on very short captions multiple markers can land after the same word. */
export function buildCaptionTokens(caption: string, cutoutIds: string[]): CaptionToken[] {
  const words = caption.trim().split(/\s+/).filter(Boolean);
  const count = cutoutIds.length;

  if (words.length === 0) {
    return cutoutIds.map((id) => ({ kind: "cutout", cutoutId: id }));
  }
  if (count === 0) {
    return words.map((text) => ({ kind: "word", text }));
  }

  const byIndex = new Map<number, string[]>();
  cutoutIds.forEach((id, i) => {
    const raw = Math.round(((i + 1) * words.length) / (count + 1)) - 1;
    const index = Math.min(words.length - 1, Math.max(0, raw));
    const bucket = byIndex.get(index) ?? [];
    bucket.push(id);
    byIndex.set(index, bucket);
  });

  const tokens: CaptionToken[] = [];
  words.forEach((word, i) => {
    tokens.push({ kind: "word", text: word });
    byIndex.get(i)?.forEach((id) => tokens.push({ kind: "cutout", cutoutId: id }));
  });
  return tokens;
}

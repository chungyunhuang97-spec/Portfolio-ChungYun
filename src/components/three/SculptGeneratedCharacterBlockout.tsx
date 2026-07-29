"use client";

// User-owned wrapper around the sculptor-generated factory. This file is
// created once and is safe to hand-edit; the .generated.ts file it imports
// is not (the sculptor tool refuses to silently overwrite it once written).
//
// Purpose: mount createSeatedHoodieCharacterModel() as a real THREE.Group in
// an R3F scene so the tool's own runtime-capture hook
// (window.__THREEJS_SCULPT_CAPTURE_RUNTIME__) actually exists on the page -
// this is what lets `sculpt module review` bind to a genuine runtime
// receipt instead of a fabricated one.
import { useMemo } from "react";
import { createSeatedHoodieCharacterModel } from "./generated/character-seated-desk.blockout.generated";

export function SculptGeneratedCharacterBlockout({ scale = 1 }: { scale?: number }) {
  const group = useMemo(() => createSeatedHoodieCharacterModel({ castShadow: true, receiveShadow: true }), []);
  return <primitive object={group} scale={scale} />;
}

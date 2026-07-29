"use client";

// Pipeline test component: loads the TRELLIS.2 image-to-3D output
// (a single static mesh, no rig/skeleton, see public/character-trellis-test-draco.glb,
// draco-compressed 1.5MB from a 10.6MB raw export)
// and auto-scales/grounds it so it can be dropped into the existing room
// scene next to the hand-built CharacterModel for a like-for-like
// scale/material/lighting comparison. Not wired into the real hero scene yet.

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { JSX } from "react";

const MODEL_PATH = "/character-trellis-test-draco.glb";

type TrellisCharacterModelProps = {
  targetHeight?: number;
} & JSX.IntrinsicElements["group"];

export function TrellisCharacterModel({
  targetHeight = 1.75,
  ...props
}: TrellisCharacterModelProps) {
  const { scene } = useGLTF(MODEL_PATH);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const rawSize = new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());
    const scaleFactor = rawSize.y > 0 ? targetHeight / rawSize.y : 1;
    clone.scale.setScalar(scaleFactor);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    clone.position.y -= scaledBox.min.y;
    clone.position.x -= (scaledBox.min.x + scaledBox.max.x) / 2;
    clone.position.z -= (scaledBox.min.z + scaledBox.max.z) / 2;

    return { object: clone, rawSize, scaleFactor };
  }, [scene, targetHeight]);

  if (typeof window !== "undefined") {
    console.log(
      "[TrellisCharacterModel] raw size (units):",
      prepared.rawSize,
      "scaleFactor:",
      prepared.scaleFactor,
    );
  }

  return (
    <group {...props}>
      <primitive object={prepared.object} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

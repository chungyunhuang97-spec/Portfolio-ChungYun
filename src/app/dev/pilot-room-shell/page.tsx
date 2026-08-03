"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { RoomShellModel } from "@/components/three/RoomShellModel";
import { CharacterModel } from "@/components/three/CharacterModel";

// Pilot preview for the room "shell" (architecture only: walls, floor, trim,
// doorway, alcove). The seated character is dropped near room-center just to
// sanity-check that furnishings will read correctly at scale once composed
// into this coordinate frame — placement is not final.
//
// Rev 2 — removed the placeholder CameraToyModel and wall-decor plaques.
// The old procedural camera was a rough stand-in; the real desk-group props
// (screen, camera, radio, plant, beanbag, rug) are being rebuilt from
// scratch via the img2threejs pipeline and will be composed back in here
// once ready.
export default function PilotRoomShellPage() {
  return (
    <div className="h-dvh w-full bg-[#cfcabf]">
      <Canvas shadows camera={{ position: [7, 5, 9], fov: 35 }}>
        <color attach="background" args={["#cfcabf"]} />
        <directionalLight
          position={[-6, 8, 4]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[5, 3, 6]}
          intensity={0.9}
          color="#eaf6ff"
        />
        <Environment preset="apartment" environmentIntensity={0.65} />

        <RoomShellModel />

        {/* No rotation here — CharacterModel is built with its front
            (face, chest circuit panel, knees, toes) facing local +Z, which
            already points roughly toward this camera's position. */}
        <group position={[0, 0, 0.3]}>
          <CharacterModel scale={1.1} />
        </group>

        <OrbitControls target={[0, 3, -1]} enablePan minDistance={4} maxDistance={20} />
      </Canvas>
    </div>
  );
}

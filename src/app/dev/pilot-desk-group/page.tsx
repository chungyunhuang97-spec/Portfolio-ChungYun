"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { RoomShellModel } from "@/components/three/RoomShellModel";
import { CharacterModel } from "@/components/three/CharacterModel";
import { DeskGroupModel } from "@/components/three/DeskGroupModel";
import { BeanbagChairModel } from "@/components/three/BeanbagChairModel";

// Pilot preview for the desk-group furnishings (table, screen, keyboard,
// mouse, camera, radio, pencil cup + cap lamp, coffee glass, plant, rug)
// built from the approved four-angle desk-group reference. Composed with
// the room shell and seated character so proportions and placement can be
// checked together in one shot, per the "build everything, review once"
// direction. Placement is a first pass, not final.
export default function PilotDeskGroupPage() {
  return (
    <div className="h-dvh w-full bg-[#cfcabf]">
      <Canvas shadows camera={{ position: [0, 3.4, 5.2], fov: 40 }}>
        <color attach="background" args={["#cfcabf"]} />
        <directionalLight
          position={[-4, 8, 5]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 3, 6]} intensity={0.9} color="#eaf6ff" />
        <Environment preset="apartment" environmentIntensity={0.65} />

        <RoomShellModel />

        <group position={[0, 0, 0.3]}>
          <CharacterModel scale={1.1} />
          <DeskGroupModel scale={1.1} />
          <group position={[2.1, 0, -0.3]} rotation={[0, -0.5, 0]}>
            <BeanbagChairModel color="#e8792b" scale={0.85} />
          </group>
        </group>

        <OrbitControls target={[0, 1.6, 0.8]} enablePan minDistance={2} maxDistance={20} />
      </Canvas>
    </div>
  );
}

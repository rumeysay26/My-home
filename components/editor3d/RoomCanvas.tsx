"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import { Room, FurnitureItem } from "@/lib/types";
import { RoomModel } from "./RoomModel";
import { FurnitureMesh } from "./FurnitureMesh";
import { cmToUnit } from "@/lib/scaleUtils";
import { Loader2 } from "lucide-react";

interface RoomCanvasProps {
  room: Room;
  furniture: FurnitureItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPositionChange: (
    id: string,
    position: { x: number; y: number; z: number },
    rotationY: number
  ) => void;
}

export function RoomCanvas({
  room,
  furniture,
  selectedId,
  onSelect,
  onPositionChange,
}: RoomCanvasProps) {
  const roomW = cmToUnit(room.width);
  const roomL = cmToUnit(room.length);
  const roomH = cmToUnit(room.ceiling_height);

  // Camera starts above and back, looking at center
  const cameraPos: [number, number, number] = [
    roomW * 0.8,
    roomH * 1.2,
    roomL * 1.5,
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: cameraPos, fov: 50, near: 0.01, far: 100 }}
        shadows
        style={{ width: "100%", height: "100%" }}
        onClick={(e) => {
          // Deselect if clicking empty space
          if (e.object.type === "Mesh" && !e.object.userData.furnitureId) {
            onSelect(null);
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[roomW, roomH * 2, roomL]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight
            position={[0, roomH - 0.1, 0]}
            intensity={0.5}
            color="#FFF5E0"
          />

          {/* Room geometry */}
          <RoomModel room={room} />

          {/* Furniture */}
          {furniture.map((item) => (
            <FurnitureMesh
              key={item.id}
              item={item}
              room={room}
              isSelected={selectedId === item.id}
              onSelect={() => onSelect(item.id)}
              onPositionChange={(pos, rot) =>
                onPositionChange(item.id, pos, rot)
              }
            />
          ))}

          {/* Camera controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={Math.max(roomW, roomL) * 3}
            maxPolarAngle={Math.PI / 2 - 0.05}
            target={[0, roomH * 0.3, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

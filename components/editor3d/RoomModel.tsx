"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Room } from "@/lib/types";
import { cmToUnit } from "@/lib/scaleUtils";

interface RoomModelProps {
  room: Room;
}

const WALL_THICKNESS = 0.02;

export function RoomModel({ room }: RoomModelProps) {
  const W = cmToUnit(room.width);
  const L = cmToUnit(room.length);
  const H = cmToUnit(room.ceiling_height);

  const wallColor = room.wall_color || "#F5F0EB";
  const floorColor = getFloorColor(room.floor_type);

  // Door dimensions
  const door = room.door_position;
  const doorW = cmToUnit(door.width || 90);
  const doorH = cmToUnit(door.height || 210);
  const doorOffset = cmToUnit(door.offset || 100);

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>

      {/* Floor grid overlay */}
      <gridHelper
        args={[Math.max(W, L) * 2, 40, "#D0CCC8", "#E8E4DF"]}
        position={[0, 0.001, 0]}
      />

      {/* Ceiling */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color="#FFFFFF" roughness={1} side={THREE.BackSide} />
      </mesh>

      {/* North wall (back) */}
      <Wall
        position={[0, H / 2, -L / 2]}
        rotation={[0, 0, 0]}
        size={[W, H]}
        color={wallColor}
      />

      {/* South wall (front) with door cutout */}
      <SouthWallWithDoor
        W={W}
        H={H}
        L={L}
        wallColor={wallColor}
        doorW={doorW}
        doorH={doorH}
        doorOffset={doorOffset}
        doorWall={door.wall}
      />

      {/* East wall */}
      <Wall
        position={[W / 2, H / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[L, H]}
        color={wallColor}
      />

      {/* West wall */}
      <Wall
        position={[-W / 2, H / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[L, H]}
        color={wallColor}
      />

      {/* Windows */}
      {room.window_positions?.map((win, i) => (
        <WindowPane
          key={i}
          win={win}
          roomW={W}
          roomL={L}
          roomH={H}
        />
      ))}
    </group>
  );
}

function Wall({
  position,
  rotation,
  size,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} side={THREE.FrontSide} />
    </mesh>
  );
}

function SouthWallWithDoor({
  W, H, L, wallColor, doorW, doorH, doorOffset, doorWall,
}: {
  W: number; H: number; L: number; wallColor: string;
  doorW: number; doorH: number; doorOffset: number; doorWall: string;
}) {
  // South wall — door only shown if door.wall === "south"
  const hasDoor = doorWall === "south";
  const wallZ = L / 2;

  if (!hasDoor) {
    return (
      <Wall
        position={[0, H / 2, wallZ]}
        rotation={[0, Math.PI, 0]}
        size={[W, H]}
        color={wallColor}
      />
    );
  }

  // Split south wall into sections around the door
  // Left section
  const leftW = doorOffset - W / 2;
  // Right section
  const rightStart = doorOffset + doorW - W / 2;
  const rightW = W - rightStart - W / 2;
  // Top section above door
  const topH = H - doorH;

  return (
    <group position={[0, 0, wallZ]} rotation={[0, Math.PI, 0]}>
      {leftW > 0 && (
        <mesh position={[-W / 2 + leftW / 2, H / 2, 0]}>
          <planeGeometry args={[leftW, H]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        </mesh>
      )}
      {rightW > 0 && (
        <mesh position={[W / 2 - rightW / 2, H / 2, 0]}>
          <planeGeometry args={[rightW, H]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        </mesh>
      )}
      {topH > 0 && (
        <mesh position={[-W / 2 + doorOffset + doorW / 2, doorH + topH / 2, 0]}>
          <planeGeometry args={[doorW, topH]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        </mesh>
      )}
      {/* Door frame */}
      <mesh position={[-W / 2 + doorOffset + doorW / 2, doorH / 2, -0.005]}>
        <planeGeometry args={[doorW + 0.05, doorH + 0.02]} />
        <meshStandardMaterial color="#C8A882" roughness={0.6} />
      </mesh>
    </group>
  );
}

function WindowPane({
  win, roomW, roomL, roomH,
}: {
  win: { wall: string; offset: number; width: number; height: number; sill_height: number };
  roomW: number; roomL: number; roomH: number;
}) {
  const winW = cmToUnit(win.width);
  const winH = cmToUnit(win.height);
  const sillH = cmToUnit(win.sill_height || 80);
  const offset = cmToUnit(win.offset);

  let position: [number, number, number] = [0, sillH + winH / 2, 0];

  switch (win.wall) {
    case "north":
      position = [offset - roomW / 2 + winW / 2, sillH + winH / 2, -roomL / 2 + 0.01];
      break;
    case "south":
      position = [offset - roomW / 2 + winW / 2, sillH + winH / 2, roomL / 2 - 0.01];
      break;
    case "east":
      position = [roomW / 2 - 0.01, sillH + winH / 2, offset - roomL / 2 + winW / 2];
      break;
    case "west":
      position = [-roomW / 2 + 0.01, sillH + winH / 2, offset - roomL / 2 + winW / 2];
      break;
  }

  return (
    <mesh position={position}>
      <planeGeometry args={[winW, winH]} />
      <meshStandardMaterial
        color="#A8D8EA"
        transparent
        opacity={0.4}
        roughness={0}
        metalness={0.1}
        emissive="#87CEEB"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function getFloorColor(floorType: string): string {
  const map: Record<string, string> = {
    hardwood: "#C4956A",
    tile: "#D8D0C8",
    carpet: "#B8A898",
    laminate: "#C8A87A",
    marble: "#E8E4E0",
    concrete: "#B0ADA8",
  };
  return map[floorType] || "#C4956A";
}

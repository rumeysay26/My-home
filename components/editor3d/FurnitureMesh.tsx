"use client";

import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FurnitureItem, Room } from "@/lib/types";
import { cmToUnit, clampPositionToRoom } from "@/lib/scaleUtils";

interface FurnitureMeshProps {
  item: FurnitureItem;
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (
    pos: { x: number; y: number; z: number },
    rotationY: number
  ) => void;
}

export function FurnitureMesh({
  item,
  room,
  isSelected,
  onSelect,
  onPositionChange,
}: FurnitureMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const itemW = cmToUnit(item.width_cm);
  const itemH = cmToUnit(item.height_cm);
  const itemD = cmToUnit(item.depth_cm);

  // Initial position from saved data
  const initPos: [number, number, number] = [
    item.position_x,
    itemH / 2,  // place on floor
    item.position_z,
  ];

  const imageUrl = item.processed_image_url || item.image_url;

  return (
    <group
      position={initPos}
      rotation={[0, item.rotation_y, 0]}
    >
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode="translate"
          showX
          showY={false}
          showZ
          onMouseUp={() => {
            if (!meshRef.current) return;
            const p = meshRef.current.position;
            const clamped = clampPositionToRoom(
              { x: p.x, y: p.y, z: p.z },
              { width: item.width_cm, height: item.height_cm, depth: item.depth_cm },
              { width: room.width, length: room.length, height: room.ceiling_height }
            );
            meshRef.current.position.set(clamped.x, clamped.y, clamped.z);
            const rot = meshRef.current.rotation.y;
            onPositionChange(clamped, rot);
          }}
        />
      )}

      {imageUrl ? (
        <TexturedFurnitureMesh
          ref={meshRef}
          imageUrl={imageUrl}
          width={itemW}
          height={itemH}
          depth={itemD}
          isSelected={isSelected}
          onClick={onSelect}
        />
      ) : (
        <PlaceholderFurnitureMesh
          ref={meshRef}
          width={itemW}
          height={itemH}
          depth={itemD}
          color={item.color || "#C8A882"}
          isSelected={isSelected}
          onClick={onSelect}
        />
      )}

      {/* Label */}
      {isSelected && (
        <mesh position={[0, itemH + 0.08, 0]}>
          <planeGeometry args={[0.3, 0.06]} />
          <meshBasicMaterial color="#2C2C2C" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Furniture with uploaded image as texture (billboard/plane style)
import { forwardRef } from "react";

const TexturedFurnitureMesh = forwardRef<
  THREE.Mesh,
  {
    imageUrl: string;
    width: number;
    height: number;
    depth: number;
    isSelected: boolean;
    onClick: () => void;
  }
>(({ imageUrl, width, height, depth, isSelected, onClick }, ref) => {
  const texture = useTexture(imageUrl);

  return (
    <mesh
      ref={ref}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      userData={{ furnitureId: true }}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        emissive={isSelected ? "#C8A882" : "#000000"}
        emissiveIntensity={isSelected ? 0.15 : 0}
        transparent
      />
    </mesh>
  );
});
TexturedFurnitureMesh.displayName = "TexturedFurnitureMesh";

const PlaceholderFurnitureMesh = forwardRef<
  THREE.Mesh,
  {
    width: number;
    height: number;
    depth: number;
    color: string;
    isSelected: boolean;
    onClick: () => void;
  }
>(({ width, height, depth, color, isSelected, onClick }, ref) => {
  return (
    <mesh
      ref={ref}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      userData={{ furnitureId: true }}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        emissive={isSelected ? "#C8A882" : "#000000"}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
});
PlaceholderFurnitureMesh.displayName = "PlaceholderFurnitureMesh";

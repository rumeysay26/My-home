// Convention: 1 Three.js unit = 100 cm = 1 meter
export const CM_TO_UNIT = 0.01;

export function cmToUnit(cm: number): number {
  return cm * CM_TO_UNIT;
}

export function unitToCm(unit: number): number {
  return unit / CM_TO_UNIT;
}

export interface RoomDimensions {
  width: number;   // cm
  length: number;  // cm
  height: number;  // cm
}

export interface FurnitureDimensions {
  width: number;   // cm
  height: number;  // cm
  depth: number;   // cm
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/** Convert room cm dimensions to Three.js units */
export function roomToScene(dims: RoomDimensions) {
  return {
    width: cmToUnit(dims.width),
    length: cmToUnit(dims.length),
    height: cmToUnit(dims.height),
  };
}

/** Convert furniture cm dimensions to Three.js units */
export function furnitureToScene(dims: FurnitureDimensions) {
  return {
    width: cmToUnit(dims.width),
    height: cmToUnit(dims.height),
    depth: cmToUnit(dims.depth),
  };
}

/** Check if furniture fits inside the room */
export function doesFurnitureFit(
  furniture: FurnitureDimensions,
  room: RoomDimensions
): { fits: boolean; message?: string } {
  if (furniture.width > room.width) {
    return {
      fits: false,
      message: `Furniture width (${furniture.width}cm) exceeds room width (${room.width}cm).`,
    };
  }
  if (furniture.depth > room.length) {
    return {
      fits: false,
      message: `Furniture depth (${furniture.depth}cm) exceeds room length (${room.length}cm).`,
    };
  }
  if (furniture.height > room.height) {
    return {
      fits: false,
      message: `Furniture height (${furniture.height}cm) exceeds ceiling height (${room.height}cm).`,
    };
  }
  return { fits: true };
}

/** Clamp a furniture position so it stays inside the room */
export function clampPositionToRoom(
  pos: Position3D,
  furniture: FurnitureDimensions,
  room: RoomDimensions
): Position3D {
  const rW = cmToUnit(room.width) / 2;
  const rL = cmToUnit(room.length) / 2;
  const fHalfW = cmToUnit(furniture.width) / 2;
  const fHalfD = cmToUnit(furniture.depth) / 2;

  return {
    x: Math.max(-rW + fHalfW, Math.min(rW - fHalfW, pos.x)),
    y: pos.y,
    z: Math.max(-rL + fHalfD, Math.min(rL - fHalfD, pos.z)),
  };
}

export type WallSide = "north" | "south" | "east" | "west";

export interface DoorConfig {
  wall: WallSide;
  offsetCm: number;   // distance from left edge of that wall
  widthCm: number;
  heightCm: number;
}

export interface WindowConfig {
  wall: WallSide;
  offsetCm: number;
  widthCm: number;
  heightCm: number;
  sillHeightCm: number;
}

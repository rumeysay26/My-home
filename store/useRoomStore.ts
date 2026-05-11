import { create } from "zustand";
import { Room, FurnitureItem } from "@/lib/types";

interface RoomState {
  activeRoom: Room | null;
  furniture: FurnitureItem[];
  selectedFurnitureId: string | null;
  isLoading: boolean;

  setActiveRoom: (room: Room) => void;
  setFurniture: (items: FurnitureItem[]) => void;
  addFurniture: (item: FurnitureItem) => void;
  updateFurniturePosition: (
    id: string,
    position: { x: number; y: number; z: number },
    rotationY: number
  ) => void;
  removeFurniture: (id: string) => void;
  setSelectedFurnitureId: (id: string | null) => void;
  updateRoomDimensions: (dims: Partial<Room>) => void;
  setIsLoading: (v: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  activeRoom: null,
  furniture: [],
  selectedFurnitureId: null,
  isLoading: false,

  setActiveRoom: (room) =>
    set({ activeRoom: room, furniture: room.furniture_items ?? [] }),

  setFurniture: (items) => set({ furniture: items }),

  addFurniture: (item) =>
    set((state) => ({ furniture: [...state.furniture, item] })),

  updateFurniturePosition: (id, position, rotationY) =>
    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id
          ? {
              ...f,
              position_x: position.x,
              position_y: position.y,
              position_z: position.z,
              rotation_y: rotationY,
            }
          : f
      ),
    })),

  removeFurniture: (id) =>
    set((state) => ({
      furniture: state.furniture.filter((f) => f.id !== id),
      selectedFurnitureId:
        state.selectedFurnitureId === id ? null : state.selectedFurnitureId,
    })),

  setSelectedFurnitureId: (id) => set({ selectedFurnitureId: id }),

  updateRoomDimensions: (dims) =>
    set((state) => ({
      activeRoom: state.activeRoom ? { ...state.activeRoom, ...dims } : null,
    })),

  setIsLoading: (v) => set({ isLoading: v }),
}));

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  project_id: string;
  type: "kitchen" | "living_room" | "bedroom";
  width: number;
  length: number;
  ceiling_height: number;
  door_position: DoorPosition;
  window_positions: WindowPosition[];
  wall_color: string;
  floor_type: string;
  design_state: DesignState;
  created_at: string;
  updated_at: string;
  furniture_items?: FurnitureItem[];
}

export interface DoorPosition {
  wall: "north" | "south" | "east" | "west";
  offset: number;   // cm from left edge of wall
  width: number;    // cm, default 90
  height: number;   // cm, default 210
}

export interface WindowPosition {
  wall: "north" | "south" | "east" | "west";
  offset: number;   // cm from left edge of wall
  width: number;    // cm
  height: number;   // cm
  sill_height: number; // cm from floor
}

export interface FurnitureItem {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  category: string;
  image_url: string | null;
  processed_image_url: string | null;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  color: string | null;
  material: string | null;
  notes: string | null;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_y: number;
  created_at: string;
}

export interface DesignState {
  camera?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  furniture?: FurnitureItemState[];
}

export interface FurnitureItemState {
  id: string;
  position: [number, number, number];
  rotation_y: number;
}

export interface Suggestion {
  id: string;
  user_id: string;
  room_type: "kitchen" | "living_room" | "bedroom" | "any";
  furniture_name: string;
  category: string | null;
  image_url: string;
  buy_link: string | null;
  price: number | null;
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  comment: string | null;
  likes_count: number;
  created_at: string;
  user?: Pick<User, "id" | "name" | "avatar_url">;
  is_liked?: boolean;
  is_saved?: boolean;
  comments?: SuggestionComment[];
}

export interface SuggestionComment {
  id: string;
  suggestion_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Pick<User, "id" | "name" | "avatar_url">;
}

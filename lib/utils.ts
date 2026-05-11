import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const ROOM_TYPES = [
  { value: "kitchen", label: "Kitchen" },
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
] as const;

export type RoomType = "kitchen" | "living_room" | "bedroom";

export const FURNITURE_CATEGORIES = [
  "Sofa",
  "Armchair",
  "Coffee Table",
  "Dining Table",
  "Dining Chair",
  "TV Unit",
  "Bookshelf",
  "Bed",
  "Wardrobe",
  "Dresser",
  "Nightstand",
  "Kitchen Cabinet",
  "Kitchen Island",
  "Console Table",
  "Desk",
  "Office Chair",
  "Side Table",
  "Ottoman",
  "Rug",
  "Other",
] as const;

export const FLOOR_TYPES = [
  { value: "hardwood", label: "Hardwood" },
  { value: "tile", label: "Tile" },
  { value: "carpet", label: "Carpet" },
  { value: "laminate", label: "Laminate" },
  { value: "marble", label: "Marble" },
  { value: "concrete", label: "Concrete" },
] as const;

export const MATERIALS = [
  "Wood",
  "Metal",
  "Fabric",
  "Leather",
  "Glass",
  "Plastic",
  "Marble",
  "Rattan",
  "Velvet",
  "Other",
] as const;

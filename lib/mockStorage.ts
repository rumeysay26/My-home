/**
 * localStorage-based mock database so the app works in preview without Supabase.
 * Mirrors the Supabase JS client chained query API.
 */

import { v4 as uuidv4 } from "uuid";

// ---------- seed data ----------
const SEED_USERS = [
  { id: "user-1", email: "demo@homedesign.com", name: "Demo User", avatar_url: null, created_at: new Date().toISOString() },
];
const SEED_PROJECTS = [
  { id: "proj-1", user_id: "user-1", name: "My Apartment", description: "2024 renovation", cover_image_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
const SEED_ROOMS = [
  {
    id: "room-1", project_id: "proj-1", type: "living_room",
    width: 420, length: 560, ceiling_height: 260,
    door_position: { wall: "south", offset: 100, width: 90, height: 210 },
    window_positions: [{ wall: "north", offset: 80, width: 120, height: 130, sill_height: 85 }],
    wall_color: "#F0EBE3", floor_type: "hardwood",
    design_state: {},
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    furniture_items: [],
  },
];
const SEED_SUGGESTIONS = [
  {
    id: "sug-1", user_id: "user-1", room_type: "living_room",
    furniture_name: "IKEA EKTORP Sofa", category: "Sofa",
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    buy_link: "https://ikea.com", price: 599,
    width_cm: 218, height_cm: 88, depth_cm: 88,
    comment: "Perfect for smaller living rooms. Very comfortable and easy to clean.",
    likes_count: 24, created_at: new Date().toISOString(),
    user: { id: "user-1", name: "Demo User", avatar_url: null },
    is_liked: false, is_saved: false,
  },
  {
    id: "sug-2", user_id: "user-1", room_type: "bedroom",
    furniture_name: "HAY Loop Stand Bed", category: "Bed",
    image_url: "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=400&q=80",
    buy_link: null, price: 1200,
    width_cm: 160, height_cm: 80, depth_cm: 210,
    comment: "Minimalist Scandinavian design. Solid oak frame.",
    likes_count: 41, created_at: new Date().toISOString(),
    user: { id: "user-1", name: "Demo User", avatar_url: null },
    is_liked: false, is_saved: false,
  },
  {
    id: "sug-3", user_id: "user-1", room_type: "kitchen",
    furniture_name: "IKEA KALLAX Shelf", category: "Bookshelf",
    image_url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80",
    buy_link: "https://ikea.com", price: 149,
    width_cm: 147, height_cm: 147, depth_cm: 39,
    comment: "Works great as a kitchen island or room divider.",
    likes_count: 18, created_at: new Date().toISOString(),
    user: { id: "user-1", name: "Demo User", avatar_url: null },
    is_liked: false, is_saved: false,
  },
  {
    id: "sug-4", user_id: "user-1", room_type: "living_room",
    furniture_name: "MUUTO Around Coffee Table", category: "Coffee Table",
    image_url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80",
    buy_link: null, price: 320,
    width_cm: 80, height_cm: 40, depth_cm: 80,
    comment: "Compact round table, perfect for smaller living rooms.",
    likes_count: 33, created_at: new Date().toISOString(),
    user: { id: "user-1", name: "Demo User", avatar_url: null },
    is_liked: false, is_saved: false,
  },
];

// ---------- helpers ----------
function getStore<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(`hd_${key}`);
    if (!raw) {
      localStorage.setItem(`hd_${key}`, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T[];
  } catch { return seed; }
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`hd_${key}`, JSON.stringify(data));
}

function getAuth(): { userId: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hd_auth");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setAuth(auth: { userId: string; email: string } | null): void {
  if (typeof window === "undefined") return;
  if (auth) localStorage.setItem("hd_auth", JSON.stringify(auth));
  else localStorage.removeItem("hd_auth");
}

type Row = Record<string, unknown>;

// ---------- query builder ----------
function makeQuery(tableName: string) {
  let rows: Row[] = [];
  let filters: Array<{ key: string; value: unknown }> = [];
  let orderKey: string | null = null;
  let orderAsc = true;
  let limitOne = false;
  let insertData: Row | Row[] | null = null;
  let updateData: Row | null = null;
  let isDelete = false;
  let selectColumns = "*";

  const loadRows = () => {
    switch (tableName) {
      case "users": return getStore("users", SEED_USERS as unknown as Row[]);
      case "projects": return getStore("projects", SEED_PROJECTS as unknown as Row[]);
      case "rooms": return getStore("rooms", SEED_ROOMS as unknown as Row[]);
      case "furniture_items": return getStore("furniture_items", [] as Row[]);
      case "suggestions": return getStore("suggestions", SEED_SUGGESTIONS as unknown as Row[]);
      case "suggestion_likes": return getStore("suggestion_likes", [] as Row[]);
      case "suggestion_comments": return getStore("suggestion_comments", [] as Row[]);
      case "saved_suggestions": return getStore("saved_suggestions", [] as Row[]);
      default: return [];
    }
  };

  const saveRows = (data: Row[]) => {
    setStore(tableName, data);
  };

  const q = {
    select(cols = "*") { selectColumns = cols; return q; },

    eq(key: string, value: unknown) { filters.push({ key, value }); return q; },

    order(key: string, opts?: { ascending?: boolean }) {
      orderKey = key;
      orderAsc = opts?.ascending !== false;
      return q;
    },

    single() { limitOne = true; return q; },

    insert(data: Row | Row[]) { insertData = data; return q; },

    update(data: Row) { updateData = data; return q; },

    delete() { isDelete = true; return q; },

    async then(resolve: (result: { data: unknown; error: unknown }) => void) {
      try {
        rows = loadRows();

        // INSERT
        if (insertData !== null) {
          const items = Array.isArray(insertData) ? insertData : [insertData];
          const newItems = items.map((item) => ({
            ...item,
            id: item.id || uuidv4(),
            created_at: item.created_at || new Date().toISOString(),
          }));
          saveRows([...rows, ...newItems]);
          const result = limitOne ? newItems[0] : newItems;
          return resolve({ data: result, error: null });
        }

        // UPDATE
        if (updateData !== null) {
          const updated: Row[] = [];
          let match: Row | null = null;
          for (const row of rows) {
            const isMatch = filters.every((f) => row[f.key] === f.value);
            if (isMatch) {
              const merged = { ...row, ...updateData };
              updated.push(merged);
              match = merged;
            } else {
              updated.push(row);
            }
          }
          saveRows(updated);
          // Attach sub-relations for rooms
          if (tableName === "rooms" && match) {
            const furniture = getStore("furniture_items", [] as Row[]).filter((f) => f["room_id"] === match!["id"]);
            (match as Record<string, unknown>)["furniture_items"] = furniture;
          }
          return resolve({ data: limitOne ? match : updated, error: null });
        }

        // DELETE
        if (isDelete) {
          const remaining = rows.filter((row) => !filters.every((f) => row[f.key] === f.value));
          saveRows(remaining);
          return resolve({ data: null, error: null });
        }

        // SELECT
        let result = rows.filter((row) => filters.every((f) => row[f.key] === f.value));

        // Attach relations
        if (tableName === "rooms") {
          const allFurniture = getStore("furniture_items", [] as Row[]);
          result = result.map((room) => ({
            ...room,
            furniture_items: allFurniture.filter((f) => f["room_id"] === room["id"]),
          }));
        }

        if (orderKey) {
          const k = orderKey;
          result.sort((a, b) => {
            const av = a[k] as string; const bv = b[k] as string;
            if (av < bv) return orderAsc ? -1 : 1;
            if (av > bv) return orderAsc ? 1 : -1;
            return 0;
          });
        }

        return resolve({ data: limitOne ? (result[0] ?? null) : result, error: null });
      } catch (err) {
        return resolve({ data: null, error: err });
      }
    },
  };

  return q;
}

// ---------- auth listeners ----------
const authListeners: Array<(event: string, session: unknown) => void> = [];

function notifyAuthChange(event: string) {
  const auth = getAuth();
  const session = auth
    ? { user: { id: auth.userId, email: auth.email } }
    : null;
  authListeners.forEach((l) => l(event, session));
}

// ---------- storage mock ----------
const storageMock = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File) {
        // Store as base64 in localStorage for demo
        return new Promise<{ data: unknown; error: unknown }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const b64 = reader.result as string;
            try {
              localStorage.setItem(`hd_file_${bucket}_${path}`, b64);
            } catch { /* quota exceeded — ignore */ }
            resolve({ data: { path }, error: null });
          };
          reader.onerror = () => resolve({ data: null, error: reader.error });
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl(path: string) {
        const stored = typeof window !== "undefined"
          ? localStorage.getItem(`hd_file_${bucket}_${path}`)
          : null;
        return {
          data: { publicUrl: stored || `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80` },
        };
      },
    };
  },
};

// ---------- main mock client ----------
export const mockSupabase = {
  from(table: string) {
    return makeQuery(table);
  },

  auth: {
    async getSession() {
      const auth = getAuth();
      if (!auth) return { data: { session: null }, error: null };
      return {
        data: { session: { user: { id: auth.userId, email: auth.email } } },
        error: null,
      };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const users = getStore("users", SEED_USERS as unknown as Row[]);
      // Demo: accept demo@homedesign.com / password, or any email with any password for registered users
      const storedPasswords = JSON.parse(localStorage.getItem("hd_passwords") || "{}");
      const user = users.find((u) => u["email"] === email);
      if (!user) return { error: { message: "No account found with this email." } };
      if (storedPasswords[email] && storedPasswords[email] !== password) {
        return { error: { message: "Incorrect password." } };
      }
      setAuth({ userId: user["id"] as string, email });
      notifyAuthChange("SIGNED_IN");
      return { error: null };
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { name?: string } } }) {
      const users = getStore("users", SEED_USERS as unknown as Row[]);
      if (users.find((u) => u["email"] === email)) {
        return { error: { message: "An account with this email already exists." } };
      }
      const newUser = {
        id: uuidv4(), email,
        name: options?.data?.name || null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      setStore("users", [...users, newUser]);
      // Save password
      const passwords = JSON.parse(localStorage.getItem("hd_passwords") || "{}");
      passwords[email] = password;
      localStorage.setItem("hd_passwords", JSON.stringify(passwords));
      setAuth({ userId: newUser.id, email });
      notifyAuthChange("SIGNED_IN");
      return { error: null };
    },

    async signOut() {
      setAuth(null);
      notifyAuthChange("SIGNED_OUT");
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: unknown) => void) {
      authListeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              const i = authListeners.indexOf(callback);
              if (i > -1) authListeners.splice(i, 1);
            },
          },
        },
      };
    },
  },

  storage: storageMock,
};

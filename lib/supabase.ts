/**
 * Supabase client — falls back to a localStorage-based mock when no real
 * NEXT_PUBLIC_SUPABASE_URL is set, so the app works in preview without a backend.
 */
import { mockSupabase } from "./mockStorage";

const hasRealSupabase =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("your_");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = hasRealSupabase
  ? (() => {
      // Dynamic require to avoid import errors when env vars not set
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createBrowserClient } = require("@supabase/ssr");
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    })()
  : mockSupabase;

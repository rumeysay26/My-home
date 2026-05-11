"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { LayoutDashboard, Lightbulb, LogOut, User } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { user } = useAuthStore();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-base font-bold text-primary tracking-tight">
          HomeDesign
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Projects
          </Link>
          <Link
            href="/suggestions"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all"
          >
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-accent-dark" />
            </div>
            <span className="text-sm text-primary font-medium hidden sm:block">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

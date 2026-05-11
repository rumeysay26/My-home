"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Suggestion } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { SuggestionCard } from "@/components/suggestions/SuggestionCard";
import { SuggestionFilters } from "@/components/suggestions/SuggestionFilters";
import { Lightbulb, Plus, Loader2 } from "lucide-react";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filtered, setFiltered] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setUserId(session?.user?.id ?? null);

    const { data } = await supabase
      .from("suggestions")
      .select("*, user:user_id(*)")
      .order("created_at", { ascending: false });

    if (data) {
      setSuggestions(data as Suggestion[]);
      setFiltered(data as Suggestion[]);
    }
    setIsLoading(false);
  }

  function handleFilter(roomType: string, category: string, sort: string) {
    let result = [...suggestions];
    if (roomType && roomType !== "any") {
      result = result.filter((s) => s.room_type === roomType || s.room_type === "any");
    }
    if (category) {
      result = result.filter((s) => s.category === category);
    }
    if (sort === "likes") {
      result.sort((a, b) => b.likes_count - a.likes_count);
    } else if (sort === "price_asc") {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price_desc") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }
    setFiltered(result);
  }

  async function handleLike(id: string) {
    if (!userId) return;
    const likes = JSON.parse(localStorage.getItem("hd_suggestion_likes") || "{}");
    const liked = likes[id];

    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, likes_count: liked ? s.likes_count - 1 : s.likes_count + 1, is_liked: !liked }
          : s
      )
    );
    setFiltered((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, likes_count: liked ? s.likes_count - 1 : s.likes_count + 1, is_liked: !liked }
          : s
      )
    );

    likes[id] = !liked;
    localStorage.setItem("hd_suggestion_likes", JSON.stringify(likes));

    // Update DB
    const suggs = JSON.parse(localStorage.getItem("hd_suggestions") || "[]");
    const updated = suggs.map((s: Suggestion) =>
      s.id === id ? { ...s, likes_count: liked ? s.likes_count - 1 : s.likes_count + 1 } : s
    );
    localStorage.setItem("hd_suggestions", JSON.stringify(updated));
  }

  async function handleSave(id: string) {
    const saves = JSON.parse(localStorage.getItem("hd_saved_suggestions") || "{}");
    saves[id] = !saves[id];
    localStorage.setItem("hd_saved_suggestions", JSON.stringify(saves));
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_saved: saves[id] } : s))
    );
    setFiltered((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_saved: saves[id] } : s))
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-accent-dark" />
            <div>
              <h1 className="page-title">Furniture Suggestions</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Discover ideas shared by the community
              </p>
            </div>
          </div>
          <Link href="/suggestions/new" className="btn-accent inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Share a suggestion
          </Link>
        </div>

        {/* Filters */}
        <SuggestionFilters onFilter={handleFilter} total={filtered.length} />

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center mt-6">
            <Lightbulb className="w-10 h-10 text-accent/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No suggestions match your filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
            {filtered.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onLike={() => handleLike(s.id)}
                onSave={() => handleSave(s.id)}
                isLoggedIn={!!userId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

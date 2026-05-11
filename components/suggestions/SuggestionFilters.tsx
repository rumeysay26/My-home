"use client";

import { useState } from "react";
import { ROOM_TYPES, FURNITURE_CATEGORIES } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  onFilter: (roomType: string, category: string, sort: string) => void;
  total: number;
}

export function SuggestionFilters({ onFilter, total }: Props) {
  const [roomType, setRoomType] = useState("any");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");

  function apply(rt: string, cat: string, s: string) {
    setRoomType(rt);
    setCategory(cat);
    setSort(s);
    onFilter(rt, cat, s);
  }

  return (
    <div className="card p-4 flex flex-wrap items-center gap-3">
      <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />

      {/* Room type */}
      <select
        value={roomType}
        onChange={(e) => apply(e.target.value, category, sort)}
        className="input w-auto text-sm"
      >
        <option value="any">All rooms</option>
        {ROOM_TYPES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => apply(roomType, e.target.value, sort)}
        className="input w-auto text-sm"
      >
        <option value="">All categories</option>
        {FURNITURE_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => apply(roomType, category, e.target.value)}
        className="input w-auto text-sm"
      >
        <option value="recent">Most recent</option>
        <option value="likes">Most liked</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>

      <span className="text-sm text-muted-foreground ml-auto">
        {total} {total === 1 ? "result" : "results"}
      </span>
    </div>
  );
}

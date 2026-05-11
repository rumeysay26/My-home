"use client";

import { Suggestion } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Heart, Bookmark, ExternalLink, Ruler } from "lucide-react";

interface Props {
  suggestion: Suggestion;
  onLike: () => void;
  onSave: () => void;
  isLoggedIn: boolean;
}

const roomLabels: Record<string, string> = {
  kitchen: "Kitchen",
  living_room: "Living Room",
  bedroom: "Bedroom",
  any: "Any room",
};

export function SuggestionCard({ suggestion: s, onLike, onSave, isLoggedIn }: Props) {
  return (
    <div className="card group overflow-hidden hover:shadow-card-hover transition-all duration-200">
      {/* Image */}
      <div className="aspect-square bg-muted overflow-hidden relative">
        <img
          src={s.image_url}
          alt={s.furniture_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Room badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium text-primary px-2 py-1 rounded-full">
            {roomLabels[s.room_type] ?? s.room_type}
          </span>
        </div>
        {/* Save button */}
        <button
          onClick={onSave}
          disabled={!isLoggedIn}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            s.is_saved
              ? "bg-accent text-white"
              : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:text-accent"
          }`}
        >
          <Bookmark className="w-4 h-4" fill={s.is_saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2">
            {s.furniture_name}
          </h3>
          {s.price != null && (
            <span className="text-sm font-semibold text-accent-dark shrink-0">
              {formatPrice(s.price)}
            </span>
          )}
        </div>

        {s.category && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {s.category}
          </span>
        )}

        {/* Dimensions */}
        {(s.width_cm || s.height_cm || s.depth_cm) && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground font-mono">
            <Ruler className="w-3 h-3" />
            {[s.width_cm, s.height_cm, s.depth_cm].filter(Boolean).join(" × ")} cm
          </div>
        )}

        {/* Comment */}
        {s.comment && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {s.comment}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
          <button
            onClick={onLike}
            disabled={!isLoggedIn}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              s.is_liked
                ? "text-destructive"
                : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <Heart className="w-4 h-4" fill={s.is_liked ? "currentColor" : "none"} />
            {s.likes_count}
          </button>

          {s.buy_link && (
            <a
              href={s.buy_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent-dark hover:underline font-medium"
            >
              Buy <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

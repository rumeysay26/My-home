"use client";

import { FurnitureItem } from "@/lib/types";
import { Trash2, Move, RotateCcw, Box } from "lucide-react";
import Image from "next/image";

interface Props {
  furniture: FurnitureItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
}

export function FurnitureGallery({ furniture, selectedId, onSelect, onDelete }: Props) {
  if (furniture.length === 0) {
    return (
      <div className="text-center py-8">
        <Box className="w-8 h-8 text-accent/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No furniture yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Upload items to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="section-title">Furniture ({furniture.length})</h3>
      <p className="text-xs text-muted-foreground -mt-2">
        Click an item to select it in the 3D view. Then drag to reposition.
      </p>

      <div className="space-y-2">
        {furniture.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(selectedId === item.id ? null : item.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
              selectedId === item.id
                ? "border-accent bg-accent/5 shadow-card"
                : "border-border hover:border-accent/30 hover:bg-muted/40"
            }`}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {item.processed_image_url || item.image_url ? (
                <img
                  src={item.processed_image_url || item.image_url!}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Box className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {item.width_cm}×{item.height_cm}×{item.depth_cm} cm
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {selectedId === item.id && (
                <Move className="w-4 h-4 text-accent" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive/60 hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

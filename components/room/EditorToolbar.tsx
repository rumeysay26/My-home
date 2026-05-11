"use client";

import { Trash2, X, Move } from "lucide-react";

interface Props {
  selectedId: string;
  onDelete: () => void;
  onDeselect: () => void;
}

export function EditorToolbar({ selectedId, onDelete, onDeselect }: Props) {
  return (
    <div className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm">
      <Move className="w-4 h-4 text-accent/80" />
      <span className="flex-1 text-sm">1 item selected — drag the arrows in 3D to move</span>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 bg-destructive/80 hover:bg-destructive px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <button
        onClick={onDeselect}
        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

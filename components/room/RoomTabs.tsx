"use client";

import { RoomType } from "@/lib/utils";
import { UtensilsCrossed, Sofa, Bed } from "lucide-react";

interface Props {
  activeTab: RoomType;
  onTabChange: (tab: RoomType) => void;
}

const tabs = [
  { id: "kitchen" as const, label: "Kitchen", icon: UtensilsCrossed },
  { id: "living_room" as const, label: "Living Room", icon: Sofa },
  { id: "bedroom" as const, label: "Bedroom", icon: Bed },
];

export function RoomTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-2 border-b border-border/60 pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === tab.id
              ? "border-accent-dark text-accent-dark"
              : "border-transparent text-muted-foreground hover:text-primary hover:border-border"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

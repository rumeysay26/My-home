"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Room, FurnitureItem } from "@/lib/types";
import { RoomType } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";
import { supabase } from "@/lib/supabase";
import { RoomDimensionsForm } from "./RoomDimensionsForm";
import { FurnitureUpload } from "./FurnitureUpload";
import { FurnitureGallery } from "./FurnitureGallery";
import { EditorToolbar } from "./EditorToolbar";
import { doesFurnitureFit } from "@/lib/scaleUtils";
import { Settings2, Box, Upload, Save, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/useToast";

// Lazy-load the 3D canvas (heavy)
const RoomCanvas = dynamic(
  () => import("@/components/editor3d/RoomCanvas").then((m) => ({ default: m.RoomCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
        <div className="text-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-accent" />
          <p className="text-sm">Loading 3D editor...</p>
        </div>
      </div>
    ),
  }
);

interface RoomEditorProps {
  room: Room | null;
  roomType: RoomType;
  projectId: string;
  onSaved: (room: Room) => void;
}

type Panel = "dimensions" | "furniture" | "gallery";

export function RoomEditor({ room, roomType, projectId, onSaved }: RoomEditorProps) {
  const { activeRoom, furniture, selectedFurnitureId, setActiveRoom,
          setFurniture, addFurniture, updateFurniturePosition,
          removeFurniture, setSelectedFurnitureId } = useRoomStore();

  const [activePanel, setActivePanel] = useState<Panel>("dimensions");
  const [isSaving, setIsSaving] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);

  useEffect(() => {
    if (room) {
      setActiveRoom(room);
    }
  }, [room]);

  async function handleDimensionsSaved(updatedRoom: Room) {
    setActiveRoom(updatedRoom);
    onSaved(updatedRoom);
  }

  async function handleFurnitureAdded(item: FurnitureItem) {
    if (!activeRoom) return;

    const check = doesFurnitureFit(
      { width: item.width_cm, height: item.height_cm, depth: item.depth_cm },
      { width: activeRoom.width, length: activeRoom.length, height: activeRoom.ceiling_height }
    );

    if (!check.fits) {
      setSizeWarning(check.message || "This item may be too large for the room.");
      setTimeout(() => setSizeWarning(null), 6000);
    }

    addFurniture(item);
    setActivePanel("gallery");
  }

  async function handlePositionChange(
    id: string,
    position: { x: number; y: number; z: number },
    rotationY: number
  ) {
    updateFurniturePosition(id, position, rotationY);

    // Debounced auto-save position
    await supabase
      .from("furniture_items")
      .update({
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        rotation_y: rotationY,
      })
      .eq("id", id);
  }

  async function handleDeleteFurniture(id: string) {
    removeFurniture(id);
    await supabase.from("furniture_items").delete().eq("id", id);
    toast({ title: "Furniture removed" });
  }

  async function handleSaveDesign() {
    if (!activeRoom) return;
    setIsSaving(true);

    const { data, error } = await supabase
      .from("rooms")
      .update({
        design_state: {
          furniture: furniture.map((f) => ({
            id: f.id,
            position: [f.position_x, f.position_y, f.position_z],
            rotation_y: f.rotation_y,
          })),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeRoom.id)
      .select("*, furniture_items(*)")
      .single();

    if (data) {
      onSaved(data);
      toast({ title: "Room design saved!" });
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
    setIsSaving(false);
  }

  const roomLabel: Record<RoomType, string> = {
    kitchen: "Kitchen",
    living_room: "Living Room",
    bedroom: "Bedroom",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[70vh]">
      {/* Left panel */}
      <div className="lg:w-80 flex flex-col gap-4 shrink-0">
        {/* Panel switcher */}
        <div className="card p-1 flex gap-1">
          {(
            [
              { id: "dimensions", icon: Settings2, label: "Room" },
              { id: "furniture", icon: Upload, label: "Upload" },
              { id: "gallery", icon: Box, label: "Gallery" },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePanel(p.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activePanel === p.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              }`}
            >
              <p.icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="card flex-1 overflow-y-auto p-5">
          {activePanel === "dimensions" && (
            <RoomDimensionsForm
              room={activeRoom}
              roomType={roomType}
              projectId={projectId}
              onSaved={handleDimensionsSaved}
            />
          )}
          {activePanel === "furniture" && (
            <FurnitureUpload
              roomId={activeRoom?.id}
              roomType={roomType}
              onAdded={handleFurnitureAdded}
            />
          )}
          {activePanel === "gallery" && (
            <FurnitureGallery
              furniture={furniture}
              selectedId={selectedFurnitureId}
              onSelect={setSelectedFurnitureId}
              onDelete={handleDeleteFurniture}
            />
          )}
        </div>

        {/* Save button */}
        {activeRoom && (
          <button
            onClick={handleSaveDesign}
            disabled={isSaving}
            className="btn-accent flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save design
          </button>
        )}
      </div>

      {/* 3D canvas */}
      <div className="flex-1 flex flex-col gap-3 min-h-[500px]">
        {/* Size warning */}
        {sizeWarning && (
          <div className="flex items-start gap-2 bg-warning/10 border border-warning/30 text-warning rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {sizeWarning}
          </div>
        )}

        {/* Editor toolbar */}
        {selectedFurnitureId && (
          <EditorToolbar
            selectedId={selectedFurnitureId}
            onDelete={() => handleDeleteFurniture(selectedFurnitureId)}
            onDeselect={() => setSelectedFurnitureId(null)}
          />
        )}

        {/* 3D view */}
        <div className="flex-1">
          {activeRoom ? (
            <RoomCanvas
              room={activeRoom}
              furniture={furniture}
              selectedId={selectedFurnitureId}
              onSelect={setSelectedFurnitureId}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <div className="w-full h-full min-h-[400px] bg-muted rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Box className="w-10 h-10 text-accent/40" />
              <p className="text-sm font-medium">
                Set room dimensions to see the 3D preview
              </p>
              <button
                onClick={() => setActivePanel("dimensions")}
                className="btn-secondary text-sm"
              >
                Enter dimensions
              </button>
            </div>
          )}
        </div>

        {/* Controls hint */}
        <p className="text-xs text-muted-foreground text-center">
          Scroll to zoom · Click + drag to orbit · Click furniture to select
        </p>
      </div>
    </div>
  );
}

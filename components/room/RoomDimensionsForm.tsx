"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Room } from "@/lib/types";
import { RoomType, FLOOR_TYPES } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/useToast";

const schema = z.object({
  width: z.number().min(50, "Min 50cm").max(2000),
  length: z.number().min(50, "Min 50cm").max(2000),
  ceiling_height: z.number().min(150, "Min 150cm").max(600),
  wall_color: z.string(),
  floor_type: z.string(),
  door_wall: z.enum(["north", "south", "east", "west"]),
  door_offset: z.number().min(0),
  door_width: z.number().min(60).max(200),
  door_height: z.number().min(180).max(300),
});

type FormData = z.infer<typeof schema>;

interface Props {
  room: Room | null;
  roomType: RoomType;
  projectId: string;
  onSaved: (room: Room) => void;
}

export function RoomDimensionsForm({ room, roomType, projectId, onSaved }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [windows, setWindows] = useState(room?.window_positions ?? []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: room
      ? {
          width: room.width,
          length: room.length,
          ceiling_height: room.ceiling_height,
          wall_color: room.wall_color,
          floor_type: room.floor_type,
          door_wall: room.door_position?.wall ?? "south",
          door_offset: room.door_position?.offset ?? 100,
          door_width: room.door_position?.width ?? 90,
          door_height: room.door_position?.height ?? 210,
        }
      : {
          width: 400,
          length: 500,
          ceiling_height: 250,
          wall_color: "#F5F0EB",
          floor_type: "hardwood",
          door_wall: "south",
          door_offset: 100,
          door_width: 90,
          door_height: 210,
        },
  });

  async function onSubmit(data: FormData) {
    setIsSaving(true);

    const payload = {
      project_id: projectId,
      type: roomType,
      width: data.width,
      length: data.length,
      ceiling_height: data.ceiling_height,
      wall_color: data.wall_color,
      floor_type: data.floor_type,
      door_position: {
        wall: data.door_wall,
        offset: data.door_offset,
        width: data.door_width,
        height: data.door_height,
      },
      window_positions: windows,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (room?.id) {
      result = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", room.id)
        .select("*, furniture_items(*)")
        .single();
    } else {
      result = await supabase
        .from("rooms")
        .insert(payload)
        .select("*, furniture_items(*)")
        .single();
    }

    if (result.data) {
      onSaved(result.data);
      toast({ title: "Room dimensions saved!" });
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setIsSaving(false);
  }

  function addWindow() {
    setWindows([...windows, { wall: "north", offset: 50, width: 100, height: 120, sill_height: 80 }]);
  }

  function removeWindow(i: number) {
    setWindows(windows.filter((_, idx) => idx !== i));
  }

  function updateWindow(i: number, key: string, value: string | number) {
    setWindows(windows.map((w, idx) => idx === i ? { ...w, [key]: value } : w));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="section-title">Room Dimensions</h3>

      {/* Width / Length */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Width (cm)</label>
          <input {...register("width", { valueAsNumber: true })} type="number" className="input font-mono" />
          {errors.width && <p className="text-xs text-destructive mt-1">{errors.width.message}</p>}
        </div>
        <div>
          <label className="label">Length (cm)</label>
          <input {...register("length", { valueAsNumber: true })} type="number" className="input font-mono" />
          {errors.length && <p className="text-xs text-destructive mt-1">{errors.length.message}</p>}
        </div>
      </div>

      {/* Ceiling height */}
      <div>
        <label className="label">Ceiling Height (cm)</label>
        <input {...register("ceiling_height", { valueAsNumber: true })} type="number" className="input font-mono" />
        {errors.ceiling_height && <p className="text-xs text-destructive mt-1">{errors.ceiling_height.message}</p>}
      </div>

      {/* Wall color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Wall Color</label>
          <div className="flex gap-2">
            <input {...register("wall_color")} type="color" className="w-10 h-10 rounded-input border border-border cursor-pointer" />
            <input {...register("wall_color")} type="text" className="input flex-1 font-mono text-xs" />
          </div>
        </div>
        <div>
          <label className="label">Floor Type</label>
          <select {...register("floor_type")} className="input">
            {FLOOR_TYPES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Door */}
      <div className="border-t border-border/60 pt-4">
        <h4 className="text-sm font-semibold text-primary mb-3">Door</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Wall</label>
            <select {...register("door_wall")} className="input">
              {["north", "south", "east", "west"].map((w) => (
                <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Offset from left (cm)</label>
            <input {...register("door_offset", { valueAsNumber: true })} type="number" className="input font-mono" />
          </div>
          <div>
            <label className="label">Door Width (cm)</label>
            <input {...register("door_width", { valueAsNumber: true })} type="number" className="input font-mono" />
          </div>
          <div>
            <label className="label">Door Height (cm)</label>
            <input {...register("door_height", { valueAsNumber: true })} type="number" className="input font-mono" />
          </div>
        </div>
      </div>

      {/* Windows */}
      <div className="border-t border-border/60 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-primary">Windows</h4>
          <button type="button" onClick={addWindow} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add window
          </button>
        </div>
        {windows.map((win, i) => (
          <div key={i} className="bg-muted rounded-xl p-3 mb-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="label">Wall</label>
              <select
                value={win.wall}
                onChange={(e) => updateWindow(i, "wall", e.target.value)}
                className="input text-xs"
              >
                {["north", "south", "east", "west"].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Offset (cm)</label>
              <input
                type="number"
                value={win.offset}
                onChange={(e) => updateWindow(i, "offset", Number(e.target.value))}
                className="input font-mono text-xs"
              />
            </div>
            <div>
              <label className="label">Width (cm)</label>
              <input
                type="number"
                value={win.width}
                onChange={(e) => updateWindow(i, "width", Number(e.target.value))}
                className="input font-mono text-xs"
              />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input
                type="number"
                value={win.height}
                onChange={(e) => updateWindow(i, "height", Number(e.target.value))}
                className="input font-mono text-xs"
              />
            </div>
            <div>
              <label className="label">Sill Height (cm)</label>
              <input
                type="number"
                value={win.sill_height}
                onChange={(e) => updateWindow(i, "sill_height", Number(e.target.value))}
                className="input font-mono text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeWindow(i)}
                className="btn-secondary text-xs px-2 py-1.5 flex items-center gap-1 text-destructive"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="submit" disabled={isSaving} className="btn-primary w-full flex items-center justify-center gap-2">
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {room ? "Update room" : "Create room"}
      </button>
    </form>
  );
}

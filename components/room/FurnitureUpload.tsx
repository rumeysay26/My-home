"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { FurnitureItem } from "@/lib/types";
import { RoomType, FURNITURE_CATEGORIES, MATERIALS } from "@/lib/utils";
import { Upload, Image, Loader2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/useToast";

const schema = z.object({
  name: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  width_cm: z.number().min(1).max(2000),
  height_cm: z.number().min(1).max(2000),
  depth_cm: z.number().min(1).max(2000),
  color: z.string().optional(),
  material: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  roomId: string | undefined;
  roomType: RoomType;
  onAdded: (item: FurnitureItem) => void;
}

export function FurnitureUpload({ roomId, roomType, onAdded }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      width_cm: 80,
      height_cm: 80,
      depth_cm: 80,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function onSubmit(data: FormData) {
    if (!roomId) {
      toast({ title: "Please save room dimensions first", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      let imageUrl: string | null = null;

      // Upload image to Supabase Storage
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${session.user.id}/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("furniture-images")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("furniture-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      // Insert furniture item
      const { data: item, error } = await supabase
        .from("furniture_items")
        .insert({
          room_id: roomId,
          user_id: session.user.id,
          name: data.name,
          category: data.category,
          image_url: imageUrl,
          width_cm: data.width_cm,
          height_cm: data.height_cm,
          depth_cm: data.depth_cm,
          color: data.color || null,
          material: data.material || null,
          notes: data.notes || null,
          position_x: 0,
          position_y: 0,
          position_z: 0,
          rotation_y: 0,
        })
        .select()
        .single();

      if (error) throw error;

      onAdded(item as FurnitureItem);
      reset();
      setImageFile(null);
      setImagePreview(null);
      toast({ title: "Furniture added to room!" });

      // Optionally trigger background removal
      if (imageUrl) {
        fetch(`/api/furniture/${item.id}/process`, { method: "POST" }).catch(() => {});
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast({ title: message, variant: "destructive" });
    }
    setIsUploading(false);
  }

  return (
    <div className="space-y-5">
      <h3 className="section-title">Upload Furniture</h3>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50 hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 mx-auto rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 mx-auto mb-2 text-accent/60" />
            <p className="text-sm font-medium text-primary">
              Drop a furniture image here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="label">Furniture Name</label>
          <input {...register("name")} placeholder="e.g. IKEA Ektorp Sofa" className="input" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select {...register("category")} className="input">
            <option value="">Select category...</option>
            {FURNITURE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
        </div>

        {/* Dimensions */}
        <div>
          <label className="label">Dimensions (cm)</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                {...register("width_cm", { valueAsNumber: true })}
                type="number"
                placeholder="Width"
                className="input font-mono text-center"
              />
              <p className="text-[10px] text-center text-muted-foreground mt-1">Width</p>
            </div>
            <div>
              <input
                {...register("height_cm", { valueAsNumber: true })}
                type="number"
                placeholder="Height"
                className="input font-mono text-center"
              />
              <p className="text-[10px] text-center text-muted-foreground mt-1">Height</p>
            </div>
            <div>
              <input
                {...register("depth_cm", { valueAsNumber: true })}
                type="number"
                placeholder="Depth"
                className="input font-mono text-center"
              />
              <p className="text-[10px] text-center text-muted-foreground mt-1">Depth</p>
            </div>
          </div>
        </div>

        {/* Color + Material */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Color (optional)</label>
            <input {...register("color")} placeholder="e.g. Beige" className="input" />
          </div>
          <div>
            <label className="label">Material (optional)</label>
            <select {...register("material")} className="input">
              <option value="">None</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            {...register("notes")}
            placeholder="Any extra notes..."
            rows={2}
            className="input resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="btn-accent w-full flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Add to room
        </button>
      </form>
    </div>
  );
}

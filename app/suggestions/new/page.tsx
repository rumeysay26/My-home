"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { FURNITURE_CATEGORIES, ROOM_TYPES, MATERIALS } from "@/lib/utils";
import { Upload, X, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/useToast";

const schema = z.object({
  furniture_name: z.string().min(2, "Required"),
  category: z.string().min(1, "Required"),
  room_type: z.enum(["kitchen", "living_room", "bedroom", "any"]),
  buy_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.number().min(0).optional(),
  width_cm: z.number().min(1).optional(),
  height_cm: z.number().min(1).optional(),
  depth_cm: z.number().min(1).optional(),
  comment: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewSuggestionPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { room_type: "any" },
  });

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function onSubmit(data: FormData) {
    if (!imageFile && !imagePreview) {
      toast({ title: "Please upload a furniture image", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      let imageUrl = imagePreview || "";

      // Upload image
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${session.user.id}/${uuidv4()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("suggestion-images")
          .upload(path, imageFile);

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("suggestion-images")
            .getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("suggestions").insert({
        user_id: session.user.id,
        furniture_name: data.furniture_name,
        category: data.category,
        room_type: data.room_type,
        image_url: imageUrl,
        buy_link: data.buy_link || null,
        price: data.price || null,
        width_cm: data.width_cm || null,
        height_cm: data.height_cm || null,
        depth_cm: data.depth_cm || null,
        comment: data.comment || null,
        likes_count: 0,
      });

      if (error) throw error;

      toast({ title: "Suggestion shared!" });
      router.push("/suggestions");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      toast({ title: msg, variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/suggestions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to suggestions
        </Link>

        <h1 className="page-title mb-2">Share a furniture suggestion</h1>
        <p className="text-muted-foreground mb-8">Help the community discover great furniture pieces.</p>

        <div className="card p-6">
          {/* Image upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-6 transition-all ${
              isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 mx-auto mb-2 text-accent/50" />
                <p className="text-sm font-medium text-primary">Upload furniture image</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Furniture name</label>
                <input {...register("furniture_name")} placeholder="e.g. IKEA EKTORP" className="input" />
                {errors.furniture_name && <p className="text-xs text-destructive mt-1">{errors.furniture_name.message}</p>}
              </div>
              <div>
                <label className="label">Category</label>
                <select {...register("category")} className="input">
                  <option value="">Select...</option>
                  {FURNITURE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Suggested room</label>
                <select {...register("room_type")} className="input">
                  <option value="any">Any room</option>
                  {ROOM_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Price (optional)</label>
                <input {...register("price", { valueAsNumber: true })} type="number" placeholder="e.g. 599" className="input" />
              </div>
            </div>

            <div>
              <label className="label">Buy link (optional)</label>
              <input {...register("buy_link")} type="url" placeholder="https://..." className="input" />
              {errors.buy_link && <p className="text-xs text-destructive mt-1">{errors.buy_link.message}</p>}
            </div>

            <div>
              <label className="label">Dimensions (cm, optional)</label>
              <div className="grid grid-cols-3 gap-2">
                <input {...register("width_cm", { valueAsNumber: true })} type="number" placeholder="Width" className="input font-mono text-center" />
                <input {...register("height_cm", { valueAsNumber: true })} type="number" placeholder="Height" className="input font-mono text-center" />
                <input {...register("depth_cm", { valueAsNumber: true })} type="number" placeholder="Depth" className="input font-mono text-center" />
              </div>
            </div>

            <div>
              <label className="label">Comment (optional)</label>
              <textarea {...register("comment")} rows={3} placeholder="Why do you recommend this? Tips for styling?" className="input resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-accent w-full flex items-center justify-center gap-2 py-3">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Share suggestion
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

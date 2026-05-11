"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { X, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/useToast";

const schema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({ onClose, onCreated }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast({ title: "Not logged in", variant: "destructive" }); return; }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: session.user.id,
        name: data.name,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Failed to create project", variant: "destructive" });
    } else {
      onCreated(project as Project);
    }
    setIsLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 shadow-modal animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">New project</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Project name</label>
            <input
              {...register("name")}
              placeholder="My Home Renovation"
              className="input"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              {...register("description")}
              placeholder="Describe your project..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-accent flex-1 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

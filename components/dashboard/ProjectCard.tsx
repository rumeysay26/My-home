"use client";

import Link from "next/link";
import { Project } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Trash2, ArrowRight, Box } from "lucide-react";
import { toast } from "@/components/ui/useToast";

interface Props {
  project: Project;
  onDeleted: () => void;
}

export function ProjectCard({ project, onDeleted }: Props) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast({ title: "Failed to delete project", variant: "destructive" });
    } else {
      onDeleted();
      toast({ title: "Project deleted" });
    }
  }

  return (
    <Link href={`/projects/${project.id}`} className="group card block hover:shadow-card-hover transition-all duration-200">
      {/* Cover */}
      <div className="aspect-[4/3] bg-gradient-to-br from-accent/15 to-muted rounded-t-card overflow-hidden flex items-center justify-center">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Box className="w-10 h-10 text-accent/30" />
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-primary group-hover:text-accent-dark transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {project.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-2">
              {formatDate(project.updated_at)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4 text-destructive/60" />
            </button>
            <div className="p-1.5 text-muted-foreground group-hover:text-accent-dark transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

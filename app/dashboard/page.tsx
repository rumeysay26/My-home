"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { Plus, Loader2, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    await loadProjects();
  }

  async function loadProjects() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) setProjects(data);
    setIsLoading(false);
  }

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowCreateModal(false);
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-accent-dark" />
            <h1 className="page-title">My Projects</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-accent inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New project
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-accent-dark" />
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">
              No projects yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to start designing your home.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-accent"
            >
              Create project
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDeleted={() =>
                  setProjects((p) => p.filter((x) => x.id !== project.id))
                }
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

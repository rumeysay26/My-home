"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Project, Room } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { RoomTabs } from "@/components/room/RoomTabs";
import { RoomEditor } from "@/components/room/RoomEditor";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ROOM_TYPES, type RoomType } from "@/lib/utils";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Record<RoomType, Room | null>>({
    kitchen: null,
    living_room: null,
    bedroom: null,
  });
  const [activeTab, setActiveTab] = useState<RoomType>("living_room");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    setIsLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { router.push("/login"); return; }

    const { data: proj } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!proj) { router.push("/dashboard"); return; }
    setProject(proj);

    const { data: roomData } = await supabase
      .from("rooms")
      .select("*, furniture_items(*)")
      .eq("project_id", projectId);

    if (roomData) {
      const map: Record<RoomType, Room | null> = {
        kitchen: null,
        living_room: null,
        bedroom: null,
      };
      roomData.forEach((r: Room) => {
        map[r.type as RoomType] = r;
      });
      setRooms(map);
    }
    setIsLoading(false);
  }

  async function handleRoomSaved(room: Room) {
    setRooms((prev) => ({ ...prev, [room.type]: room }));
  }

  async function ensureRoomExists(type: RoomType) {
    if (rooms[type]) return rooms[type];

    const { data, error } = await supabase
      .from("rooms")
      .insert({ project_id: projectId, type })
      .select("*, furniture_items(*)")
      .single();

    if (data) {
      setRooms((prev) => ({ ...prev, [type]: data }));
      return data;
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-primary flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">{project?.name}</span>
        </div>

        <h1 className="page-title mb-6">{project?.name}</h1>

        {/* Room tabs */}
        <RoomTabs activeTab={activeTab} onTabChange={(t) => {
          setActiveTab(t);
          ensureRoomExists(t);
        }} />

        {/* Room editor */}
        <div className="mt-6">
          <RoomEditor
            key={activeTab}
            room={rooms[activeTab]}
            roomType={activeTab}
            projectId={projectId}
            onSaved={handleRoomSaved}
          />
        </div>
      </main>
    </div>
  );
}

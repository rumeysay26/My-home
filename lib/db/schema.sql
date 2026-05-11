-- HomeDesign Platform — Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ROOMS
-- ============================================================
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kitchen', 'living_room', 'bedroom')),
  width NUMERIC NOT NULL DEFAULT 400,
  length NUMERIC NOT NULL DEFAULT 500,
  ceiling_height NUMERIC NOT NULL DEFAULT 250,
  door_position JSONB NOT NULL DEFAULT '{"wall":"south","offset":100,"width":90,"height":210}',
  window_positions JSONB NOT NULL DEFAULT '[]',
  wall_color TEXT NOT NULL DEFAULT '#F5F0EB',
  floor_type TEXT NOT NULL DEFAULT 'hardwood',
  design_state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access rooms of own projects"
  ON public.rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = rooms.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- FURNITURE ITEMS
-- ============================================================
CREATE TABLE public.furniture_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  processed_image_url TEXT,
  width_cm NUMERIC NOT NULL,
  height_cm NUMERIC NOT NULL,
  depth_cm NUMERIC NOT NULL,
  color TEXT,
  material TEXT,
  notes TEXT,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  position_z NUMERIC NOT NULL DEFAULT 0,
  rotation_y NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.furniture_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access furniture in own rooms"
  ON public.furniture_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = furniture_items.room_id
        AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- SUGGESTIONS
-- ============================================================
CREATE TABLE public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL CHECK (room_type IN ('kitchen', 'living_room', 'bedroom', 'any')),
  furniture_name TEXT NOT NULL,
  category TEXT,
  image_url TEXT NOT NULL,
  buy_link TEXT,
  price NUMERIC,
  width_cm NUMERIC,
  height_cm NUMERIC,
  depth_cm NUMERIC,
  comment TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suggestions are publicly viewable"
  ON public.suggestions FOR SELECT USING (true);

CREATE POLICY "Logged-in users can create suggestions"
  ON public.suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions"
  ON public.suggestions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SUGGESTION LIKES
-- ============================================================
CREATE TABLE public.suggestion_likes (
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (suggestion_id, user_id)
);

ALTER TABLE public.suggestion_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are publicly viewable"
  ON public.suggestion_likes FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes"
  ON public.suggestion_likes FOR ALL USING (auth.uid() = user_id);

-- Keep likes_count in sync
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.suggestions SET likes_count = likes_count + 1 WHERE id = NEW.suggestion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.suggestions SET likes_count = likes_count - 1 WHERE id = OLD.suggestion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.suggestion_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ============================================================
-- SUGGESTION COMMENTS
-- ============================================================
CREATE TABLE public.suggestion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.suggestion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly viewable"
  ON public.suggestion_comments FOR SELECT USING (true);

CREATE POLICY "Users can create and delete own comments"
  ON public.suggestion_comments FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SAVED SUGGESTIONS
-- ============================================================
CREATE TABLE public.saved_suggestions (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, suggestion_id)
);

ALTER TABLE public.saved_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved suggestions"
  ON public.saved_suggestions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or via API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('furniture-images', 'furniture-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('suggestion-images', 'suggestion-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-covers', 'project-covers', true);

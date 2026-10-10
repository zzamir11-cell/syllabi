-- Migration: 20261004000000_production_schema.sql
-- Production DDL for Syllabi

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Qualifications
CREATE TABLE IF NOT EXISTS qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Boards
CREATE TABLE IF NOT EXISTS exam_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Sciences',
    icon_name TEXT,
    accent_color TEXT DEFAULT '#2563eb',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    qualification_id UUID REFERENCES qualifications(id) ON DELETE CASCADE,
    exam_board_id UUID REFERENCES exam_boards(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    qualification TEXT DEFAULT 'GCSE',
    exam_board TEXT DEFAULT 'AQA',
    target_grades TEXT,
    subjects TEXT[] DEFAULT '{"Chemistry", "Biology"}',
    is_public BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    allow_indexing BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
    resources_count INT DEFAULT 0,
    total_views INT DEFAULT 0,
    total_saves INT DEFAULT 0,
    reputation_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    qualification_id UUID NOT NULL REFERENCES qualifications(id) ON DELETE RESTRICT,
    exam_board_id UUID NOT NULL REFERENCES exam_boards(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    page_count INT DEFAULT 1,
    preview_url TEXT,
    storage_path TEXT,
    tags TEXT[] DEFAULT '{}',
    views_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    rating_avg NUMERIC(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    quality_helpful NUMERIC(3,2) DEFAULT 5.00,
    quality_clarity NUMERIC(3,2) DEFAULT 5.00,
    quality_exam_focus NUMERIC(3,2) DEFAULT 5.00,
    quality_organization NUMERIC(3,2) DEFAULT 5.00,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'under_review', 'removed')),
    is_featured BOOLEAN DEFAULT false,
    copyright_confirmed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Files
CREATE TABLE IF NOT EXISTS resource_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    page_number INT DEFAULT 1,
    is_thumbnail BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saves
CREATE TABLE IF NOT EXISTS resource_saves (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, resource_id)
);

-- Downloads & Views
CREATE TABLE IF NOT EXISTS resource_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    helpful_score INT CHECK (helpful_score BETWEEN 1 AND 5),
    clarity_score INT CHECK (clarity_score BETWEEN 1 AND 5),
    exam_focus_score INT CHECK (exam_focus_score BETWEEN 1 AND 5),
    organization_score INT CHECK (organization_score BETWEEN 1 AND 5),
    overall_score NUMERIC(3,2) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, resource_id)
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'requested')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Requests
CREATE TABLE IF NOT EXISTS resource_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    qualification_id UUID REFERENCES qualifications(id) ON DELETE SET NULL,
    exam_board_id UUID REFERENCES exam_boards(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    resource_type TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'fulfilled')),
    fulfilled_resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports & Moderation
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('resource', 'profile', 'request')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read qualifications" ON qualifications FOR SELECT USING (true);
CREATE POLICY "Public read exam_boards" ON exam_boards FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Published resources are viewable by everyone" ON resources
    FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own resources" ON resources
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own resources" ON resources
    FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "Resource files viewable with resource" ON resource_files
    FOR SELECT USING (true);

CREATE POLICY "Creators can insert resource files" ON resource_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM resources
            WHERE resources.id = resource_files.resource_id
            AND resources.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their saves" ON resource_saves
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their saves" ON resource_saves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saves" ON resource_saves
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Ratings are viewable by everyone" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings" ON ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by everyone" ON collections
    FOR SELECT USING (visibility IN ('public', 'unlisted') OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own collections" ON collections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Collection items follow collection visibility" ON collection_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND (collections.visibility IN ('public', 'unlisted') OR collections.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their collection items" ON collection_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow/unfollow" ON follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Requests viewable by all" ON resource_requests FOR SELECT USING (true);
CREATE POLICY "Users can create requests" ON resource_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
-- FULFILLED REQUESTS IMMUTABLE: Can only update if status is 'open'
CREATE POLICY "Users can update own open requests" ON resource_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'open');

CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Moderators can view reports" ON reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'admin')
    )
);

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  clean_username TEXT;
  extracted_avatar TEXT;
  extracted_fullname TEXT;
BEGIN
  clean_username := COALESCE(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'preferred_username',
    SPLIT_PART(new.email, '@', 1)
  );
  clean_username := LOWER(REGEXP_REPLACE(clean_username, '[^a-zA-Z0-9_]', '', 'g'));
  IF LENGTH(clean_username) < 3 THEN
    clean_username := clean_username || '_' || SUBSTRING(new.id::text, 1, 4);
  END IF;

  extracted_avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    NULL
  );

  extracted_fullname := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    clean_username
  );

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    qualification,
    exam_board,
    subjects,
    is_public,
    role
  )
  VALUES (
    new.id,
    clean_username,
    extracted_fullname,
    extracted_avatar,
    COALESCE(new.raw_user_meta_data->>'qualification', 'GCSE'),
    COALESCE(new.raw_user_meta_data->>'exam_board', 'AQA'),
    COALESCE(
      ARRAY(SELECT json_array_elements_text(new.raw_user_meta_data->'subjects')),
      ARRAY['Chemistry', 'Biology', 'Physics']
    ),
    true,
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('resources', 'resources', true),
  ('previews', 'previews', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated user avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Public preview access" ON storage.objects
  FOR SELECT USING (bucket_id = 'previews');

CREATE POLICY "Authenticated user preview upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'previews' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Public resource access" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Authenticated user resource upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resources' AND auth.role() = 'authenticated'
  );

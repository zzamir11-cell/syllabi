import { createClient } from './client';
import { Resource, UserProfile, ResourceRequest, Collection, RatingReview } from '../types';
import { INITIAL_RESOURCES, INITIAL_CREATORS, INITIAL_REQUESTS, INITIAL_COLLECTIONS } from '../data';

// Helper to check if Supabase is genuinely configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
}

// -----------------------------------------------------------------------------
// RESOURCES
// -----------------------------------------------------------------------------

export async function fetchResourcesFromSupabase(options?: {
  qualification?: string;
  examBoard?: string;
  subject?: string;
  query?: string;
  sort?: string;
}): Promise<Resource[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_RESOURCES;
  }

  try {
    const supabase = createClient();
    let q = supabase
      .from('resources')
      .select(`
        *,
        creator:profiles(username, reputation_title),
        qualification:qualifications(name, slug),
        exam_board:exam_boards(name, code, slug),
        subject:subjects(name, slug),
        topic:topics(name, slug)
      `)
      .eq('status', 'published');

    if (options?.qualification && options.qualification !== 'all') {
      q = q.eq('qualifications.slug', options.qualification.toLowerCase());
    }

    if (options?.query && options.query.trim()) {
      q = q.ilike('title', `%${options.query.trim()}%`);
    }

    if (options?.sort === 'newest') {
      q = q.order('created_at', { ascending: false });
    } else if (options?.sort === 'rating') {
      q = q.order('rating_avg', { ascending: false });
    } else if (options?.sort === 'downloads') {
      q = q.order('downloads_count', { ascending: false });
    } else {
      q = q.order('saves_count', { ascending: false });
    }

    const { data, error } = await q;

    if (error || !data || data.length === 0) {
      return INITIAL_RESOURCES;
    }

    return data.map((item: any) => ({
      id: item.id,
      creatorId: item.creator_id,
      creatorUsername: item.creator?.username || 'anonymous',
      creatorReputation: item.creator?.reputation_title,
      title: item.title,
      slug: item.slug,
      description: item.description,
      qualificationId: item.qualification_id,
      qualificationName: item.qualification?.name || 'GCSE',
      examBoardId: item.exam_board_id,
      examBoardName: item.exam_board?.name || item.exam_board?.code || 'AQA',
      subjectId: item.subject_id,
      subjectName: item.subject?.name || 'Academic',
      topicId: item.topic_id,
      topicName: item.topic?.name,
      resourceType: item.resource_type,
      fileUrl: item.file_url,
      fileName: item.file_name,
      fileSize: item.file_size,
      fileType: item.file_type,
      pageCount: item.page_count || 1,
      previewUrl: item.preview_url,
      tags: item.tags || [],
      viewsCount: item.views_count || 0,
      downloadsCount: item.downloads_count || 0,
      savesCount: item.saves_count || 0,
      ratingAvg: Number(item.rating_avg) || 0,
      ratingCount: item.rating_count || 0,
      qualityBreakdown: {
        helpful: Number(item.quality_helpful) || 5,
        clarity: Number(item.quality_clarity) || 5,
        examFocus: Number(item.quality_exam_focus) || 5,
        organization: Number(item.quality_organization) || 5,
      },
      status: item.status,
      copyrightConfirmed: item.copyright_confirmed,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch {
    return INITIAL_RESOURCES;
  }
}

export async function uploadResourceFileToStorage(file: File, userId: string): Promise<{ fileUrl: string; filePath: string }> {
  if (!isSupabaseConfigured()) {
    return {
      fileUrl: URL.createObjectURL(file),
      filePath: `local/${file.name}`,
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'pdf';
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('resources')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
  return { fileUrl: data.publicUrl, filePath };
}

export async function uploadPreviewImageToStorage(file: File, userId: string): Promise<{ previewUrl: string; filePath: string }> {
  if (!isSupabaseConfigured()) {
    return {
      previewUrl: URL.createObjectURL(file),
      filePath: `local/${file.name}`,
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${userId}/covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('previews')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('previews').getPublicUrl(filePath);
  return { previewUrl: data.publicUrl, filePath };
}

export async function uploadPreviewThumbnailToStorage(blob: Blob, resourceId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(blob);
  }

  const supabase = createClient();
  const filePath = `previews/${resourceId}-${Date.now()}.png`;

  const { error } = await supabase.storage
    .from('previews')
    .upload(filePath, blob, { contentType: 'image/png', upsert: true });

  if (error) {
    return '';
  }

  const { data } = supabase.storage.from('previews').getPublicUrl(filePath);
  return data.publicUrl;
}

// -----------------------------------------------------------------------------
// PROFILES & AVATARS
// -----------------------------------------------------------------------------

export async function fetchProfileFromSupabase(username: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    return INITIAL_CREATORS.find(c => c.username.toLowerCase() === username.toLowerCase()) || null;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username)
      .single();

    if (error || !data) {
      return INITIAL_CREATORS.find(c => c.username.toLowerCase() === username.toLowerCase()) || null;
    }

    return {
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      bio: data.bio || '',
      avatarUrl: data.avatar_url,
      qualification: data.qualification || 'GCSE',
      examBoard: data.exam_board || 'AQA',
      targetGrades: data.target_grades,
      subjects: data.subjects || ['Chemistry', 'Biology'],
      isPublic: data.is_public ?? true,
      showActivity: data.show_activity ?? true,
      allowIndexing: data.allow_indexing ?? true,
      role: data.role || 'student',
      resourcesCount: data.resources_count || 0,
      totalViews: data.total_views || 0,
      totalSaves: data.total_saves || 0,
      reputationTitle: data.reputation_title,
      createdAt: data.created_at,
    };
  } catch {
    return INITIAL_CREATORS.find(c => c.username.toLowerCase() === username.toLowerCase()) || null;
  }
}

export async function uploadAvatarToStorage(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(file);
  }

  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const avatarUrl = data.publicUrl;

  // Persist to user profile
  await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return avatarUrl;
}

// -----------------------------------------------------------------------------
// REQUESTS
// -----------------------------------------------------------------------------

export async function fetchRequestsFromSupabase(): Promise<ResourceRequest[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_REQUESTS;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('resource_requests')
      .select(`
        *,
        user:profiles(username),
        qualification:qualifications(name),
        exam_board:exam_boards(name),
        subject:subjects(name),
        topic:topics(name),
        fulfilling_resource:resources(title, slug)
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_REQUESTS;
    }

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      username: item.user?.username || 'student',
      title: item.title,
      description: item.description,
      qualificationName: item.qualification?.name || 'GCSE',
      examBoardName: item.exam_board?.name || 'AQA',
      subjectName: item.subject?.name || 'General',
      topicName: item.topic?.name,
      status: item.status,
      fulfilledResourceId: item.fulfilled_resource_id,
      fulfilledResourceTitle: item.fulfilling_resource?.title,
      createdAt: item.created_at,
    }));
  } catch {
    return INITIAL_REQUESTS;
  }
}

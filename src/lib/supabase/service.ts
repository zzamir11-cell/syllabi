import { createClient } from './client';
import { Resource, UserProfile, ResourceRequest } from '../types';
import { INITIAL_RESOURCES, INITIAL_CREATORS, INITIAL_REQUESTS } from '../data';

// Cache & In-Flight Request Deduplication
const CACHE_TTL_MS = 60_000; // 60 seconds TTL for public queries

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const resourcesCache = new Map<string, CacheEntry<Resource[]>>();
const profileCache = new Map<string, CacheEntry<UserProfile | null>>();
let requestsCache: CacheEntry<ResourceRequest[]> | null = null;

const inFlightResources = new Map<string, Promise<Resource[]>>();
const inFlightProfiles = new Map<string, Promise<UserProfile | null>>();
let inFlightRequests: Promise<ResourceRequest[]> | null = null;

export function invalidateResourcesCache(): void {
  resourcesCache.clear();
}

export function invalidateProfileCache(username?: string): void {
  if (username) {
    profileCache.delete(username.toLowerCase());
  } else {
    profileCache.clear();
  }
}

export function invalidateRequestsCache(): void {
  requestsCache = null;
}

// Helper to check if Supabase is genuinely configured
let cachedConfigCheck: boolean | null = null;
export function isSupabaseConfigured(): boolean {
  if (cachedConfigCheck !== null) return cachedConfigCheck;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cachedConfigCheck = Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
  return cachedConfigCheck;
}

// Explicit column selection for resources (avoids select('*') and internal storage_path)
const RESOURCE_SELECT_COLUMNS = `
  id,
  creator_id,
  title,
  slug,
  description,
  qualification_id,
  exam_board_id,
  subject_id,
  topic_id,
  resource_type,
  file_url,
  file_name,
  file_size,
  file_type,
  page_count,
  preview_url,
  tags,
  views_count,
  downloads_count,
  saves_count,
  rating_avg,
  rating_count,
  quality_helpful,
  quality_clarity,
  quality_exam_focus,
  quality_organization,
  status,
  is_featured,
  copyright_confirmed,
  created_at,
  updated_at,
  creator:profiles(username, reputation_title),
  qualification:qualifications(name, slug),
  exam_board:exam_boards(name, code, slug),
  subject:subjects(name, slug),
  topic:topics(name, slug)
`;

const PROFILE_SELECT_COLUMNS = `
  id,
  username,
  full_name,
  bio,
  avatar_url,
  qualification,
  exam_board,
  target_grades,
  subjects,
  is_public,
  show_activity,
  allow_indexing,
  role,
  resources_count,
  total_views,
  total_saves,
  reputation_title,
  created_at
`;

const REQUEST_SELECT_COLUMNS = `
  id,
  user_id,
  title,
  description,
  status,
  fulfilled_resource_id,
  created_at,
  user:profiles(username),
  qualification:qualifications(name),
  exam_board:exam_boards(name),
  subject:subjects(name),
  topic:topics(name),
  fulfilling_resource:resources(title, slug)
`;

// -----------------------------------------------------------------------------
// RESOURCES
// -----------------------------------------------------------------------------

export interface FetchResourcesOptions {
  qualification?: string;
  examBoard?: string;
  subject?: string;
  resourceType?: string;
  query?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  skipCache?: boolean;
}

export async function fetchResourcesFromSupabase(options?: FetchResourcesOptions): Promise<Resource[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_RESOURCES;
  }

  const limit = options?.limit ?? 60;
  const offset = options?.offset ?? 0;
  const cacheKey = JSON.stringify({
    q: options?.qualification || 'all',
    b: options?.examBoard || 'all',
    s: options?.subject || 'all',
    t: options?.resourceType || 'all',
    search: options?.query?.trim() || '',
    sort: options?.sort || 'saves',
    limit,
    offset,
  });

  if (!options?.skipCache) {
    const cached = resourcesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  const existingInFlight = inFlightResources.get(cacheKey);
  if (existingInFlight) {
    return existingInFlight;
  }

  const requestPromise = (async (): Promise<Resource[]> => {
    try {
      const supabase = createClient();
      let q = supabase
        .from('resources')
        .select(RESOURCE_SELECT_COLUMNS)
        .eq('status', 'published');

      if (options?.resourceType && options.resourceType !== 'all') {
        q = q.eq('resource_type', options.resourceType);
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

      q = q.range(offset, offset + limit - 1);

      const { data, error } = await q;

      if (error || !data || data.length === 0) {
        resourcesCache.set(cacheKey, { data: [], expiresAt: Date.now() + CACHE_TTL_MS });
        return [];
      }

      const mapped: Resource[] = data.map((item: any) => ({
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
        isFeatured: item.is_featured || false,
        copyrightConfirmed: item.copyright_confirmed,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      resourcesCache.set(cacheKey, { data: mapped, expiresAt: Date.now() + CACHE_TTL_MS });
      return mapped;
    } catch {
      return INITIAL_RESOURCES;
    } finally {
      inFlightResources.delete(cacheKey);
    }
  })();

  inFlightResources.set(cacheKey, requestPromise);
  return requestPromise;
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
    .upload(filePath, file, { cacheControl: '31536000', upsert: false });

  if (error) {
    throw error;
  }

  invalidateResourcesCache();
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
    .upload(filePath, file, { cacheControl: '31536000', upsert: false });

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
    .upload(filePath, blob, { contentType: 'image/png', cacheControl: '31536000', upsert: true });

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
  const key = username.trim().toLowerCase();
  if (!isSupabaseConfigured()) {
    return INITIAL_CREATORS.find(c => c.username.toLowerCase() === key) || null;
  }

  const cached = profileCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const existingInFlight = inFlightProfiles.get(key);
  if (existingInFlight) {
    return existingInFlight;
  }

  const requestPromise = (async (): Promise<UserProfile | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT_COLUMNS)
        .ilike('username', key)
        .maybeSingle();

      if (error || !data) {
        const fallback = INITIAL_CREATORS.find(c => c.username.toLowerCase() === key) || null;
        profileCache.set(key, { data: fallback, expiresAt: Date.now() + CACHE_TTL_MS });
        return fallback;
      }

      const profile: UserProfile = {
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

      profileCache.set(key, { data: profile, expiresAt: Date.now() + CACHE_TTL_MS });
      return profile;
    } catch {
      return INITIAL_CREATORS.find(c => c.username.toLowerCase() === key) || null;
    } finally {
      inFlightProfiles.delete(key);
    }
  })();

  inFlightProfiles.set(key, requestPromise);
  return requestPromise;
}

/**
 * Resize and compress avatar images client-side to max 256x256 WebP
 * to avoid uploading multi-megabyte full-resolution photos for small avatars.
 */
async function optimizeAvatarFile(file: File): Promise<{ blob: Blob; ext: string; contentType: string }> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return { blob: file, ext: file.name.split('.').pop() || 'jpg', contentType: file.type || 'image/jpeg' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 256;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ blob: file, ext: file.name.split('.').pop() || 'jpg', contentType: file.type });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve({ blob, ext: 'webp', contentType: 'image/webp' });
          } else {
            resolve({ blob: file, ext: file.name.split('.').pop() || 'jpg', contentType: file.type });
          }
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, ext: file.name.split('.').pop() || 'jpg', contentType: file.type });
    };

    img.src = objectUrl;
  });
}

export async function uploadAvatarToStorage(file: File, userId: string): Promise<string> {
  const { blob, ext, contentType } = await optimizeAvatarFile(file);

  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(blob);
  }

  const supabase = createClient();
  const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, blob, { contentType, cacheControl: '31536000', upsert: true });

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

  invalidateProfileCache();
  return avatarUrl;
}

// -----------------------------------------------------------------------------
// REQUESTS
// -----------------------------------------------------------------------------

export async function fetchRequestsFromSupabase(limit = 50, skipCache = false): Promise<ResourceRequest[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_REQUESTS;
  }

  if (!skipCache && requestsCache && requestsCache.expiresAt > Date.now()) {
    return requestsCache.data;
  }

  if (inFlightRequests) {
    return inFlightRequests;
  }

  inFlightRequests = (async (): Promise<ResourceRequest[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('resource_requests')
        .select(REQUEST_SELECT_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        requestsCache = { data: [], expiresAt: Date.now() + CACHE_TTL_MS };
        return [];
      }

      const mapped: ResourceRequest[] = data.map((item: any) => ({
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

      requestsCache = { data: mapped, expiresAt: Date.now() + CACHE_TTL_MS };
      return mapped;
    } catch {
      return INITIAL_REQUESTS;
    } finally {
      inFlightRequests = null;
    }
  })();

  return inFlightRequests;
}

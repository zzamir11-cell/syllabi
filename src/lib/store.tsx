'use client';

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from 'react';

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import {
  Resource,
  UserProfile,
  Collection,
  ResourceRequest,
  Report,
  RatingReview,
  ResourceType,
} from './types';
import {
  INITIAL_RESOURCES,
  INITIAL_CREATORS,
  INITIAL_COLLECTIONS,
  INITIAL_REQUESTS,
  INITIAL_REPORTS,
} from './data';
import { createClient } from './supabase/client';
import { isSupabaseConfigured, uploadAvatarToStorage } from './supabase/service';

interface SyllabiContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isSupabaseConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  uploadUserAvatar: (file: File) => Promise<string | null>;
  resources: Resource[];
  savedResourceIds: string[];
  toggleSaveResource: (resourceId: string) => boolean;
  isResourceSaved: (resourceId: string) => boolean;
  recordView: (resourceId: string) => void;
  recordDownload: (resourceId: string) => boolean;
  addResource: (newResource: Omit<Resource, 'id' | 'viewsCount' | 'downloadsCount' | 'savesCount' | 'ratingAvg' | 'ratingCount' | 'qualityBreakdown' | 'createdAt' | 'updatedAt'>) => Resource;
  addRating: (rating: Omit<RatingReview, 'id' | 'createdAt'>) => void;
  collections: Collection[];
  createCollection: (title: string, description: string, visibility: 'public' | 'private' | 'unlisted', initialResourceIds?: string[]) => Collection;
  addResourceToCollection: (collectionId: string, resourceId: string) => void;
  requests: ResourceRequest[];
  createRequest: (req: Omit<ResourceRequest, 'id' | 'userId' | 'username' | 'status' | 'createdAt'>) => void;
  updateRequest: (requestId: string, updates: Partial<ResourceRequest>) => void;
  fulfillRequest: (requestId: string, resourceId: string) => void;
  reports: Report[];
  submitReport: (targetType: 'resource' | 'profile' | 'request', targetId: string, targetTitle: string, reason: Report['reason'], description: string) => void;
  resolveReport: (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => void;
  removeResource: (resourceId: string) => void;
  restoreResource: (resourceId: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  cookieConsent: { essential: boolean; analytics: boolean; answered: boolean };
  setCookieConsent: (consent: { essential: boolean; analytics: boolean; answered: boolean }) => void;
  followingUsernames: string[];
  toggleFollowUser: (username: string) => boolean;
  connections: { username: string; status: 'connected' | 'requested' }[];
  sendConnectionRequest: (username: string) => void;
  removeConnection: (username: string) => void;
  academicActivity: {
    id: string;
    username: string;
    action: string;
    targetTitle: string;
    targetSlug?: string;
    timestamp: string;
  }[];
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleThemeMode: () => void;
}

const SyllabiContext = createContext<SyllabiContextType | undefined>(undefined);

export function SyllabiProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_CREATORS[0]); // default to verified student persona
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [requests, setRequests] = useState<ResourceRequest[]>(INITIAL_REQUESTS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadTimestamps, setDownloadTimestamps] = useState<Record<string, number>>({});
  const [viewTimestamps, setViewTimestamps] = useState<Record<string, number>>({});
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const [cookieConsent, setCookieConsentState] = useState<{
    essential: boolean;
    analytics: boolean;
    answered: boolean;
  }>({
    essential: true,
    analytics: false,
    answered: false,
  });

  const [followingUsernames, setFollowingUsernames] = useState<string[]>([
    'amelia_chem',
    'marcus_stem',
  ]);
  const [connections, setConnections] = useState<{ username: string; status: 'connected' | 'requested' }[]>([
    { username: 'amelia_chem', status: 'connected' },
    { username: 'priya_revision', status: 'connected' },
  ]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AQA Chemistry Electrolysis',
    'GCSE Biology Cell Division',
    'Calculus Differentiation',
  ]);
  const [academicActivity, setAcademicActivity] = useState<{
    id: string;
    username: string;
    action: string;
    targetTitle: string;
    targetSlug?: string;
    timestamp: string;
  }[]>([
    {
      id: 'act-1',
      username: 'zayan',
      action: 'uploaded',
      targetTitle: 'AQA GCSE Chemistry — Electrolysis & Chemical Changes Master Guide',
      targetSlug: 'aqa-gcse-chem-electrolysis-notes',
      timestamp: '2 hours ago',
    },
    {
      id: 'act-2',
      username: 'amelia_chem',
      action: 'added 4 resources to',
      targetTitle: 'AQA Chemistry GCSE Complete Revision Stack',
      targetSlug: 'col-1',
      timestamp: '5 hours ago',
    },
    {
      id: 'act-3',
      username: 'marcus_stem',
      action: 'published',
      targetTitle: 'OCR A-Level Maths — Pure Calculus & Differentiation Guide',
      targetSlug: 'ocr-alevel-maths-calculus-guide',
      timestamp: '1 day ago',
    },
    {
      id: 'act-4',
      username: 'priya_revision',
      action: 'fulfilled request for',
      targetTitle: 'Edexcel GCSE Biology Ecology Master Checklist',
      targetSlug: 'edexcel-gcse-bio-ecology-checklist',
      timestamp: '2 days ago',
    },
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>('light');

  // The inline script in layout.tsx resolves the preference before paint and
  // marks <html class="dark">. Adopt it in a layout effect so the corrected
  // mode is committed before the browser paints (no light→dark flash).
  useIsomorphicLayoutEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setThemeModeState('dark');
    }
  }, []);

  // Keep the class + color-scheme in sync (Astryx <Theme> owns data-theme).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', themeMode === 'dark');
    root.style.colorScheme = themeMode;
  }, [themeMode]);

  const persistTheme = (mode: 'light' | 'dark') => {
    try {
      localStorage.setItem('syllabi_theme_mode', mode);
    } catch {
      // storage unavailable (private mode) — preference just won't persist
    }
  };

  const setThemeMode = useCallback((mode: 'light' | 'dark') => {
    setThemeModeState(mode);
    persistTheme(mode);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }, []);

  // Initialize Supabase Auth & Synchronization
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsSupabaseConnected(configured);

    if (!configured) {
      // Local fallback initialization
      try {
        const storedSaved = localStorage.getItem('syllabi_saved_ids');
        if (storedSaved) setSavedResourceIds(JSON.parse(storedSaved));
        const storedConsent = localStorage.getItem('syllabi_cookie_consent');
        if (storedConsent) setCookieConsentState(JSON.parse(storedConsent));
        const storedResources = localStorage.getItem('syllabi_resources');
        if (storedResources) setResources(JSON.parse(storedResources));
        const storedCollections = localStorage.getItem('syllabi_collections');
        if (storedCollections) setCollections(JSON.parse(storedCollections));
        const storedRequests = localStorage.getItem('syllabi_requests');
        if (storedRequests) setRequests(JSON.parse(storedRequests));
      } catch {
        // ignore storage errors
      }
      return;
    }

    // Real Supabase Connection
    try {
      const supabase = createClient();

      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncUserProfile(session.user);
        }
      });

      // Listen to auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            syncUserProfile(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setSavedResourceIds([]);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // fallback
    }
  }, []);

  // Synchronize user profile with Supabase and Google OAuth Metadata
  const syncUserProfile = async (authUser: any) => {
    try {
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Check if user has an avatar from Google OAuth
      const googleAvatar =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null;

      if (!error && profile) {
        // If profile exists, check if google avatar should be synchronized
        if (googleAvatar && !profile.avatar_url) {
          await supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar, updated_at: new Date().toISOString() })
            .eq('id', authUser.id);
          profile.avatar_url = googleAvatar;
        }

        setCurrentUser({
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name || profile.username,
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url || googleAvatar,
          qualification: profile.qualification || 'GCSE',
          examBoard: profile.exam_board || 'AQA',
          targetGrades: profile.target_grades,
          subjects: profile.subjects || ['Chemistry', 'Biology'],
          isPublic: profile.is_public ?? true,
          showActivity: profile.show_activity ?? true,
          allowIndexing: profile.allow_indexing ?? true,
          role: profile.role || 'student',
          resourcesCount: profile.resources_count || 0,
          totalViews: profile.total_views || 0,
          totalSaves: profile.total_saves || 0,
          reputationTitle: profile.reputation_title,
          createdAt: profile.created_at,
        });
      } else {
        // Create new profile record if missing
        const cleanUsername =
          authUser.user_metadata?.username ||
          authUser.user_metadata?.preferred_username ||
          authUser.email?.split('@')[0] ||
          `student_${authUser.id.slice(0, 5)}`;

        const newProfile = {
          id: authUser.id,
          username: cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          full_name: authUser.user_metadata?.full_name || cleanUsername,
          avatar_url: googleAvatar,
          qualification: authUser.user_metadata?.qualification || 'GCSE',
          exam_board: authUser.user_metadata?.exam_board || 'AQA',
          subjects: authUser.user_metadata?.subjects || ['Chemistry', 'Biology'],
          is_public: true,
          role: 'student',
        };

        await supabase.from('profiles').insert([newProfile]);
        setCurrentUser({
          id: newProfile.id,
          username: newProfile.username,
          fullName: newProfile.full_name,
          bio: '',
          avatarUrl: googleAvatar,
          qualification: newProfile.qualification,
          examBoard: newProfile.exam_board,
          subjects: newProfile.subjects,
          isPublic: true,
          showActivity: true,
          allowIndexing: true,
          role: 'student',
          resourcesCount: 0,
          totalViews: 0,
          totalSaves: 0,
          createdAt: new Date().toISOString(),
        });
      }

      // Fetch user's saved resource IDs
      const { data: saves } = await supabase
        .from('resource_saves')
        .select('resource_id')
        .eq('user_id', authUser.id);

      if (saves) {
        setSavedResourceIds(saves.map((s: any) => s.resource_id));
      }
    } catch {
      // Ignore sync error
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Supabase not configured: Running in development mode');
      return;
    }
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      showToast(`Google Sign-In failed: ${error.message}`);
    }
  };

  const signOutUser = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setSavedResourceIds([]);
    showToast('Signed out of Syllabi');
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) return false;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('profiles')
          .update({
            qualification: updates.qualification,
            exam_board: updates.examBoard,
            subjects: updates.subjects,
            bio: updates.bio,
            avatar_url: updates.avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id);
      } catch {
        // ignore
      }
    }

    showToast('Profile updated');
    return true;
  };

  const uploadUserAvatar = async (file: File): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      const avatarUrl = await uploadAvatarToStorage(file, currentUser.id);
      await updateUserProfile({ avatarUrl });
      return avatarUrl;
    } catch (e: any) {
      showToast(`Avatar upload failed: ${e.message || 'Error'}`);
      return null;
    }
  };

  const setCookieConsent = (consent: { essential: boolean; analytics: boolean; answered: boolean }) => {
    setCookieConsentState(consent);
    try {
      localStorage.setItem('syllabi_cookie_consent', JSON.stringify(consent));
    } catch {
      // ignore
    }
  };

  const toggleSaveResource = (resourceId: string): boolean => {
    const isSaved = savedResourceIds.includes(resourceId);
    const nextSaved = isSaved
      ? savedResourceIds.filter((id) => id !== resourceId)
      : [...savedResourceIds, resourceId];

    setSavedResourceIds(nextSaved);
    try {
      localStorage.setItem('syllabi_saved_ids', JSON.stringify(nextSaved));
    } catch {
      // ignore
    }

    // Update resource counter
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          const delta = isSaved ? -1 : 1;
          return { ...r, savesCount: Math.max(0, r.savesCount + delta) };
        }
        return r;
      })
    );

    // Sync to Supabase if connected
    if (isSupabaseConfigured() && currentUser) {
      const supabase = createClient();
      if (isSaved) {
        supabase
          .from('resource_saves')
          .delete()
          .match({ user_id: currentUser.id, resource_id: resourceId })
          .then();
      } else {
        supabase
          .from('resource_saves')
          .insert([{ user_id: currentUser.id, resource_id: resourceId }])
          .then();
      }
    }

    showToast(isSaved ? 'Resource removed from saved' : 'Resource saved to your library');
    return !isSaved;
  };

  const isResourceSaved = (resourceId: string) => {
    return savedResourceIds.includes(resourceId);
  };

  const recordView = (resourceId: string) => {
    const now = Date.now();
    const last = viewTimestamps[resourceId] || 0;
    if (now - last < 30000) return;

    setViewTimestamps((prev) => ({ ...prev, [resourceId]: now }));
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, viewsCount: r.viewsCount + 1 } : r))
    );

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase
        .from('resource_views')
        .insert([{ resource_id: resourceId, user_id: currentUser?.id || null }])
        .then();
    }
  };

  const recordDownload = (resourceId: string): boolean => {
    const now = Date.now();
    const last = downloadTimestamps[resourceId] || 0;
    if (now - last < 10000) {
      showToast('Download started. Please check your downloads folder.');
      return true;
    }

    setDownloadTimestamps((prev) => ({ ...prev, [resourceId]: now }));
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase
        .from('resource_downloads')
        .insert([{ resource_id: resourceId, user_id: currentUser?.id || null }])
        .then();
    }

    showToast('Download started');
    return true;
  };

  const addResource = (
    newResourceData: Omit<
      Resource,
      | 'id'
      | 'viewsCount'
      | 'downloadsCount'
      | 'savesCount'
      | 'ratingAvg'
      | 'ratingCount'
      | 'qualityBreakdown'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Resource => {
    const id = `res-${Date.now()}`;
    const newRes: Resource = {
      ...newResourceData,
      id,
      viewsCount: 1,
      downloadsCount: 0,
      savesCount: 0,
      ratingAvg: 5.0,
      ratingCount: 1,
      qualityBreakdown: {
        helpful: 5.0,
        clarity: 5.0,
        examFocus: 5.0,
        organization: 5.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setResources((prev) => {
      const next = [newRes, ...prev];
      try {
        localStorage.setItem('syllabi_resources', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Record activity
    setAcademicActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        username: newRes.creatorUsername,
        action: 'uploaded',
        targetTitle: newRes.title,
        targetSlug: newRes.slug,
        timestamp: 'Just now',
      },
      ...prev,
    ]);

    showToast('Resource published successfully!');
    return newRes;
  };

  const addRating = (rating: Omit<RatingReview, 'id' | 'createdAt'>) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === rating.resourceId) {
          const newCount = r.ratingCount + 1;
          const newAvg = Number(
            ((r.ratingAvg * r.ratingCount + rating.overallScore) / newCount).toFixed(2)
          );
          return {
            ...r,
            ratingCount: newCount,
            ratingAvg: newAvg,
            qualityBreakdown: {
              helpful: Number(
                ((r.qualityBreakdown.helpful * r.ratingCount + rating.helpfulScore) / newCount).toFixed(1)
              ),
              clarity: Number(
                ((r.qualityBreakdown.clarity * r.ratingCount + rating.clarityScore) / newCount).toFixed(1)
              ),
              examFocus: Number(
                ((r.qualityBreakdown.examFocus * r.ratingCount + rating.examFocusScore) / newCount).toFixed(1)
              ),
              organization: Number(
                ((r.qualityBreakdown.organization * r.ratingCount + rating.organizationScore) / newCount).toFixed(1)
              ),
            },
          };
        }
        return r;
      })
    );
    showToast('Review submitted. Thank you for supporting peer quality!');
  };

  const createCollection = (
    title: string,
    description: string,
    visibility: 'public' | 'private' | 'unlisted',
    initialResourceIds: string[] = []
  ): Collection => {
    const id = `col-${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCol: Collection = {
      id,
      userId: currentUser?.id || 'guest',
      username: currentUser?.username || 'anonymous',
      title,
      description,
      visibility,
      slug,
      resourcesCount: initialResourceIds.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCollections((prev) => {
      const next = [newCol, ...prev];
      try {
        localStorage.setItem('syllabi_collections', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    showToast(`Collection "${title}" created`);
    return newCol;
  };

  const addResourceToCollection = (collectionId: string, resourceId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, resourcesCount: c.resourcesCount + 1 } : c
      )
    );
    showToast('Saved to collection');
  };

  const createRequest = (
    req: Omit<ResourceRequest, 'id' | 'userId' | 'username' | 'status' | 'createdAt'>
  ) => {
    const newReq: ResourceRequest = {
      ...req,
      id: `req-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      username: currentUser?.username || 'student',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => {
      const next = [newReq, ...prev];
      try {
        localStorage.setItem('syllabi_requests', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast('Resource request submitted');
  };

  const updateRequest = (requestId: string, updates: Partial<ResourceRequest>) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          if (r.status === 'fulfilled') {
            showToast('Fulfilled requests are locked and cannot be edited.');
            return r;
          }
          return { ...r, ...updates };
        }
        return r;
      })
    );
    showToast('Request updated');
  };

  const fulfillRequest = (requestId: string, resourceId: string) => {
    const targetResource = resources.find((r) => r.id === resourceId);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'fulfilled',
              fulfilledResourceId: resourceId,
              fulfilledResourceTitle: targetResource?.title,
            }
          : r
      )
    );
    showToast('Request marked as fulfilled');
  };

  const submitReport = (
    targetType: Report['targetType'],
    targetId: string,
    targetTitle: string,
    reason: Report['reason'],
    description: string
  ) => {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser?.id || 'guest',
      reporterUsername: currentUser?.username || 'student',
      targetType,
      targetId,
      targetTitle,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    showToast('Report received. Our student moderation team will inspect this shortly.');
  };

  const resolveReport = (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: action,
              resolutionNotes: notes,
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser?.username || 'moderator',
            }
          : r
      )
    );
    showToast(`Report ${action}`);
  };

  const removeResource = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, status: 'removed' } : r))
    );
    showToast('Resource removed');
  };

  const restoreResource = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, status: 'published' } : r))
    );
    showToast('Resource restored to library');
  };

  const toggleFollowUser = (username: string): boolean => {
    const isFollowing = followingUsernames.includes(username);
    const next = isFollowing
      ? followingUsernames.filter((u) => u !== username)
      : [...followingUsernames, username];
    setFollowingUsernames(next);
    showToast(isFollowing ? `Unfollowed @${username}` : `Now following @${username}`);
    return !isFollowing;
  };

  const sendConnectionRequest = (username: string) => {
    setConnections((prev) => {
      const exists = prev.find((c) => c.username === username);
      if (exists) return prev;
      return [...prev, { username, status: 'requested' }];
    });
    showToast(`Study connection request sent to @${username}`);
  };

  const removeConnection = (username: string) => {
    setConnections((prev) => prev.filter((c) => c.username !== username));
    showToast(`Removed connection with @${username}`);
  };

  const addRecentSearch = (term: string) => {
    if (!term || term.trim().length === 0) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered].slice(0, 6);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <SyllabiContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isSupabaseConnected,
        signInWithGoogle,
        signOutUser,
        updateUserProfile,
        uploadUserAvatar,
        resources,
        savedResourceIds,
        toggleSaveResource,
        isResourceSaved,
        recordView,
        recordDownload,
        addResource,
        addRating,
        collections,
        createCollection,
        addResourceToCollection,
        requests,
        createRequest,
        updateRequest,
        fulfillRequest,
        reports,
        submitReport,
        resolveReport,
        removeResource,
        restoreResource,
        toastMessage,
        showToast,
        cookieConsent,
        setCookieConsent,
        followingUsernames,
        toggleFollowUser,
        connections,
        sendConnectionRequest,
        removeConnection,
        academicActivity,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        themeMode,
        setThemeMode,
        toggleThemeMode,
      }}
    >
      {children}
    </SyllabiContext.Provider>
  );
}

export function useSyllabi() {
  const context = useContext(SyllabiContext);
  if (!context) {
    throw new Error('useSyllabi must be used within a SyllabiProvider');
  }
  return context;
}

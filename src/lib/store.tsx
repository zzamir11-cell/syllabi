'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Resource,
  UserProfile,
  Collection,
  ResourceRequest,
  Report,
  RatingReview,
} from './types';
import { createClient } from './supabase/client';
import {
  isSupabaseConfigured,
  uploadAvatarToStorage,
  fetchResourcesFromSupabase,
  fetchRequestsFromSupabase,
  invalidateResourcesCache,
  invalidateProfileCache,
  invalidateRequestsCache,
} from './supabase/service';

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const PROFILE_SYNC_COLUMNS = `
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

interface SyllabiContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isSupabaseConnected: boolean;
  isGoogleModalOpen: boolean;
  setIsGoogleModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  loginAsGoogleDemo: () => void;
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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Use refs for rate-limiting timestamps so recording views/downloads never triggers full-tree re-renders
  const downloadTimestampsRef = useRef<Record<string, number>>({});
  const viewTimestampsRef = useRef<Record<string, number>>({});
  const syncingUserIdRef = useRef<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cookieConsent, setCookieConsentState] = useState<{
    essential: boolean;
    analytics: boolean;
    answered: boolean;
  }>({
    essential: true,
    analytics: false,
    answered: true, // Prevent hydration/mount flash before localStorage is checked
  });

  const [followingUsernames, setFollowingUsernames] = useState<string[]>([]);
  const [connections, setConnections] = useState<{ username: string; status: 'connected' | 'requested' }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [academicActivity, setAcademicActivity] = useState<{
    id: string;
    username: string;
    action: string;
    targetTitle: string;
    targetSlug?: string;
    timestamp: string;
  }[]>([]);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (!msg) {
      setToastMessage(null);
      return;
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
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

  // Synchronize user profile with Supabase and Google OAuth Metadata (parallelized + deduplicated)
  const syncUserProfile = useCallback(async (authUser: any) => {
    if (!authUser?.id) return;
    if (syncingUserIdRef.current === authUser.id) return;
    syncingUserIdRef.current = authUser.id;

    try {
      const supabase = createClient();

      // Run profile lookup and user saves lookup concurrently instead of sequentially
      const [profileRes, savesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select(PROFILE_SYNC_COLUMNS)
          .eq('id', authUser.id)
          .maybeSingle(),
        supabase
          .from('resource_saves')
          .select('resource_id')
          .eq('user_id', authUser.id),
      ]);

      const profile = profileRes.data;
      const error = profileRes.error;

      // Check if user has an avatar from Google OAuth
      const googleAvatar =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null;

      if (!error && profile) {
        // If profile exists, synchronize Google avatar in background if missing
        if (googleAvatar && !profile.avatar_url) {
          profile.avatar_url = googleAvatar;
          supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar, updated_at: new Date().toISOString() })
            .eq('id', authUser.id)
            .then();
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
          role: 'student' as const,
        };

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

        supabase.from('profiles').insert([newProfile]).then();
      }

      if (savesRes.data) {
        setSavedResourceIds(savesRes.data.map((s: any) => s.resource_id));
      }
    } catch {
      // Ignore sync error
    } finally {
      syncingUserIdRef.current = null;
    }
  }, []);

  // Initialize Supabase Auth & Synchronization
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsSupabaseConnected(configured);

    // Always restore persisted local preferences (cookies, saved ids, collections, searches)
    try {
      const storedConsent = localStorage.getItem('syllabi_cookie_consent');
      if (storedConsent) {
        setCookieConsentState(JSON.parse(storedConsent));
      } else {
        setCookieConsentState({ essential: true, analytics: false, answered: false });
      }
      const storedSaved = localStorage.getItem('syllabi_saved_ids');
      if (storedSaved) setSavedResourceIds(JSON.parse(storedSaved));
      const storedCollections = localStorage.getItem('syllabi_collections');
      if (storedCollections) setCollections(JSON.parse(storedCollections));
      const storedSearches = localStorage.getItem('syllabi_recent_searches');
      if (storedSearches) setRecentSearches(JSON.parse(storedSearches));
    } catch {
      // ignore storage errors
    }

    if (!configured) {
      try {
        const storedResources = localStorage.getItem('syllabi_resources');
        if (storedResources) setResources(JSON.parse(storedResources));
        const storedRequests = localStorage.getItem('syllabi_requests');
        if (storedRequests) setRequests(JSON.parse(storedRequests));
      } catch {
        // ignore
      }
      return;
    }

    // Real Supabase Connection: run independent resource & request fetches concurrently
    try {
      const supabase = createClient();

      Promise.all([
        fetchResourcesFromSupabase(),
        fetchRequestsFromSupabase(),
      ]).then(([resourcesData, requestsData]) => {
        if (resourcesData) setResources(resourcesData);
        if (requestsData) setRequests(requestsData);
      });

      // Listen to auth changes (handles INITIAL_SESSION, SIGNED_IN, USER_UPDATED, TOKEN_REFRESHED, SIGNED_OUT)
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'USER_UPDATED' ||
          event === 'TOKEN_REFRESHED'
        ) {
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
  }, [syncUserProfile]);

  const loginAsGoogleDemo = useCallback(() => {
    const demoUser: UserProfile = {
      id: 'google-demo-user-1',
      username: 'student_google',
      fullName: 'Google Student',
      bio: 'GCSE & A-Level Student studying Sciences.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      qualification: 'A-Level',
      examBoard: 'AQA',
      subjects: ['Chemistry', 'Biology', 'Physics'],
      isPublic: true,
      showActivity: true,
      allowIndexing: true,
      role: 'student',
      resourcesCount: 0,
      totalViews: 0,
      totalSaves: 0,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(demoUser);
    setIsGoogleModalOpen(false);
    showToast('Signed in as Google Student demo session');
  }, [showToast]);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      showToast('Supabase not configured: Running in development mode');
      return;
    }

    try {
      const checkRes = await fetch('/api/auth/google');
      const checkData = await checkRes.json();

      if (!checkData.enabled) {
        setIsGoogleModalOpen(true);
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
    } catch {
      setIsGoogleModalOpen(true);
    }
  }, [showToast]);

  const signOutUser = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setSavedResourceIds([]);
    invalidateProfileCache();
    showToast('Signed out of Syllabi');
  }, [showToast]);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!currentUser) return false;
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await supabase
            .from('profiles')
            .update({
              full_name: updates.fullName,
              qualification: updates.qualification,
              exam_board: updates.examBoard,
              subjects: updates.subjects,
              bio: updates.bio,
              avatar_url: updates.avatarUrl,
              is_public: updates.isPublic,
              show_activity: updates.showActivity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentUser.id);
          invalidateProfileCache(currentUser.username);
        } catch {
          // ignore
        }
      }

      showToast('Profile updated');
      return true;
    },
    [currentUser, showToast]
  );

  const uploadUserAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      if (!currentUser) return null;
      try {
        const avatarUrl = await uploadAvatarToStorage(file, currentUser.id);
        await updateUserProfile({ avatarUrl });
        return avatarUrl;
      } catch (e: any) {
        showToast(`Avatar upload failed: ${e.message || 'Error'}`);
        return null;
      }
    },
    [currentUser, updateUserProfile, showToast]
  );

  const setCookieConsent = useCallback(
    (consent: { essential: boolean; analytics: boolean; answered: boolean }) => {
      setCookieConsentState(consent);
      try {
        localStorage.setItem('syllabi_cookie_consent', JSON.stringify(consent));
      } catch {
        // ignore
      }
    },
    []
  );

  // O(1) Set lookup for saved resources
  const savedResourceSet = useMemo(() => new Set(savedResourceIds), [savedResourceIds]);

  const isResourceSaved = useCallback(
    (resourceId: string) => savedResourceSet.has(resourceId),
    [savedResourceSet]
  );

  const toggleSaveResource = useCallback(
    (resourceId: string): boolean => {
      const isSaved = savedResourceSet.has(resourceId);
      const nextSaved = isSaved
        ? savedResourceIds.filter((id) => id !== resourceId)
        : [...savedResourceIds, resourceId];

      setSavedResourceIds(nextSaved);
      try {
        localStorage.setItem('syllabi_saved_ids', JSON.stringify(nextSaved));
      } catch {
        // ignore
      }

      setResources((prev) =>
        prev.map((r) => {
          if (r.id === resourceId) {
            const delta = isSaved ? -1 : 1;
            return { ...r, savesCount: Math.max(0, r.savesCount + delta) };
          }
          return r;
        })
      );

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
        invalidateResourcesCache();
      }

      showToast(isSaved ? 'Resource removed from saved' : 'Resource saved to your library');
      return !isSaved;
    },
    [savedResourceSet, savedResourceIds, currentUser, showToast]
  );

  const recordView = useCallback(
    (resourceId: string) => {
      const now = Date.now();
      const last = viewTimestampsRef.current[resourceId] || 0;
      if (now - last < 30000) return;

      viewTimestampsRef.current[resourceId] = now;
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
    },
    [currentUser?.id]
  );

  const recordDownload = useCallback(
    (resourceId: string): boolean => {
      const now = Date.now();
      const last = downloadTimestampsRef.current[resourceId] || 0;
      if (now - last < 10000) {
        showToast('Download started. Please check your downloads folder.');
        return true;
      }

      downloadTimestampsRef.current[resourceId] = now;
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
    },
    [currentUser?.id, showToast]
  );

  const addResource = useCallback(
    (
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
      const nowIso = new Date().toISOString();
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
        createdAt: nowIso,
        updatedAt: nowIso,
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

      invalidateResourcesCache();

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
    },
    [showToast]
  );

  const addRating = useCallback(
    (rating: Omit<RatingReview, 'id' | 'createdAt'>) => {
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
      invalidateResourcesCache();
      showToast('Review submitted. Thank you for supporting peer quality!');
    },
    [showToast]
  );

  const createCollection = useCallback(
    (
      title: string,
      description: string,
      visibility: 'public' | 'private' | 'unlisted',
      initialResourceIds: string[] = []
    ): Collection => {
      const id = `col-${Date.now()}`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const nowIso = new Date().toISOString();

      const newCol: Collection = {
        id,
        userId: currentUser?.id || 'guest',
        username: currentUser?.username || 'anonymous',
        title,
        description,
        visibility,
        slug,
        resourcesCount: initialResourceIds.length,
        createdAt: nowIso,
        updatedAt: nowIso,
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
    },
    [currentUser?.id, currentUser?.username, showToast]
  );

  const addResourceToCollection = useCallback(
    (collectionId: string, _resourceId: string) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId ? { ...c, resourcesCount: c.resourcesCount + 1 } : c
        )
      );
      showToast('Saved to collection');
    },
    [showToast]
  );

  const createRequest = useCallback(
    (req: Omit<ResourceRequest, 'id' | 'userId' | 'username' | 'status' | 'createdAt'>) => {
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
      invalidateRequestsCache();
      showToast('Resource request submitted');
    },
    [currentUser?.id, currentUser?.username, showToast]
  );

  const updateRequest = useCallback(
    (requestId: string, updates: Partial<ResourceRequest>) => {
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
      invalidateRequestsCache();
      showToast('Request updated');
    },
    [showToast]
  );

  const fulfillRequest = useCallback(
    (requestId: string, resourceId: string) => {
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
      invalidateRequestsCache();
      showToast('Request marked as fulfilled');
    },
    [resources, showToast]
  );

  const submitReport = useCallback(
    (
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
    },
    [currentUser?.id, currentUser?.username, showToast]
  );

  const resolveReport = useCallback(
    (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => {
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
    },
    [currentUser?.username, showToast]
  );

  const removeResource = useCallback(
    (resourceId: string) => {
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, status: 'removed' } : r))
      );
      invalidateResourcesCache();
      showToast('Resource removed');
    },
    [showToast]
  );

  const restoreResource = useCallback(
    (resourceId: string) => {
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, status: 'published' } : r))
      );
      invalidateResourcesCache();
      showToast('Resource restored');
    },
    [showToast]
  );

  const toggleFollowUser = useCallback(
    (username: string): boolean => {
      const isFollowing = followingUsernames.includes(username);
      setFollowingUsernames((prev) =>
        isFollowing ? prev.filter((u) => u !== username) : [...prev, username]
      );
      showToast(isFollowing ? `Unfollowed @${username}` : `Following @${username}`);
      return !isFollowing;
    },
    [followingUsernames, showToast]
  );

  const sendConnectionRequest = useCallback(
    (username: string) => {
      setConnections((prev) => {
        if (prev.some((c) => c.username.toLowerCase() === username.toLowerCase())) {
          return prev;
        }
        return [...prev, { username, status: 'requested' }];
      });
      showToast(`Study connection request sent to @${username}`);
    },
    [showToast]
  );

  const removeConnection = useCallback(
    (username: string) => {
      setConnections((prev) => prev.filter((c) => c.username !== username));
      showToast(`Removed connection with @${username}`);
    },
    [showToast]
  );

  const addRecentSearch = useCallback((term: string) => {
    if (!term || term.trim().length === 0) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('syllabi_recent_searches', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('syllabi_recent_searches');
    } catch {
      // ignore
    }
  }, []);

  const contextValue = useMemo<SyllabiContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      isSupabaseConnected,
      isGoogleModalOpen,
      setIsGoogleModalOpen,
      signInWithGoogle,
      loginAsGoogleDemo,
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
    }),
    [
      currentUser,
      isSupabaseConnected,
      isGoogleModalOpen,
      signInWithGoogle,
      loginAsGoogleDemo,
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
    ]
  );

  return <SyllabiContext.Provider value={contextValue}>{children}</SyllabiContext.Provider>;
}

export function useSyllabi() {
  const context = useContext(SyllabiContext);
  if (!context) {
    throw new Error('useSyllabi must be used within a SyllabiProvider');
  }
  return context;
}

import { create } from 'zustand';
import { UserProfile, UserSession, UserAccountData, UserPlaylist } from '@/types/quran';
import { hashPassword, verifyPassword, generateSecureToken } from '@/lib/auth/crypto';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { syncService } from '@/lib/supabase/syncService';
import { usePlaylistStore } from './usePlaylistStore';
import { cleanInitialInsights, sanitizeInsights } from '@/lib/insightsUtils';

interface StoredAccount {
  profile: UserProfile;
  passwordHash: string;
}

export type AuthModalMode = 'signin' | 'signup' | 'reset';

export interface AuthActionResult {
  success: boolean;
  requiresEmailConfirmation?: boolean;
  message?: string;
  error?: string;
}

interface AuthState {
  currentUser: UserProfile | null;
  session: UserSession | null;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  isLoading: boolean;
  error: string | null;
  isCloudConnected: boolean;

  // Actions
  setAuthModalOpen: (open: boolean, mode?: AuthModalMode) => void;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  signOut: () => void;
  restoreSession: () => Promise<void>;
  getUserData: () => UserAccountData;
  saveUserData: (data: Partial<UserAccountData>) => Promise<void>;
  getGuestPlaylists: () => UserPlaylist[];
}

const STORAGE_KEY_ACCOUNTS = 'ayahflow_auth_accounts_v1';
const STORAGE_KEY_SESSION = 'ayahflow_auth_session_v1';
const GUEST_DATA_KEY = 'ayahflow_guest_data_v1';

function getUserDataKey(userId: string): string {
  return `ayahflow_user_data_${userId}_v1`;
}

function getStoredAccounts(): Record<string, StoredAccount> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored accounts from localStorage:', err);
    return {};
  }
}

function saveStoredAccounts(accounts: Record<string, StoredAccount>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to localStorage:', err);
  }
}

export const cleanInitialAccountData: UserAccountData = {
  playlists: [],
  favorites: [],
  downloadedSurahs: [],
  insights: cleanInitialInsights,
  lastActivePlaylistId: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  session: null,
  isAuthModalOpen: false,
  authModalMode: 'signin',
  isLoading: false,
  error: null,
  isCloudConnected: isSupabaseConfigured(),

  setAuthModalOpen: (open, mode = 'signin') => {
    set({ isAuthModalOpen: open, authModalMode: mode, error: null });
  },

  getGuestPlaylists: () => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(GUEST_DATA_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.playlists) ? parsed.playlists : [];
    } catch {
      return [];
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0];

    // RFC 5322 simplified email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      set({ isLoading: false, error: 'Please enter a valid email address.' });
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (password.length < 8) {
      set({ isLoading: false, error: 'Password must be at least 8 characters long.' });
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    // 1. SUPABASE REAL CLOUD REGISTRATION
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/collections`
          : 'https://ayahflow.tech/collections';

        const { data, error: sbError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { display_name: cleanName },
            emailRedirectTo: redirectUrl,
          },
        });

        if (sbError) {
          set({ isLoading: false, error: sbError.message });
          return { success: false, error: sbError.message };
        }

        const sbUser = data.user;
        if (!sbUser) {
          set({ isLoading: false, error: 'Failed to create user account. Please try again.' });
          return { success: false, error: 'Failed to create user account.' };
        }

        // Supabase returns an empty identities array if this email already exists
        if (sbUser.identities && sbUser.identities.length === 0) {
          set({ isLoading: false, error: 'An account with this email already exists. Please sign in.' });
          return { success: false, error: 'An account with this email already exists. Please sign in.' };
        }

        // If email confirmation is enabled on Supabase, no active session is returned yet
        if (!data.session) {
          set({ isLoading: false, error: null });
          return {
            success: true,
            requiresEmailConfirmation: true,
            message: `Confirmation email sent to ${cleanEmail}. Please check your inbox to verify your account and sign in.`,
          };
        }

        // Auto-confirmed or confirmation disabled flow
        const profile: UserProfile = {
          id: sbUser.id,
          email: cleanEmail,
          displayName: cleanName,
          createdAt: Date.now(),
        };

        const session: UserSession = {
          token: data.session.access_token,
          userId: sbUser.id,
          expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 30 * 86400000,
        };

        // Migrate guest playlists to newly created cloud account
        const guestPlaylists = get().getGuestPlaylists();
        if (guestPlaylists.length > 0) {
          await syncService.migrateLocalPlaylistsToCloud(sbUser.id, guestPlaylists);
        }

        set({
          currentUser: profile,
          session,
          isLoading: false,
          error: null,
          isAuthModalOpen: false,
          isCloudConnected: true,
        });

        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Supabase authentication failed.';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }
    }

    // 2. FALLBACK SECURE LOCAL AUTHENTICATION (When Supabase keys not yet configured)
    const accounts = getStoredAccounts();
    if (accounts[cleanEmail]) {
      set({ isLoading: false, error: 'An account with this email already exists. Please sign in.' });
      return { success: false, error: 'An account with this email already exists.' };
    }

    try {
      const passwordHash = await hashPassword(password);
      const userId = `usr_${generateSecureToken(12)}`;
      const profile: UserProfile = {
        id: userId,
        email: cleanEmail,
        displayName: cleanName,
        createdAt: Date.now(),
      };

      accounts[cleanEmail] = {
        profile,
        passwordHash,
      };
      saveStoredAccounts(accounts);

      const session: UserSession = {
        token: generateSecureToken(32),
        userId,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
        localStorage.setItem(getUserDataKey(userId), JSON.stringify(cleanInitialAccountData));
      }

      set({
        currentUser: profile,
        session,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
        isCloudConnected: false,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();

    // 1. SUPABASE REAL CLOUD SIGN IN
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (sbError) {
          const userFriendlyError = sbError.message.includes('Invalid login credentials')
            ? 'Invalid email or password. If you recently signed up, please verify your email first.'
            : sbError.message;
          set({ isLoading: false, error: userFriendlyError });
          return { success: false, error: userFriendlyError };
        }

        const sbUser = data.user;
        if (!sbUser || !data.session) {
          set({ isLoading: false, error: 'Sign in failed. No active session established.' });
          return { success: false, error: 'Sign in failed.' };
        }

        const profile: UserProfile = {
          id: sbUser.id,
          email: sbUser.email || cleanEmail,
          displayName: sbUser.user_metadata?.display_name || cleanEmail.split('@')[0],
          createdAt: new Date(sbUser.created_at).getTime(),
        };

        const session: UserSession = {
          token: data.session.access_token,
          userId: sbUser.id,
          expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 30 * 86400000,
        };

        set({
          currentUser: profile,
          session,
          isLoading: false,
          error: null,
          isAuthModalOpen: false,
          isCloudConnected: true,
        });

        // Pull playlists and preferences across devices from Supabase
        const cloudPlaylists = await syncService.pullUserPlaylists(sbUser.id);
        const cloudPrefs = await syncService.pullUserPreferences(sbUser.id);

        if (typeof window !== 'undefined') {
          const existingLocal = get().getUserData();
          const merged: UserAccountData = {
            ...existingLocal,
            playlists: cloudPlaylists.success && cloudPlaylists.data ? cloudPlaylists.data : existingLocal.playlists,
            favorites: cloudPrefs.success && cloudPrefs.data?.favorites ? cloudPrefs.data.favorites : existingLocal.favorites,
            downloadedSurahs: cloudPrefs.success && cloudPrefs.data?.downloadedSurahs ? cloudPrefs.data.downloadedSurahs : existingLocal.downloadedSurahs,
            insights: sanitizeInsights(cloudPrefs.success && cloudPrefs.data?.insights ? cloudPrefs.data.insights : existingLocal.insights),
          };
          localStorage.setItem(getUserDataKey(sbUser.id), JSON.stringify(merged));
        }

        // Trigger playlist store reload for authenticated user
        usePlaylistStore.getState().loadPlaylists();

        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Supabase authentication failed.';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }
    }

    // 2. FALLBACK SECURE LOCAL SIGN IN
    const accounts = getStoredAccounts();
    const account = accounts[cleanEmail];

    if (!account) {
      set({ isLoading: false, error: 'No account found with this email address.' });
      return { success: false, error: 'No account found with this email address.' };
    }

    try {
      const isMatch = await verifyPassword(password, account.passwordHash);
      if (!isMatch) {
        set({ isLoading: false, error: 'Incorrect password. Please try again.' });
        return { success: false, error: 'Incorrect password.' };
      }

      const session: UserSession = {
        token: generateSecureToken(32),
        userId: account.profile.id,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      }

      set({
        currentUser: account.profile,
        session,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
        isCloudConnected: false,
      });

      usePlaylistStore.getState().loadPlaylists();

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      const errMsg = 'Supabase cloud authentication is not configured.';
      set({ isLoading: false, error: errMsg });
      return { success: false, error: errMsg };
    }

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/collections`
        : 'https://ayahflow.tech/collections';

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        set({ isLoading: false, error: oauthError.message });
        return { success: false, error: oauthError.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      set({ isLoading: false, error: 'Please enter a valid email address.' });
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/settings`
          : 'https://ayahflow.tech/settings';

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

        if (resetError) {
          set({ isLoading: false, error: resetError.message });
          return { success: false, error: resetError.message };
        }

        set({ isLoading: false, error: null });
        return {
          success: true,
          message: `Password reset link sent to ${cleanEmail}. Please check your inbox.`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send password reset link.';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }
    }

    set({ isLoading: false, error: 'Password reset requires cloud connection.' });
    return { success: false, error: 'Password reset requires cloud connection.' };
  },

  signOut: () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
    set({
      currentUser: null,
      session: null,
      error: null,
    });

    // Reset playlists to guest local storage
    usePlaylistStore.getState().loadPlaylists();
  },

  restoreSession: async () => {
    if (typeof window === 'undefined') return;

    // 1. SUPABASE REAL CLOUD SESSION RESTORATION
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession && sbSession.user) {
          const profile: UserProfile = {
            id: sbSession.user.id,
            email: sbSession.user.email || '',
            displayName: sbSession.user.user_metadata?.display_name || (sbSession.user.email?.split('@')[0] ?? 'User'),
            createdAt: new Date(sbSession.user.created_at).getTime(),
          };

          const session: UserSession = {
            token: sbSession.access_token,
            userId: sbSession.user.id,
            expiresAt: sbSession.expires_at ? sbSession.expires_at * 1000 : Date.now() + 30 * 86400000,
          };

          set({ currentUser: profile, session, isCloudConnected: true });

          // Cross-device sync: pull latest cloud state
          const cloudPlaylists = await syncService.pullUserPlaylists(sbSession.user.id);
          const cloudPrefs = await syncService.pullUserPreferences(sbSession.user.id);

          const existingLocal = get().getUserData();
          const merged: UserAccountData = {
            ...existingLocal,
            playlists: cloudPlaylists.success && cloudPlaylists.data ? cloudPlaylists.data : existingLocal.playlists,
            favorites: cloudPrefs.success && cloudPrefs.data?.favorites ? cloudPrefs.data.favorites : existingLocal.favorites,
            downloadedSurahs: cloudPrefs.success && cloudPrefs.data?.downloadedSurahs ? cloudPrefs.data.downloadedSurahs : existingLocal.downloadedSurahs,
            insights: sanitizeInsights(cloudPrefs.success && cloudPrefs.data?.insights ? cloudPrefs.data.insights : existingLocal.insights),
          };
          localStorage.setItem(getUserDataKey(sbSession.user.id), JSON.stringify(merged));
          return;
        }
      } catch (err) {
        console.warn('Supabase session restoration failed:', err);
      }
    }

    // 2. FALLBACK LOCAL SESSION RESTORATION
    try {
      const rawSession = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!rawSession) return;
      const session = JSON.parse(rawSession) as UserSession;

      if (!session || !session.token || !session.userId || Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_KEY_SESSION);
        return;
      }

      const accounts = getStoredAccounts();
      const matched = Object.values(accounts).find((acc) => acc.profile.id === session.userId);
      if (matched) {
        set({ currentUser: matched.profile, session, isCloudConnected: false });
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } catch (err) {
      console.warn('Local session restoration failed:', err);
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  },

  getUserData: () => {
    if (typeof window === 'undefined') return cleanInitialAccountData;
    const { currentUser } = get();
    const key = currentUser ? getUserDataKey(currentUser.id) : GUEST_DATA_KEY;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return cleanInitialAccountData;
      const parsed = JSON.parse(raw);
      return {
        playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        downloadedSurahs: Array.isArray(parsed.downloadedSurahs) ? parsed.downloadedSurahs : [],
        insights: sanitizeInsights(parsed.insights),
        lastActivePlaylistId: parsed.lastActivePlaylistId || null,
      };
    } catch (err) {
      console.warn('Corrupt user data detected, falling back to clean data:', err);
      return cleanInitialAccountData;
    }
  },

  saveUserData: async (dataPartial) => {
    if (typeof window === 'undefined') return;
    const { currentUser } = get();
    const key = currentUser ? getUserDataKey(currentUser.id) : GUEST_DATA_KEY;
    try {
      const existing = get().getUserData();
      const updated: UserAccountData = {
        ...existing,
        ...dataPartial,
      };
      localStorage.setItem(key, JSON.stringify(updated));

      // Push to Supabase cloud if user is authenticated and Supabase is configured
      if (currentUser && isSupabaseConfigured()) {
        await syncService.pushUserPreferences(currentUser.id, updated);
      }
    } catch (err) {
      console.error('Failed to save user data:', err);
    }
  },
}));

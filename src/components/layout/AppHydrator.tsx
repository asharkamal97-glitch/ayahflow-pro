'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlaylistStore } from '@/store/usePlaylistStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';
import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal';
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal';

export default function AppHydrator() {
  useEffect(() => {
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      // 1. Restore authenticated session
      await useAuthStore.getState().restoreSession();

      // 2. Load personal playlists
      usePlaylistStore.getState().loadPlaylists();

      // 3. Hydrate private account data
      const data = useAuthStore.getState().getUserData();
      usePlayerStore.getState().hydrateAccountData(data);

      // 4. Listen to Supabase auth events (cross-tab / cross-device session changes)
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: subData } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
              if (session?.user) {
                await useAuthStore.getState().restoreSession();
                usePlaylistStore.getState().loadPlaylists();
                const refreshedData = useAuthStore.getState().getUserData();
                usePlayerStore.getState().hydrateAccountData(refreshedData);
              }
            } else if (event === 'SIGNED_OUT') {
              usePlayerStore.getState().resetToGuestData();
              usePlaylistStore.getState().loadPlaylists();
            }
          });
          authListenerSubscription = subData.subscription;
        }
      }
    };

    init();

    return () => {
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []);

  return (
    <>
      <AuthModal />
      <CreatePlaylistModal />
      <AddToPlaylistModal />
    </>
  );
}

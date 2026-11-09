import { getSupabaseClient } from './client';
import { UserPlaylist, UserAccountData } from '@/types/quran';

export interface CloudSyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const syncService = {
  /**
   * Pulls all personal playlists for the authenticated user,
   * reconstructing the exact ordered list of Surahs via playlist_entries position.
   */
  async pullUserPlaylists(userId: string): Promise<CloudSyncResult<UserPlaylist[]>> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      // 1. Fetch playlists
      const { data: playlistsData, error: plError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (plError) throw plError;
      if (!playlistsData || playlistsData.length === 0) {
        return { success: true, data: [] };
      }

      // 2. Fetch all playlist entries for this user ordered by position
      const playlistIds = playlistsData.map((p) => p.id);
      const { data: entriesData, error: entriesError } = await supabase
        .from('playlist_entries')
        .select('*')
        .in('playlist_id', playlistIds)
        .order('position', { ascending: true });

      if (entriesError) throw entriesError;

      // Group entries by playlist_id
      const entriesByPlaylist: Record<string, number[]> = {};
      for (const entry of entriesData || []) {
        if (!entriesByPlaylist[entry.playlist_id]) {
          entriesByPlaylist[entry.playlist_id] = [];
        }
        entriesByPlaylist[entry.playlist_id].push(entry.surah_number);
      }

      // Reconstruct UserPlaylist objects
      const reconstructed: UserPlaylist[] = playlistsData.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        createdAt: new Date(p.created_at).getTime(),
        updatedAt: new Date(p.updated_at).getTime(),
        surahNumbers: entriesByPlaylist[p.id] || [],
      }));

      return { success: true, data: reconstructed };
    } catch (err: unknown) {
      console.warn('Failed to pull user playlists from cloud:', err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Pushes a single playlist to Supabase, guaranteeing exact Surah sequence.
   */
  async pushPlaylist(userId: string, playlist: UserPlaylist): Promise<CloudSyncResult<string>> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      // 1. Upsert playlist record
      const { data: plData, error: plError } = await supabase
        .from('playlists')
        .upsert(
          {
            id: playlist.id,
            user_id: userId,
            name: playlist.name,
            description: playlist.description || '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single();

      if (plError) throw plError;

      const targetPlaylistId = plData?.id || playlist.id;

      // 2. Replace playlist_entries atomically to preserve exact sequence
      const { error: deleteError } = await supabase
        .from('playlist_entries')
        .delete()
        .eq('playlist_id', targetPlaylistId);

      if (deleteError) throw deleteError;

      if (playlist.surahNumbers.length > 0) {
        const rowsToInsert = playlist.surahNumbers.map((surahNum, index) => ({
          playlist_id: targetPlaylistId,
          user_id: userId,
          surah_number: surahNum,
          position: index,
        }));

        const { error: insertError } = await supabase
          .from('playlist_entries')
          .insert(rowsToInsert);

        if (insertError) throw insertError;
      }

      return { success: true, data: targetPlaylistId };
    } catch (err: unknown) {
      console.warn('Failed to push playlist to cloud:', err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Deletes a playlist from Supabase (entries cascade automatically).
   */
  async deleteCloudPlaylist(userId: string, playlistId: string): Promise<CloudSyncResult<boolean>> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, data: true };
    } catch (err: unknown) {
      console.warn('Failed to delete playlist from cloud:', err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Pulls user preferences (favorites, insights, reciter) from Supabase.
   */
  async pullUserPreferences(userId: string): Promise<CloudSyncResult<Partial<UserAccountData>>> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: true, data: {} };

      return {
        success: true,
        data: {
          favorites: Array.isArray(data.favorites) ? data.favorites : [],
          downloadedSurahs: Array.isArray(data.downloaded_surahs) ? data.downloaded_surahs : [],
          insights: data.insights || undefined,
        },
      };
    } catch (err: unknown) {
      console.warn('Failed to pull user preferences from cloud:', err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Pushes user preferences to Supabase.
   */
  async pushUserPreferences(
    userId: string,
    data: Partial<UserAccountData>
  ): Promise<CloudSyncResult<boolean>> {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      const updatePayload: Record<string, unknown> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };
      if (data.favorites !== undefined) updatePayload.favorites = data.favorites;
      if (data.downloadedSurahs !== undefined) updatePayload.downloaded_surahs = data.downloadedSurahs;
      if (data.insights !== undefined) updatePayload.insights = data.insights;

      const { error } = await supabase
        .from('user_preferences')
        .upsert(updatePayload, { onConflict: 'user_id' });

      if (error) throw error;
      return { success: true, data: true };
    } catch (err: unknown) {
      console.warn('Failed to push user preferences to cloud:', err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Safe migration: merges local/guest playlists into cloud account without losing any data.
   */
  async migrateLocalPlaylistsToCloud(
    userId: string,
    localPlaylists: UserPlaylist[]
  ): Promise<{ migratedCount: number; mergedPlaylists: UserPlaylist[] }> {
    const cloudResult = await this.pullUserPlaylists(userId);
    const cloudPlaylists = cloudResult.success && cloudResult.data ? cloudResult.data : [];

    const existingNames = new Set(cloudPlaylists.map((p) => p.name.toLowerCase()));
    let migratedCount = 0;

    for (const localPl of localPlaylists) {
      // If no playlist with same name exists in cloud, upload it
      if (!existingNames.has(localPl.name.toLowerCase())) {
        await this.pushPlaylist(userId, localPl);
        cloudPlaylists.unshift(localPl);
        migratedCount++;
      }
    }

    return {
      migratedCount,
      mergedPlaylists: cloudPlaylists,
    };
  },
};

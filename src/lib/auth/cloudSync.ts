import { UserAccountData, UserProfile } from '@/types/quran';

/**
 * CloudSyncAdapter provides an extensible interface for synchronizing
 * user accounts and playlists to a cloud backend (e.g. Supabase, Firebase, or custom REST).
 * 
 * If external credentials are not configured, it gracefully defaults to local-only mode.
 */
export interface CloudSyncAdapter {
  isConfigured: () => boolean;
  pushUserData: (userId: string, data: UserAccountData) => Promise<boolean>;
  pullUserData: (userId: string) => Promise<UserAccountData | null>;
}

class SupabaseCloudAdapter implements CloudSyncAdapter {
  private url: string | undefined;
  private anonKey: string | undefined;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.url && this.anonKey && this.url.startsWith('https://'));
  }

  async pushUserData(userId: string, data: UserAccountData): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const endpoint = `${this.url}/rest/v1/user_data?user_id=eq.${encodeURIComponent(userId)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey!,
          'Authorization': `Bearer ${this.anonKey!}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          account_data: data,
          updated_at: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Cloud sync push failed (network or configuration issue):', err);
      return false;
    }
  }

  async pullUserData(userId: string): Promise<UserAccountData | null> {
    if (!this.isConfigured()) return null;
    try {
      const endpoint = `${this.url}/rest/v1/user_data?user_id=eq.${encodeURIComponent(userId)}&select=account_data`;
      const res = await fetch(endpoint, {
        headers: {
          'apikey': this.anonKey!,
          'Authorization': `Bearer ${this.anonKey!}`,
        },
      });
      if (!res.ok) return null;
      const records = await res.json();
      if (Array.isArray(records) && records.length > 0 && records[0].account_data) {
        return records[0].account_data as UserAccountData;
      }
      return null;
    } catch (err) {
      console.warn('Cloud sync pull failed:', err);
      return null;
    }
  }
}

export const cloudSyncAdapter: CloudSyncAdapter = new SupabaseCloudAdapter();

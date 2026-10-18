import { create } from 'zustand';

export interface VerseTimestamp {
  verse_key: string;
  timestamp_from: number; // ms
  timestamp_to: number;   // ms
  duration: number;
}

export interface AyahData {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
}

export const RECITER_RECITATION_MAP: Record<string, number> = {
  'mishary-alafasy-kw': 7,
  'abdul-basit-abdul-samad-eg': 1,
  'mahmoud-khalil-al-husary-eg': 6,
  'muhammad-siddiq-al-minshawi-eg': 9,
  'abdur-rahman-as-sudais-sa': 3,
  'abu-bakr-al-shatri-sa': 4,
  'saud-al-shuraim-sa': 10,
};

// Map Quranify Tafsir IDs to Quran.com Tafsir IDs
export const TAFSIR_API_ID_MAP: Record<string, number> = {
  'en-tafsir-ibn-kathir': 169, // Ibn Kathir (English)
  'ar-tafsir-muyassar': 16,    // Tafsir Muyassar (Arabic)
  'ar-tafsir-jalalayn': 16,    // Fallback to Muyassar for reliable Arabic API
  'en-saheeh': 169             // English reference
};

interface TafsirSyncState {
  currentSurahNumber: number | null;
  currentReciterId: string | null;
  currentAyahNumber: number;
  hasVerifiedTimestamps: boolean;
  timestamps: VerseTimestamp[];
  ayahs: AyahData[];
  currentTafsirText: string;
  isLoadingMetadata: boolean;
  isLoadingTafsir: boolean;
  error: string | null;

  // Actions
  loadSurahMetadata: (surahNumber: number, reciterId: string) => Promise<void>;
  updateByTime: (currentTimeSec: number) => void;
  setManualAyah: (ayahNumber: number, surahNumber: number) => void;
  loadTafsirForCurrentAyah: (surahNumber: number, ayahNumber: number, tafsirId: string) => Promise<void>;
}

// In-memory caches to prevent refetching during rapid seeking
const timestampsCache = new Map<string, VerseTimestamp[]>();
const ayahsCache = new Map<number, AyahData[]>();
const tafsirCache = new Map<string, string>();

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const useTafsirSyncStore = create<TafsirSyncState>((set, get) => ({
  currentSurahNumber: null,
  currentReciterId: null,
  currentAyahNumber: 1,
  hasVerifiedTimestamps: false,
  timestamps: [],
  ayahs: [],
  currentTafsirText: '',
  isLoadingMetadata: false,
  isLoadingTafsir: false,
  error: null,

  loadSurahMetadata: async (surahNumber: number, reciterId: string) => {
    // If already loaded for this exact combination, skip
    if (get().currentSurahNumber === surahNumber && get().currentReciterId === reciterId && get().ayahs.length > 0) {
      return;
    }

    set({
      currentSurahNumber: surahNumber,
      currentReciterId: reciterId,
      isLoadingMetadata: true,
      error: null
    });

    try {
      // 1. Fetch or get cached Ayahs (Arabic text + translation)
      let surahAyahs = ayahsCache.get(surahNumber);
      if (!surahAyahs) {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
        if (res.ok) {
          const json = await res.json();
          const uthmani = json.data?.[0]?.ayahs || [];
          const english = json.data?.[1]?.ayahs || [];
          surahAyahs = uthmani.map((a: any, idx: number) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            translation: english[idx]?.text || ''
          }));
          ayahsCache.set(surahNumber, surahAyahs!);
        }
      }

      // 2. Fetch verified timestamps if reciter has segmentation
      const recitationId = RECITER_RECITATION_MAP[reciterId];
      let loadedTimestamps: VerseTimestamp[] = [];
      let hasTimestamps = false;

      if (recitationId) {
        const cacheKey = `${recitationId}_${surahNumber}`;
        const cached = timestampsCache.get(cacheKey);
        if (cached) {
          loadedTimestamps = cached;
          hasTimestamps = true;
        } else {
          try {
            const timeRes = await fetch(
              `https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${surahNumber}?segments=true`
            );
            if (timeRes.ok) {
              const timeData = await timeRes.json();
              if (timeData?.audio_file?.timestamps?.length) {
                loadedTimestamps = timeData.audio_file.timestamps;
                hasTimestamps = true;
                timestampsCache.set(cacheKey, loadedTimestamps);
              }
            }
          } catch (tErr) {
            console.warn('Could not load timestamps from Quran.com:', tErr);
          }
        }
      }

      set({
        ayahs: surahAyahs || [],
        timestamps: loadedTimestamps,
        hasVerifiedTimestamps: hasTimestamps,
        isLoadingMetadata: false,
        currentAyahNumber: 1
      });

      // Load initial Tafsir for Ayah 1
      get().loadTafsirForCurrentAyah(surahNumber, 1, 'en-tafsir-ibn-kathir');
    } catch (err: any) {
      console.error('Failed to load Surah metadata for Tafsir:', err);
      set({
        isLoadingMetadata: false,
        error: 'Failed to load Quran text. Live playback will continue.'
      });
    }
  },

  updateByTime: (currentTimeSec: number) => {
    const { timestamps, hasVerifiedTimestamps, currentAyahNumber, currentSurahNumber } = get();
    if (!hasVerifiedTimestamps || !timestamps.length || !currentSurahNumber) return;

    const currentMs = currentTimeSec * 1000;
    const match = timestamps.find(
      (ts) => currentMs >= ts.timestamp_from && currentMs < ts.timestamp_to
    );

    if (match) {
      const parts = match.verse_key.split(':');
      const matchedAyahNum = parseInt(parts[1], 10);
      if (matchedAyahNum && matchedAyahNum !== currentAyahNumber) {
        set({ currentAyahNumber: matchedAyahNum });
        get().loadTafsirForCurrentAyah(currentSurahNumber, matchedAyahNum, 'en-tafsir-ibn-kathir');
      }
    }
  },

  setManualAyah: (ayahNumber: number, surahNumber: number) => {
    set({ currentAyahNumber: ayahNumber });
    get().loadTafsirForCurrentAyah(surahNumber, ayahNumber, 'en-tafsir-ibn-kathir');
  },

  loadTafsirForCurrentAyah: async (surahNumber: number, ayahNumber: number, tafsirId: string) => {
    const apiTafsirId = TAFSIR_API_ID_MAP[tafsirId] || 169;
    const cacheKey = `${apiTafsirId}_${surahNumber}_${ayahNumber}`;

    const cached = tafsirCache.get(cacheKey);
    if (cached) {
      set({ currentTafsirText: cached, isLoadingTafsir: false });
      return;
    }

    set({ isLoadingTafsir: true });

    try {
      const res = await fetch(`https://api.quran.com/api/v4/tafsirs/${apiTafsirId}/by_ayah/${surahNumber}:${ayahNumber}`);
      if (res.ok) {
        const json = await res.json();
        const rawText = json?.tafsir?.text || '';
        const cleaned = stripHtml(rawText);
        tafsirCache.set(cacheKey, cleaned);
        set({ currentTafsirText: cleaned, isLoadingTafsir: false });
      } else {
        set({
          currentTafsirText: 'Tafsir explanation is currently unavailable for this verse.',
          isLoadingTafsir: false
        });
      }
    } catch (err) {
      console.warn('Tafsir fetch error:', err);
      set({
        currentTafsirText: 'Could not connect to online Tafsir database. Check internet connection.',
        isLoadingTafsir: false
      });
    }
  }
}));

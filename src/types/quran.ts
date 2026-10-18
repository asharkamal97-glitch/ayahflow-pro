export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  country: string;
  style: string; // e.g. Murattal, Mujawwad
  avatar: string;
  serverUrl: string; // Base URL where 001.mp3 etc are hosted
  surahList?: number[]; // list of available surahs, default 1..114
  bio?: string;
  featured?: boolean;
  tags?: string[]; // e.g. ['tajwid', 'emotional', 'popular']
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  coverGradient: string;
  reciterId: string;
  surahNumbers: number[];
  category: 'curated' | 'reciter-special' | 'tajwid' | 'mood';
}

export interface Track {
  surah: Surah;
  reciter: Reciter;
  audioUrl: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
  audioUrl?: string;
  tafsir?: string;
}

export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  icon: string;
  audioUrl: string;
  badge?: string;
}

export interface Tafsir {
  id: string;
  name: string;
  author: string;
  language: string;
}

export interface TimeOfDayStats {
  afterFajr: number;
  morning: number;
  dhuhr: number;
  afternoon: number;
  afterMaghrib: number;
  evening: number;
  lateNight: number;
}

export interface ListeningInsights {
  totalMinutesListened: number;
  currentStreak: number;
  bestStreak: number;
  lastListenedDate: string | null;
  dailyMinutes: Record<string, number>;
  timeOfDayStats: TimeOfDayStats;
  reciterListens: Record<string, number>;
  surahListens: Record<number, number>;
}

import { ListeningInsights } from '@/types/quran';

export const cleanInitialInsights: ListeningInsights = {
  totalMinutesListened: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastListenedDate: null,
  dailyMinutes: {},
  timeOfDayStats: {
    afterFajr: 0,
    morning: 0,
    dhuhr: 0,
    afternoon: 0,
    afterMaghrib: 0,
    evening: 0,
    lateNight: 0,
  },
  reciterListens: {},
  surahListens: {},
};

export function sanitizeInsights(raw?: Partial<ListeningInsights> | null): ListeningInsights {
  if (!raw || typeof raw !== 'object') {
    return { ...cleanInitialInsights };
  }
  return {
    totalMinutesListened:
      typeof raw.totalMinutesListened === 'number' && !isNaN(raw.totalMinutesListened)
        ? raw.totalMinutesListened
        : 0,
    currentStreak:
      typeof raw.currentStreak === 'number' && !isNaN(raw.currentStreak)
        ? raw.currentStreak
        : 0,
    bestStreak:
      typeof raw.bestStreak === 'number' && !isNaN(raw.bestStreak)
        ? raw.bestStreak
        : 0,
    lastListenedDate:
      typeof raw.lastListenedDate === 'string' ? raw.lastListenedDate : null,
    dailyMinutes:
      raw.dailyMinutes && typeof raw.dailyMinutes === 'object'
        ? raw.dailyMinutes
        : {},
    timeOfDayStats: {
      ...cleanInitialInsights.timeOfDayStats,
      ...(raw.timeOfDayStats && typeof raw.timeOfDayStats === 'object' ? raw.timeOfDayStats : {}),
    },
    reciterListens:
      raw.reciterListens && typeof raw.reciterListens === 'object'
        ? raw.reciterListens
        : {},
    surahListens:
      raw.surahListens && typeof raw.surahListens === 'object'
        ? raw.surahListens
        : {},
  };
}

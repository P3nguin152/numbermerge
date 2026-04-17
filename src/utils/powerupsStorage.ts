import AsyncStorage from '@react-native-async-storage/async-storage';

const POWERUPS_STORAGE_KEY = 'powerups_daily_usage';

interface PowerupsDailyUsage {
  date: string; // Format: YYYY-MM-DD
  undoCount: number;
  shuffleCount: number;
  removeTilesCount: number;
  doublePointsCount: number;
}

const DEFAULT_DAILY_LIMITS = {
  undoCount: 1,
  shuffleCount: 1,
  removeTilesCount: 1,
  doublePointsCount: 1,
};

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function loadDailyPowerups(): Promise<PowerupsDailyUsage> {
  try {
    const stored = await AsyncStorage.getItem(POWERUPS_STORAGE_KEY);
    if (!stored) {
      return {
        date: getTodayDateString(),
        ...DEFAULT_DAILY_LIMITS,
      };
    }

    const parsed: PowerupsDailyUsage = JSON.parse(stored);
    const today = getTodayDateString();

    // Reset if it's a new day
    if (parsed.date !== today) {
      return {
        date: today,
        ...DEFAULT_DAILY_LIMITS,
      };
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load daily powerups:', error);
    return {
      date: getTodayDateString(),
      ...DEFAULT_DAILY_LIMITS,
    };
  }
}

export async function saveDailyPowerups(usage: PowerupsDailyUsage): Promise<void> {
  try {
    await AsyncStorage.setItem(POWERUPS_STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to save daily powerups:', error);
  }
}

export async function updatePowerupCount(
  type: 'shuffleCount' | 'removeTilesCount' | 'doublePointsCount',
  decrement: boolean = true
): Promise<void> {
  const current = await loadDailyPowerups();
  const newValue = decrement ? Math.max(0, current[type] - 1) : current[type] + 1;
  
  await saveDailyPowerups({
    ...current,
    [type]: newValue,
  });
}

export async function resetDailyPowerups(): Promise<void> {
  await saveDailyPowerups({
    date: getTodayDateString(),
    ...DEFAULT_DAILY_LIMITS,
  });
}

/**
 * Seeded random number generator for daily challenges
 * Uses a simple linear congruential generator (LCG)
 */

class SeededRandom {
  private seed: number;

  constructor(seed: string | number) {
    // Convert string seed to number hash
    if (typeof seed === 'string') {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      this.seed = Math.abs(hash);
    } else {
      this.seed = Math.abs(seed);
    }
  }

  // Returns a random number between 0 and 1
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Returns a random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Returns a random element from an array
  nextItem<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }
}

/**
 * Get today's date as a seed string (YYYY-MM-DD format)
 */
export function getDailySeed(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create a seeded random generator for today's daily challenge
 */
export function createDailyRng(): SeededRandom {
  return new SeededRandom(getDailySeed());
}

/**
 * Create a seeded random generator with a custom seed
 */
export function createSeededRng(seed: string | number): SeededRandom {
  return new SeededRandom(seed);
}

export default SeededRandom;

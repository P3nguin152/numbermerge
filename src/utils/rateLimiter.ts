/**
 * Rate Limiter Utility
 * Prevents API abuse by limiting the frequency of requests
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request is allowed based on rate limit
   * @param key - Unique identifier for the request type/user
   * @returns Object with allowed flag and remaining requests
   */
  canMakeRequest(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.requests.delete(key);
    }

    const currentEntry = this.requests.get(key);

    if (!currentEntry) {
      // First request in window
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }

    if (currentEntry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
      };
    }

    // Increment count
    currentEntry.count++;
    this.requests.set(key, currentEntry);

    return {
      allowed: true,
      remaining: this.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   * @param key - The key to reset
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Create rate limiters for different API types
export const scoreSubmissionLimiter = new RateLimiter(20, 60000); // 20 requests per minute
export const leaderboardFetchLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const usernameCheckLimiter = new RateLimiter(10, 60000); // 10 requests per minute
export const profileFetchLimiter = new RateLimiter(30, 60000); // 30 requests per minute

/**
 * Wrapper for API calls with rate limiting
 * @param limiter - The rate limiter to use
 * @param key - Unique key for the request
 * @param apiCall - The API function to call
 * @returns Result of the API call or error if rate limited
 */
export async function withRateLimit<T>(
  limiter: RateLimiter,
  key: string,
  apiCall: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string; retryAfter?: number }> {
  const result = limiter.canMakeRequest(key);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      success: false,
      error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    };
  }

  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }
}

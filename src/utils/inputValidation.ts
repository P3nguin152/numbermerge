/**
 * Input Validation Utilities
 * Provides sanitization and validation functions for user inputs
 * to prevent security issues like injection attacks and ensure data integrity.
 */

/**
 * Sanitizes a username by removing potentially dangerous characters
 * and enforcing length constraints.
 * 
 * @param input - The raw username input
 * @returns Sanitized username or null if invalid
 */
export function sanitizeUsername(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Length validation
  if (trimmed.length < 3 || trimmed.length > 20) {
    return null;
  }

  // Allow only alphanumeric characters and underscores
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_]/g, '');

  // Verify sanitization didn't remove all characters
  if (sanitized.length === 0) {
    return null;
  }

  return sanitized;
}

/**
 * Validates that a username meets all security requirements
 * 
 * @param username - The username to validate
 * @returns Object with isValid flag and error message
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }

  // Check for only allowed characters
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Check for reserved usernames
  const reservedNames = ['admin', 'system', 'root', 'api', 'test', 'demo'];
  if (reservedNames.includes(trimmed.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }

  return { isValid: true };
}

/**
 * Sanitizes a string input by removing HTML tags and special characters
 * that could be used in XSS attacks.
 * 
 * @param input - The raw string input
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validates a score value to ensure it's a safe integer
 * 
 * @param score - The score to validate
 * @returns Validated score or 0 if invalid
 */
export function validateScore(score: any): number {
  const num = parseInt(score, 10);
  
  if (isNaN(num) || num < 0) {
    return 0;
  }

  // Prevent unreasonably large scores
  const MAX_SCORE = 999999999;
  return Math.min(num, MAX_SCORE);
}

/**
 * Validates a tile value to ensure it's within acceptable range
 * 
 * @param tileValue - The tile value to validate
 * @returns Validated tile value or 2 (minimum) if invalid
 */
export function validateTileValue(tileValue: any): number {
  const num = parseInt(tileValue, 10);
  
  if (isNaN(num) || num < 2) {
    return 2;
  }

  // Prevent unreasonably large tile values
  const MAX_TILE = 65536;
  return Math.min(num, MAX_TILE);
}

/**
 * Generic input sanitization for any user-provided data
 * 
 * @param input - The raw input
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeInput(input: any, maxLength: number = 1000): string {
  if (input === null || input === undefined) {
    return '';
  }

  const str = String(input);
  
  // Remove null bytes
  let sanitized = str.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Validates that a value is a safe integer within a range
 * 
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated number or default value
 */
export function validateInteger(value: any, min: number, max: number, defaultValue: number = 0): number {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return defaultValue;
  }

  return Math.max(min, Math.min(num, max));
}

/**
 * Utility functions for safe text handling in React Native
 * Ensures all text values are properly normalized to prevent rendering errors
 */

/**
 * Returns a valid string or fallback (default "—")
 * Handles null, undefined, empty strings, and whitespace-only strings
 */
export function safeText(
  value: string | null | undefined,
  fallback: string = "—"
): string {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return fallback;
  }
  return value;
}

/**
 * Returns a valid string or null (for optional text)
 * Handles null, undefined, empty strings, and whitespace-only strings
 */
export function safeTextOrNull(
  value: string | null | undefined
): string | null {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return null;
  }
  return value;
}

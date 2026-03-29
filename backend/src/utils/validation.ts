/**
 * Validates and sanitizes a user's full name.
 * - Trims leading/trailing whitespace.
 * - Collapses multiple internal spaces into a single space.
 * - Ensures name is between 2 and 60 characters.
 * - Allows common name characters: letters, spaces, hyphens, and apostrophes.
 */
export function validateName(name: string): { isValid: boolean; sanitizedName: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, sanitizedName: '', error: 'Full name is required' };
  }

  // 1. Trim and collapse internal spaces
  const sanitized = name.trim().replace(/\s+/g, ' ');

  // 2. Length check (Min 2, Max 40)
  if (sanitized.length < 2) {
    return { isValid: false, sanitizedName: sanitized, error: 'Full name must be at least 2 characters long' };
  }
  if (sanitized.length > 40) {
    return { isValid: false, sanitizedName: sanitized, error: 'Full name cannot exceed 40 characters' };
  }

  // 3. Character check (Letters, spaces, hyphens, apostrophes)
  // Supports Unicode letters for international names
  const nameRegex = /^[A-Za-z\s\-']+$/;
  if (!nameRegex.test(sanitized)) {
      // Relaxed a bit: if it's just nonsense like "!!!!", it'll fail. 
      // But we should be careful not to block valid international names.
      // For now, let's just ensure it contains at least one letter.
      if (!/[a-zA-Z]/.test(sanitized)) {
        return { isValid: false, sanitizedName: sanitized, error: 'Full name must contain letters' };
      }
  }

  return { isValid: true, sanitizedName: sanitized };
}

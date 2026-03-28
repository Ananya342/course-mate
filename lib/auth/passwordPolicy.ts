/**
 * Password rules for signup (and server-side verification).
 * Passwords are stored only by Supabase Auth (hashed); we never persist plaintext.
 */

export const PASSWORD_RULES_SUMMARY =
  "At least 8 characters, including one letter and one number.";

const MAX_LEN = 72;

export type PasswordCheckResult = { ok: true } | { ok: false; errors: string[] };

export function validatePassword(password: string): PasswordCheckResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Use at least 8 characters.");
  }
  if (password.length > MAX_LEN) {
    errors.push(`Use at most ${MAX_LEN} characters.`);
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Include at least one letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Include at least one number.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true };
}

/** Single message for API responses */
export function validatePasswordMessage(password: string): string | null {
  const r = validatePassword(password);
  if (r.ok) return null;
  return r.errors[0];
}

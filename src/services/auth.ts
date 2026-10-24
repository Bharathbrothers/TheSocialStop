/**
 * Secure Author Session Manager for GitHub Pages
 * 
 * Security Highlights:
 * 1. Zero plaintext passwords stored in localStorage or Git code.
 * 2. Only transient session tokens are kept in sessionStorage (cleared on browser tab close).
 * 3. Client-side brute-force defense: tracks failed attempts and enforces a 60-second cooldown.
 */

const SESSION_TOKEN_KEY = 'inksheet_author_session_token';
const FAILED_ATTEMPTS_KEY = 'inksheet_failed_login_attempts';
const COOLDOWN_UNTIL_KEY = 'inksheet_cooldown_until';

export function isAuthorLoggedIn(): boolean {
  try {
    return Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
  } catch {
    return false;
  }
}

export function getAuthorSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthorSessionToken(token: string): void {
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  resetFailedAttempts();
}

export function logoutAuthor(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

// Client-side rate limiting & cooldown helpers
export function getRemainingCooldownSeconds(): number {
  try {
    const until = parseInt(sessionStorage.getItem(COOLDOWN_UNTIL_KEY) || '0', 10);
    const now = Date.now();
    if (until > now) {
      return Math.ceil((until - now) / 1000);
    }
    return 0;
  } catch {
    return 0;
  }
}

export function recordClientFailedAttempt(): { remainingAttempts: number; isLockedOut: boolean; cooldownSeconds: number } {
  try {
    const attempts = parseInt(sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
    sessionStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());

    if (attempts >= 3) {
      const cooldownMs = 60 * 1000; // 60 seconds lockout
      sessionStorage.setItem(COOLDOWN_UNTIL_KEY, (Date.now() + cooldownMs).toString());
      return { remainingAttempts: 0, isLockedOut: true, cooldownSeconds: 60 };
    }

    return { remainingAttempts: 3 - attempts, isLockedOut: false, cooldownSeconds: 0 };
  } catch {
    return { remainingAttempts: 2, isLockedOut: false, cooldownSeconds: 0 };
  }
}

export function resetFailedAttempts(): void {
  try {
    sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
    sessionStorage.removeItem(COOLDOWN_UNTIL_KEY);
  } catch {
    // ignore
  }
}

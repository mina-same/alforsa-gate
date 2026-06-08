import { useCallback, useMemo, useState } from 'react';

const TOKEN_KEY = 'authToken';
const SESSION_FP_COOKIE = 'session_fp';

/**
 * Derives a fingerprint from the JWT so the session cookie is bound to the
 * specific token value. An attacker cannot forge this cookie without already
 * possessing the exact token it was created from.
 */
export function createSessionFingerprint(token: string): string {
  return btoa(token.slice(-32))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function setSessionCookie(token: string): void {
  const fp = createSessionFingerprint(token);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SESSION_FP_COOKIE}=${fp}; path=/; SameSite=Strict${secure}`;
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_FP_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export default function useAuth(): AuthContextValue {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const login = useCallback((newToken: string) => {
    if (!newToken) return;
    localStorage.setItem(TOKEN_KEY, newToken);
    setSessionCookie(newToken);
    setToken(newToken);
  }, []);


  const clearAllCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();

    const paths = ["/", window.location.pathname];
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
    ];

    // remove without domain
    paths.forEach((path) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    });

    // remove with domains
    domains.forEach((domain) => {
      paths.forEach((path) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
      });
    });
  });
};

const logout = useCallback(() => {
  localStorage.clear();

  clearAllCookies();

  sessionStorage.clear();

  setToken(null);

  window.location.href = "/login";
}, []);

  const isAuthenticated = useMemo(() => !!token, [token]);

  return useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout]
  );
}

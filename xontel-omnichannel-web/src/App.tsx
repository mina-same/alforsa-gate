import React, { useEffect, useMemo, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useTranslation } from "react-i18next";
import { NotificationPermissionPrompt } from "./components/NotificationPermissionPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { ResponsiveToaster } from "./components/ui/sonner-toast";
import { authAPI } from "./api/auth/endpoints";
import { usersAPI } from "./api/users/endpoints";
import GlobalCallOverlay from "./components/calls/GlobalCallOverlay";
import { useSetAuthUser } from "./contexts/AuthContext";
import { createSessionFingerprint, clearSessionCookie } from "./hooks/useAuth";

const getTextDirection = (language: string): "rtl" | "ltr" =>
  language === "ar" ? "rtl" : "ltr";

export default function App() {
  const { i18n } = useTranslation();
  const setAuthUser = useSetAuthUser();

  // ── All hooks must appear before any conditional returns ────────────────────

  const textDir = useMemo(
    () => getTextDirection(i18n.language),
    [i18n.language]
  );

  // True while the server identity check is in flight. We block rendering until
  // it resolves so that components never see stale / tampered localStorage data.
  const [verifying, setVerifying] = useState<boolean>(
    () => !!localStorage.getItem("authToken")
  );

  useEffect(() => {
    document.documentElement.dir = textDir;
    document.documentElement.lang = i18n.language;
  }, [textDir, i18n.language]);

  // On every app load: call /me to verify the token server-side, then use the
  // returned id to fetch the full user profile. This ensures:
  //   1. Expired / revoked tokens are caught immediately (server returns 401).
  //   2. The Redux store is populated with authoritative server data — components
  //      never render with tampered localStorage values because we hold `verifying`
  //      true until this resolves.
  // The axios interceptor in client.ts handles 401 → clears storage + redirects.
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setVerifying(false);
      return;
    }

    (async () => {
      try {
        const meData = await authAPI.getCurrentUser();
        setAuthUser(meData);

        if (meData.id) {
          const userId =
            typeof meData.id === "string"
              ? parseInt(meData.id, 10)
              : meData.id;
          const fullProfile = await usersAPI.getUser(userId);
          const merged = { ...meData, ...fullProfile };
          setAuthUser(merged);
          localStorage.setItem("currentUser", JSON.stringify(merged));
          localStorage.setItem("userProfile", JSON.stringify(fullProfile));
        } else {
          localStorage.setItem("currentUser", JSON.stringify(meData));
        }
      } catch {
        // 401/403 handled by client.ts interceptor → clears storage + redirects
      } finally {
        setVerifying(false);
      }
    })();
  }, [setAuthUser]);

  // After any login (including account switches), silently re-verify identity and
  // overwrite localStorage with the freshly-authenticated user's data.
  // This closes the gap where a stale `userProfile` from a previous session
  // could survive into a new login if the login mutation's profile write was
  // interrupted, or if other effects (ProfilePage useEffect, WebSocket, etc.)
  // raced to write stale data back before the mutation completed.
  useEffect(() => {
    const handler = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const meData = await authAPI.getCurrentUser();
        setAuthUser(meData);
        if (meData.id) {
          const userId = typeof meData.id === "string" ? parseInt(meData.id, 10) : meData.id;
          const fullProfile = await usersAPI.getUser(userId);
          const merged = { ...meData, ...fullProfile };
          setAuthUser(merged);
          localStorage.setItem("currentUser", JSON.stringify(merged));
          localStorage.setItem("userProfile", JSON.stringify(fullProfile));
        }
      } catch {
        // 401/403 handled by client.ts interceptor
      }
    };
    window.addEventListener("app:login", handler);
    return () => window.removeEventListener("app:login", handler);
  }, [setAuthUser]);

  // Handle user status updates (Busy, Away, Offline)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    let awayTimer: any;
    let offlineTimer: any;
    let isAway = false;
    let isOffline = false;

    const getStatusInfo = () => {
      const savedUser = localStorage.getItem('currentUser');
      const savedProfile = localStorage.getItem('userProfile');
      const user = savedUser ? JSON.parse(savedUser) : (savedProfile ? JSON.parse(savedProfile) : null);
      if (!user) return null;
      const current = user.current_chat_count || 0;
      const max = user.max_concurrent_chats || 5;
      return { current, max };
    };

    const updateStatus = async (status: string) => {
      try {
        await authAPI.updateStatus(status);
        console.log(`Status updated to: ${status}`);
      } catch (error) {
        console.error(`Failed to update status to ${status}:`, error);
      }
    };

    const determineActiveStatus = () => {
      const info = getStatusInfo();
      if (info && info.current >= info.max) {
        return "busy";
      }
      return "online";
    };

    const startInactivityTimers = () => {
      clearTimeout(awayTimer);
      clearTimeout(offlineTimer);

      // 5 minutes for Away
      awayTimer = setTimeout(async () => {
        isAway = true;
        await updateStatus("away");
      }, 5 * 60 * 1000);

      // 30 minutes for Offline
      offlineTimer = setTimeout(async () => {
        isOffline = true;
        await updateStatus("offline");
      }, 30 * 60 * 1000);
    };

    const resetInactivity = async () => {
      const wasInactive = isAway || isOffline;
      isAway = false;
      isOffline = false;

      clearTimeout(awayTimer);
      clearTimeout(offlineTimer);

      if (wasInactive && !document.hidden) {
        const targetStatus = determineActiveStatus();
        await updateStatus(targetStatus);
      }

      startInactivityTimers();
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        await resetInactivity();
      } else {
        // When hidden, we don't clear timers, we let them run
        // But we can choose to trigger 'away' immediately if preferred.
        // User said "leave the app", so let's stick to the 5m/30m timers starting from the last activity.
      }
    };

    const handleBeforeUnload = () => {
      authAPI.updateStatus("away");
    };

    // Events to track activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivity);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initial load
    const initialStatus = determineActiveStatus();
    updateStatus(initialStatus);
    startInactivityTimers();

    // Check capacity every minute if active
    const capacityInterval = setInterval(() => {
      if (!document.hidden && !isAway && !isOffline) {
        const currentActive = determineActiveStatus();
        updateStatus(currentActive);
      }
    }, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(capacityInterval);
      clearTimeout(awayTimer);
      clearTimeout(offlineTimer);
    };
  }, []);

  // ── Session guard (all hooks have been called above) ───────────────────────
  // Validate the session cookie fingerprint against the stored token.
  // The fingerprint is derived from the token itself, so it cannot be forged by
  // simply setting a cookie to "true" in DevTools — you must already have the token.
  const token = localStorage.getItem("authToken");
  const path = window.location.pathname;
  const isProtectedPath =
    !path.includes('/login') &&
    !path.includes('/forgot-password') &&
    !path.includes('/signup') &&
    !path.includes('/otp');

  if (token) {
    const expectedFp = createSessionFingerprint(token);
    const cookieValue = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('session_fp='))
      ?.split('=')[1];

    if (cookieValue !== expectedFp) {
      localStorage.clear();
      clearSessionCookie();
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      window.location.replace('/web/login');
      return null;
    }
  }

  if (!token && isProtectedPath) {
    window.location.replace('/web/login');
    return null;
  }

  // Hold render until the server has confirmed identity and populated Redux.
  // This prevents any component from briefly displaying another user's data
  // that was sitting in localStorage from a previous (possibly tampered) session.
  if (verifying) {
    return null;
  }

  return (
    <div dir={textDir}>
      <ResponsiveToaster />
      <OfflineIndicator />
      <AppRoutes />
      <NotificationPermissionPrompt />
      <GlobalCallOverlay />
    </div>
  );
}

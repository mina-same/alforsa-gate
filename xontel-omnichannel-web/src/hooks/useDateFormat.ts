"use client";

import { useCallback, useEffect } from "react";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { 
  formatDate as formatDateUtil, 
  formatTime as formatTimeUtil, 
  formatMessageTime as formatMessageTimeUtil, 
  isTimezoneMismatch as isTimezoneMismatch,
  convertUTCToLocal
} from "@/utils/time";
import { useUpdateUser } from "@/api/users/hooks";
import { userPermissionsStorage } from "@/lib/userPermissions";
import { useAuthUser } from "@/contexts/AuthContext";
export const useDateFormat = () => {
  const locale = i18n.language || "en-US";
  const user = useAuthUser();
  const userTimezone = user?.timezone;
  const updateUser = useUpdateUser();

  const { t } = useTranslation("chat");

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && userTimezone && browserTimezone !== userTimezone && user?.id && userPermissionsStorage.hasPermission("update_user")) {
      updateUser.mutate({
        id: user.id,
        data: { timezone: browserTimezone }
      });
    }
  }, [userTimezone, user?.id]);

  const formatDate = useCallback(
    (dateString?: string | Date): string => {
      return formatDateUtil(dateString, locale, userTimezone);
    },
    [locale, userTimezone]
  );

  const formatTime = useCallback(
    (dateString?: string | Date): string => {
      return formatTimeUtil(dateString, locale, userTimezone);
    },
    [locale, userTimezone]
  );

  const formatMessageRelativeTime = useCallback(
    (dateString?: string | Date): string => {
      return formatMessageTimeUtil(
        dateString,
        locale,
        userTimezone,
        t("sidebar.yesterday")
      );
    },
    [locale, userTimezone, t]
  );

  const formatRelativeActiveTime = useCallback(
    (timestamp?: string | Date): string => {
      if (!timestamp) return 'Last seen recently'
      try {
        const d = convertUTCToLocal(timestamp)
        if (isNaN(d.getTime())) return 'Last seen recently'

        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffSeconds = Math.floor(diffMs / 1000)
        const diffMins = Math.floor(diffSeconds / 60)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)
        const diffWeeks = Math.floor(diffDays / 7)
        const diffMonths = Math.floor(diffDays / 30)
        const diffYears = Math.floor(diffDays / 365)

        if (diffSeconds < 60) return t('profile.active_just_now') || 'Active just now'
        if (diffMins < 60) return t('profile.active_m_ago', { m: diffMins }) || `Active ${diffMins}m ago`
        if (diffHours < 24) return t('profile.active_h_ago', { h: diffHours }) || `Active ${diffHours}h ago`
        if (diffDays === 1) return t('profile.active_yesterday') || 'Active yesterday'
        if (diffDays < 7) return t('profile.active_d_ago', { d: diffDays }) || `Active ${diffDays}d ago`
        if (diffWeeks < 4) return t('profile.active_w_ago', { w: diffWeeks }) || `Active ${diffWeeks}w ago`
        if (diffMonths < 12) return t('profile.active_mo_ago', { mo: diffMonths }) || `Active ${diffMonths}mo ago`

        const formattedTime = formatTimeUtil(d, locale, userTimezone)
        return t('profile.active_on', { date: formattedTime }) || `Active on ${formattedTime}`
      } catch {
        return 'Last seen recently'
      }
    },
    [locale, userTimezone, t]
  );

  const timezoneMismatch = useCallback(() => {
    return isTimezoneMismatch(userTimezone);
  }, [userTimezone]);

  const getUserTimezone = useCallback(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    return `Your browser timezone differs from your profile timezone. Please update your profile timezone or adjust your browser settings to ensure accurate time display.
    Profile Timezone: ${userTimezone || "Not Set"}
    Browser Timezone: ${browserTimezone || "Not Detected"}`;
  }, [userTimezone]);

  return { formatDate, formatTime, formatMessageRelativeTime, formatRelativeActiveTime, timezoneMismatch, getUserTimezone };
};

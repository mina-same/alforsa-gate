"use client";

export const timeZones = Array.from(
  new Set([
    "UTC",
    ...Intl.supportedValuesOf("timeZone"),
  ])
);

export function convertUTCToLocal(utcTime: string | Date): Date {
  if (typeof utcTime !== 'string') {
    return new Date(utcTime)
  }

  // If it already ends with Z, it's properly formatted
  if (utcTime.endsWith('Z')) {
    return new Date(utcTime)
  }

  // If it has timezone offset (+HH:MM or -HH:MM), JavaScript will parse it correctly
  // Don't add Z in this case as it creates invalid timestamp like "...+00:00Z"
  if (/[+-]\d{2}:\d{2}$/.test(utcTime)) {
    return new Date(utcTime)
  }

  // Otherwise, assume UTC and add Z
  return new Date(utcTime + 'Z')
}

export const formatTime = (dateString?: string | Date, locale?: string, timeZone?: string): string => {
  if (!dateString) return "";
  const date = convertUTCToLocal(dateString);
  if (isNaN(date.getTime())) {
    return String(dateString);
  }
   const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (browserTimezone !== timeZone) {
    return new Intl.DateTimeFormat(locale || "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: browserTimezone,
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale || "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZone || undefined,
  }).format(date);
};



export const formatDate = (dateString?: string | Date, locale?: string, timeZone?: string): string => {
  if (!dateString) return "";
  const date = convertUTCToLocal(dateString);
  if (isNaN(date.getTime())) {
    return String(dateString);
  }
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (browserTimezone !== timeZone) {
    return new Intl.DateTimeFormat(locale || "en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: browserTimezone,
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale || "en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: timeZone || undefined,
  }).format(date);
};



export const isTimezoneMismatch = (profileTimezone?: string) => {
  if (!profileTimezone) return false;
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return browserTimezone !== profileTimezone;
};
export const formatMessageTime = (
  dateString?: string | Date,
  locale?: string,
  timeZone?: string,
  yesterdayStr: string = "Yesterday"
): string => {
  if (!dateString) return "";
  const date = convertUTCToLocal(dateString);
  if (isNaN(date.getTime())) {
    return String(dateString);
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfMsgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (startOfMsgDate.getTime() === startOfToday.getTime()) {
    // Today: format as time
    return new Intl.DateTimeFormat(locale || "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || undefined,
    }).format(date);
  } else if (startOfMsgDate.getTime() === startOfYesterday.getTime()) {
    // Yesterday: "Yesterday"
    return yesterdayStr;
  } else if (startOfToday.getTime() - startOfMsgDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Within the last 7 days: Day name
    return new Intl.DateTimeFormat(locale || "en-US", {
      weekday: "long",
      timeZone: timeZone || undefined,
    }).format(date);
  } else {
    // Older: Full date
    return new Intl.DateTimeFormat(locale || "en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: timeZone || undefined,
    }).format(date);
  }
};



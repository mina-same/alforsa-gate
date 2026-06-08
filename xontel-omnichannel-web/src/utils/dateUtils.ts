import i18n from "@/i18n";

export function parseTime(timeStr: string): number {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Try ISO or any Date-parsable string first
    const parsed = new Date(timeStr)
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.getTime()
    }

    // Handle special cases
    const lower = timeStr.toLowerCase()
    if (lower === 'now') return now.getTime()
    if (lower === 'today') return today.getTime()
    if (lower === 'yesterday') {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.getTime()
    }

    // Try to parse time HH:MM format
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (timeMatch) {
        const hours = parseInt(timeMatch[1])
        const minutes = parseInt(timeMatch[2])
        const meridiem = timeMatch[3]

        let h = hours
        if (meridiem?.toUpperCase() === 'PM' && hours !== 12) h += 12
        if (meridiem?.toUpperCase() === 'AM' && hours === 12) h = 0

        const date = new Date(today)
        date.setHours(h, minutes, 0, 0)
        return date.getTime()
    }

    // Try to parse day name (Mon, Tue, etc.)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayIndex = dayNames.findIndex(d => d.toLowerCase() === lower)
    if (dayIndex >= 0) {
        const date = new Date(today)
        const currentDayIndex = date.getDay()
        const diff = (dayIndex - currentDayIndex + 7) % 7
        date.setDate(date.getDate() - diff)
        return date.getTime()
    }

    return today.getTime()
}

export function getDateLabel(timeStr: string): string {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Try ISO or any Date-parsable string
    const parsed = new Date(timeStr)
    if (!Number.isNaN(parsed.getTime())) {
        const msgDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
        const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        // Format as e.g., Dec 30, 2025
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${monthNames[msgDate.getMonth()]} ${msgDate.getDate()}, ${msgDate.getFullYear()}`
    }

    // Handle special cases
    const lower = timeStr.toLowerCase()
    if (lower === 'now' || lower === 'today') return 'Today'
    if (lower === 'yesterday') return 'Yesterday'

    // Try to parse time HH:MM format (assume today)
    const timeMatch = timeStr.match(/\d{1,2}:\d{2}/)
    if (timeMatch) {
        return 'Today'
    }

    // Try to parse day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayIndex = dayShortNames.findIndex(d => d.toLowerCase() === lower)
    if (dayIndex >= 0) {
        return dayNames[dayIndex]
    }

    return timeStr
}




export function convertUTCToLocal(utcTime: string | Date): Date {
    if (typeof utcTime !== 'string') {
        return new Date(utcTime)
    }

    // Already has Z (e.g. "2026-04-20T12:12:04.708488Z")
    if (utcTime.endsWith('Z')) {
        return new Date(utcTime)
    }

    // Already has a timezone offset (e.g. "+05:30" or "-07:00") — don't append Z
    if (/[+-]\d{2}:\d{2}$/.test(utcTime)) {
        return new Date(utcTime)
    }

    // No timezone info — treat as UTC and append Z
    // Handles: "2026-04-20T12:12:05.479478", "2026-04-20T12:12:08", "2026-04-20T12:30:44"
    return new Date(utcTime + 'Z')
}

export function formatMessageTime(dateString?: string, locale?: string): string {
    if (!dateString) return ""
    const date = convertUTCToLocal(dateString)
    if (Number.isNaN(date.getTime())) return dateString

    let timezone: string | undefined
    try {
        const userProfileStr = localStorage.getItem('userProfile')
        const userProfileData = userProfileStr ? JSON.parse(userProfileStr) : null
        timezone = userProfileData?.timezone || undefined
    } catch {
        timezone = undefined
    }

    return new Intl.DateTimeFormat(locale || undefined, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
    }).format(date)
}

export const timeZones = Array.from(
  new Set([
    "UTC",
    ...Intl.supportedValuesOf("timeZone"),
  ])
);

/**
 * Formats a status timestamp (sent_at / delivered_at / read_at) as "HH:MM".
 * Returns empty string if the value is null/undefined/invalid.
 */
export function formatStatusTimestamp(dateString?: string | null, locale?: string): string {
    if (!dateString) return ""
    const date = convertUTCToLocal(dateString)
    if (Number.isNaN(date.getTime())) return ""

    let timezone: string | undefined
    try {
        const userProfileStr = localStorage.getItem('userProfile')
        const userProfileData = userProfileStr ? JSON.parse(userProfileStr) : null
        timezone = userProfileData?.timezone || undefined
    } catch {
        timezone = undefined
    }

    return new Intl.DateTimeFormat(locale || undefined, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
    }).format(date)
}

/**
 * Derives the effective message status from the backend timestamp fields.
 * Falls back to the explicit `status` string when timestamps are absent.
 *
 * Priority: read_at > delivered_at > sent_at > status
 */
export function deriveMessageStatus(
    status?: string | null,
    sent_at?: string | null,
    delivered_at?: string | null,
    read_at?: string | null,
): "pending" | "sent" | "delivered" | "read" | "failed" {
    if (read_at) return "read"
    if (delivered_at) return "delivered"
    if (sent_at) return "sent"

    const s = (status || "").toLowerCase()
    if (s === "read") return "read"
    if (s === "delivered") return "delivered"
    if (s === "sent") return "sent"
    if (s === "failed") return "failed"
    return "pending"
}











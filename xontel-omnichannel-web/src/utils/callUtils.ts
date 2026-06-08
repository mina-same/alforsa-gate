import { Call, CallWithConversation } from "../types/chat"

export const filterCallsByStatus = (
    calls: CallWithConversation[],
    status: Call['status']
): CallWithConversation[] => {
    return calls.filter(call => call.status === status)
}

export const filterCallsByType = (
    calls: CallWithConversation[],
    type: Call['type']
): CallWithConversation[] => {
    return calls.filter(call => call.type === type)
}

export type CallDateGroup = 'Today' | 'Yesterday' | 'This Week' | 'Older'

export const groupCallsByDate = (calls: CallWithConversation[]): Record<CallDateGroup, CallWithConversation[]> => {
    const groups: Record<CallDateGroup, CallWithConversation[]> = {
        'Today': [],
        'Yesterday': [],
        'This Week': [],
        'Older': [],
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    calls.forEach(call => {
        const timeStr = call.time.toLowerCase()

        // Parse time string to determine group
        if (timeStr.includes('am') || timeStr.includes('pm')) {
            // Time only (e.g., "9:45 AM") - assume today
            groups['Today'].push(call)
        } else if (timeStr === 'yesterday') {
            groups['Yesterday'].push(call)
        } else if (timeStr.includes('days ago')) {
            const daysMatch = timeStr.match(/(\d+)\s*days?\s*ago/)
            const days = daysMatch ? parseInt(daysMatch[1]) : 0
            if (days <= 7) {
                groups['This Week'].push(call)
            } else {
                groups['Older'].push(call)
            }
        } else if (timeStr.includes('week')) {
            groups['Older'].push(call)
        } else {
            // Default to older for unknown formats
            groups['Older'].push(call)
        }
    })

    return groups
}

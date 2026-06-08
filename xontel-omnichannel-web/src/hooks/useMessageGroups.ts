import { useMemo } from 'react'
import { parseTime, getDateLabel } from '../utils/dateUtils'
import { Message } from '@/types/chat'

export interface MessageGroup {
    date: string
    messages: Message[]
}

export function useMessageGroups(messages: Message[]) {
    return useMemo(() => {
        const groups: MessageGroup[] = []
        let currentDate = ''
        let currentGroup: Message[] = []

        // Sort messages chronologically (oldest first)
        const sortedMessages = [...messages].sort((a, b) => {
            const aTime = parseTime(a.createdAt)
            const bTime = parseTime(b.createdAt)
            return aTime - bTime
        })

        sortedMessages.forEach(msg => {
            const dateLabel = getDateLabel(msg.createdAt)
            if (dateLabel !== currentDate) {
                if (currentGroup.length > 0) {
                    groups.push({ date: currentDate, messages: currentGroup })
                }
                currentDate = dateLabel
                currentGroup = [msg]
            } else {
                currentGroup.push(msg)
            }
        })

        if (currentGroup.length > 0) {
            groups.push({ date: currentDate, messages: currentGroup })
        }

        return groups
    }, [messages])
}

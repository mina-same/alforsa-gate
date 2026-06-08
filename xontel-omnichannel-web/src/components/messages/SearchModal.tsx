import { useState, useMemo, useRef, useEffect } from 'react'
import { X, ChevronUp, ChevronDown, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Calendar } from '@components/ui/calendar'
import type { Message } from '@/types/chat'
import { convertUTCToLocal } from '@/utils/time';

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  onSelectMessage?: (messageId: string, query: string) => void
}

type SearchResultItem = {
  id: string
  createdAt?: string
}

export default function SearchBar({
  isOpen,
  onClose,
  messages,
  onSelectMessage,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const onSelectMessageRef = useRef<SearchBarProps['onSelectMessage']>(onSelectMessage)
  useEffect(() => {
    onSelectMessageRef.current = onSelectMessage
  }, [onSelectMessage])

  // Local search over already-loaded messages — instant, no API call
  const searchResults = useMemo<SearchResultItem[]>(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []
    return messages
      .filter(msg => msg.text?.toLowerCase().includes(q))
      .map(msg => ({ id: msg.id, createdAt: msg.createdAt }))
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
  }, [searchQuery, messages])

  // Reset index when results change (new query)
  const prevQueryRef = useRef('')
  useEffect(() => {
    if (searchQuery === prevQueryRef.current) return
    prevQueryRef.current = searchQuery
    setCurrentResultIndex(0)
  }, [searchQuery])

  // Get days that have search results
  const daysWithResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const days = new Set<number>()
    searchResults.forEach(msg => {
      if (msg.createdAt) {
        const d = convertUTCToLocal(msg.createdAt)
        if (!Number.isNaN(d.getTime())) {
          days.add(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate())
        }
      }
    })
    return Array.from(days).map(n => n % 100)
  }, [searchQuery, searchResults])

  // Handle outside click to close calendar
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleOutsideClick)
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }
  }, [showCalendar])

  const handlePrevious = () => {
    if (searchResults.length === 0) return
    setCurrentResultIndex((prev) => {
      const newIndex = prev === 0 ? searchResults.length - 1 : prev - 1
      onSelectMessageRef.current?.(searchResults[newIndex].id, searchQuery.trim())
      return newIndex
    })
  }

  const handleNext = () => {
    if (searchResults.length === 0) return
    setCurrentResultIndex((prev) => {
      const newIndex = prev === searchResults.length - 1 ? 0 : prev + 1
      onSelectMessageRef.current?.(searchResults[newIndex].id, searchQuery.trim())
      return newIndex
    })
  }

  const handleClose = () => {
    setSearchQuery('')
    setCurrentResultIndex(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 flex-shrink-0">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleNext() }}
        autoFocus
        className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Results Counter */}
      {searchQuery.trim() !== '' && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {searchResults.length > 0
            ? `${currentResultIndex + 1} of ${searchResults.length}`
            : '0'}
        </div>
      )}

      {/* Up Button */}
      <Button
        variant="ghost"
        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
        onClick={handlePrevious}
        disabled={searchResults.length === 0}
        title="Previous result"
      >
        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      {/* Down Button */}
      <Button
        variant="ghost"
        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
        onClick={handleNext}
        disabled={searchResults.length === 0}
        title="Next result"
      >
        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      {/* Calendar Button */}
      <div className="relative" ref={calendarRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          onClick={() => setShowCalendar(!showCalendar)}
          title="Show calendar"
        >
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute top-full right-0 mt-2 z-50">
            <Calendar
              daysWithResults={daysWithResults}
              onDateSelect={(date) => {
                const selectedYear = date.getFullYear()
                const selectedMonth = date.getMonth()
                const selectedDay = date.getDate()
                const messagesOnDay = searchResults.filter(msg => {
                  if (!msg.createdAt) return false
                  const d = convertUTCToLocal(msg.createdAt)
                  if (Number.isNaN(d.getTime())) return false
                  return (
                    d.getFullYear() === selectedYear &&
                    d.getMonth() === selectedMonth &&
                    d.getDate() === selectedDay
                  )
                })

                if (messagesOnDay.length > 0) {
                  const firstMessageIndex = searchResults.findIndex(msg =>
                    messagesOnDay.includes(msg)
                  )
                  setCurrentResultIndex(firstMessageIndex)
                  onSelectMessageRef.current?.(messagesOnDay[0].id, searchQuery.trim())
                  setShowCalendar(false)
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
        onClick={handleClose}
        title="Close search"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

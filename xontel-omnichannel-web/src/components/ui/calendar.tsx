import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface CalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  daysWithResults?: number[] // Array of day numbers that have search results
}

export function Calendar({ selectedDate, onDateSelect, daysWithResults = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    onDateSelect?.(newDate)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const hasResults = (day: number) => daysWithResults.includes(day)

  return (
    <div className="p-5 rounded-xl border border-border bg-background shadow-xl w-80">
      {/* Header with gradient background */}
      <div className="mb-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/40 text-muted-foreground transition-colors"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            {monthNames[currentDate.getMonth()]}{' '}
            <span className="text-primary">{currentDate.getFullYear()}</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/40 text-muted-foreground transition-colors"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Day names with better styling */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid with enhanced styling */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className="relative h-10 flex items-center justify-center"
          >
            {day ? (
              <button
                onClick={() => handleDayClick(day)}
                className={`w-full h-full flex items-center justify-center text-sm font-semibold rounded-lg relative transition-all duration-200 ${
                  isToday(day)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : hasResults(day)
                    ? 'bg-primary/10 text-foreground border border-primary/25'
                    : 'text-foreground hover:bg-muted/40'
                }`}
              >
                {day}
                {/* Enhanced dot indicator for days with search results */}
                {hasResults(day) && !isToday(day) && (
                  <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-primary rounded-full shadow-sm"></span>
                )}
                {/* Dot for today with results */}
                {hasResults(day) && isToday(day) && (
                  <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-primary-foreground rounded-full shadow-sm"></span>
                )}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Footer with legend */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/60"></div>
          <span className="text-muted-foreground">Results</span>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Search } from 'lucide-react'

interface TemplateSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TemplateSearchBar({ value, onChange, placeholder = "Search templates..." }: TemplateSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 bg-muted border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />
    </div>
  )
}

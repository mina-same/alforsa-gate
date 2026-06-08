import React from 'react'
import { MessageCircle, Users, Search, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@components/ui/button'

export default function NavSidebar() {
  return (
    <nav className="h-full flex flex-col justify-between bg-xon-surface-container border border-xon-surface-outline rounded-xl py-4 px-2">
      {/* Top brand / logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-xon-primary text-xon-primary-on text-lg font-semibold">
          X
        </div>

        {/* Main nav icons */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl bg-xon-container-blue text-xon-text-blue hover:bg-xon-blue-select"
            type="button"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-xon-text-primary hover:bg-xon-surface-container-hover"
            type="button"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-xon-text-primary hover:bg-xon-surface-container-hover"
            type="button"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-xon-text-primary hover:bg-xon-surface-container-hover"
          type="button"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-xon-text-primary hover:bg-xon-surface-container-hover"
          type="button"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  )
}

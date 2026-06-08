import React from 'react'
import MessageThread from '@components/messages/MessageThread'

export default function MainLayout() {
  return (
    <main className="h-full w-full flex flex-col bg-background overflow-y-auto` " >
      <MessageThread />
    </main>
  )
}

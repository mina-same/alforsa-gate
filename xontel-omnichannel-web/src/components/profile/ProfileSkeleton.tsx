import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileSkeleton() {
  return (
    <div className="h-screen text-xon-text-primary overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="h-full w-full flex flex-col bg-xon-surface overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
                <header className="flex items-center justify-between gap-4 border-b border-xon-surface-outline pb-4 mb-2">
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-8 w-48" />
                    <Skeleton variant="text" className="h-4 w-80" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                  </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 items-start">
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <Skeleton variant="circle" className="h-24 w-24" />
                    <div className="space-y-2 text-center md:text-left">
                      <Skeleton variant="text" className="h-6 w-40" />
                      <Skeleton variant="text" className="h-4 w-56" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-xon-surface-outline bg-xon-surface-container p-4"
                      >
                        <Skeleton variant="text" className="h-3 w-20" />
                        <Skeleton variant="text" className="h-7 w-16 mt-3" />
                        <Skeleton variant="text" className="h-3 w-32 mt-3" />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-4">
                  <Skeleton variant="text" className="h-4 w-32 mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-xon-surface-outline"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="min-w-0 space-y-2">
                            <Skeleton variant="text" className="h-4 w-40" />
                            <Skeleton variant="text" className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton variant="text" className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-6">
                  <Skeleton variant="text" className="h-4 w-40 mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </section>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

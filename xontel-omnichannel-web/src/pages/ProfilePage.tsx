import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import MobileProfile from '@/pages/MobileProfile'
import { useUserInboxes, useUpdateUser, useUser } from '@/api/users/hooks'
import { useAuthUser } from '@/contexts/AuthContext'
import { useUIDispatch, useUIState, setActiveInboxId } from '@/contexts/UIContext'
import { cn } from '@/lib/utils'
import { Pencil, ChevronRight } from 'lucide-react'
import {
  ProfileHeader,
  ProfileAvatarSection,
  ChatCapacitySection,
  InboxesSection,
  LanguageSettingsSection,
  ProfileOverviewSection,
  ProfileSkeleton,
  PasskeySection,
} from '@/components/profile'
import AccountSettingsSection from '@/components/profile/AccountSettingsSection'
import HomeAnalyticsDashboard from '@/components/empty/HomeAnalyticsDashboard'

export default function ProfilePage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const uiDispatch = useUIDispatch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const isRTL = i18n.dir() === 'rtl'



  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  const authUser = useAuthUser()

  const [userData, setUserData] = useState(() => ({
    id: authUser.id,
    name: authUser.full_name || t('profile.user'),
    email: authUser.email || '',
    avatar_url: authUser.avatar_url || '',
    phone: authUser.phone || '',
    bio: authUser.bio || '',
  }))

  const userId = authUser.id
  const { data: currentUser, isLoading: isLoadingUser } = useUser(userId)
  const { data: userInboxes, isLoading: isLoadingInboxes } = useUserInboxes(userId)
  const { isPending: isUploading } = useUpdateUser()
  const activeInboxId = useUIState().activeInboxId

  // Update userData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserData({
        id: currentUser.id,
        name: currentUser.full_name || '',
        email: currentUser.email || '',
        avatar_url: currentUser.avatar_url || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
      })
      localStorage.setItem('userProfile', JSON.stringify(currentUser))
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [currentUser])

  const chatCapacity = useMemo(() => {
    const rawMax = (currentUser as any)?.max_concurrent_chats as number | string | undefined
    const rawCurrent = (currentUser as any)?.current_chat_count as number | string | undefined

    const maxParsed = rawMax != null ? Number(rawMax) : NaN
    const currentParsed = rawCurrent != null ? Number(rawCurrent) : NaN

    const max = Number.isFinite(maxParsed) && maxParsed > 0 ? maxParsed : undefined
    const current = Number.isFinite(currentParsed) && currentParsed >= 0 ? currentParsed : 0
    const percent = max != null ? Math.min(100, Math.max(0, (current / max) * 100)) : 0

    return { max, current, percent }
  }, [currentUser])

  const toggleTheme = () => {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', next)
  }

  const handleInboxSwitch = (inboxId: number) => {
    uiDispatch(setActiveInboxId(inboxId))
  }

  const handleAvatarUpdate = (url: string) => {
    const updatedUser = { ...userData, avatar_url: url }
    setUserData(updatedUser)
    localStorage.setItem('userProfile', JSON.stringify({ ...currentUser, avatar_url: url }))
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, avatar_url: url }))
  }

  if (isMobile) {
    return <MobileProfile />
  }

  if (isLoadingUser && !currentUser) {
    return <ProfileSkeleton />
  }

  return (
    <div className="h-screen text-xon-text-primary overflow-hidden bg-xon-surface">
      <SidebarProvider className="h-full min-h-0">
        <AppSidebar />
        <SidebarInset className="h-full min-h-0">
          <main className="min-h-0 flex-1 w-full flex flex-col bg-xon-surface overflow-hidden">
            <ProfileHeader theme={theme} toggleTheme={toggleTheme} />

            <div className="flex-1 overflow-y-auto xon-scrollbar-hidden">
              <div className="max-w-4xl mx-auto py-10 px-6 lg:px-8 space-y-8">
                <ProfileOverviewSection
                  userData={userData}
                  isUploading={isUploading}
                  onAvatarUpdate={handleAvatarUpdate}
                />
  

                <HomeAnalyticsDashboard />
                <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", isRTL && "rtl")}>
                  <div className="space-y-8">
                    <ChatCapacitySection chatCapacity={chatCapacity} />

                    <InboxesSection
                      userInboxes={userInboxes?.items}
                      isLoadingInboxes={isLoadingInboxes}
                      activeInboxId={activeInboxId}
                      onInboxSwitch={handleInboxSwitch}
                    />
                  </div>

                  <div className="space-y-8">
                    <AccountSettingsSection />
                    <LanguageSettingsSection />
                    <PasskeySection />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

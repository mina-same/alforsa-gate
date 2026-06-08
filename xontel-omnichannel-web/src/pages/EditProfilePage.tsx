import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthUser } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { useUpdateUser, useUser } from '@/api/users/hooks'
import { useUploadMedia } from '@/api/media/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Camera, User, Loader2 } from 'lucide-react'
import EditPhotoModal from '@/components/shared/EditPhotoModal'
import { timeZones } from '@/utils/dateUtils'

export default function EditProfilePage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const location = useLocation()
  const isRTL = i18n.dir() === 'rtl'
  const isMobile = useIsMobile()

  const authUser = useAuthUser()

  const [userData, setUserData] = useState(() => ({
    id: authUser.id,
    name: authUser.full_name || t('profile.user'),
    email: authUser.email || '',
    avatar_url: authUser.avatar_url || '',
    phone: authUser.phone || '',
    bio: authUser.bio || '',
    timezone: authUser.timezone || '',
  }))

  const userId = authUser.id
  const { data: currentUser, isLoading: isLoadingUser, refetch: refetchUser } = useUser(userId)
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia()

  useEffect(() => {
    if (currentUser) {
      setUserData({
        id: currentUser.id,
        name: currentUser.full_name || '',
        email: currentUser.email || '',
        avatar_url: currentUser.avatar_url || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        timezone: currentUser.timezone || '',
      })
      localStorage.setItem('userProfile', JSON.stringify(currentUser))
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [currentUser])

  const [formData, setFormData] = useState(() => ({
    full_name: userData.name,
    email: userData.email,
    phone: userData.phone,
    bio: userData.bio,
    timezone: userData.timezone,
  }))

  useEffect(() => {
    setFormData({
      full_name: userData.name,
      email: userData.email,
      phone: userData.phone,
      bio: userData.bio,
      timezone: userData.timezone,
    })
  }, [userData])

  const avatarSrc = useMemo(() => {
    return userData.avatar_url || ''
  }, [userData.avatar_url])

  const [editPhotoOpen, setEditPhotoOpen] = useState(false)
  const [editPhotoSrc, setEditPhotoSrc] = useState<string | null>(null)
  const [editPhotoFileName, setEditPhotoFileName] = useState<string>('avatar.jpg')
  const newAvatarObjectUrlRef = useRef<string | null>(null)
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setEditPhotoSrc(avatarSrc || null)
  }, [avatarSrc])

  useEffect(() => {
    return () => {
      if (newAvatarObjectUrlRef.current) {
        URL.revokeObjectURL(newAvatarObjectUrlRef.current)
        newAvatarObjectUrlRef.current = null
      }
    }
  }, [])

  const handleSave = () => {
    updateUser(
      {
        id: userId,
        data: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || undefined,
          bio: formData.bio || undefined,
          timezone: formData.timezone || undefined,
        },
      },
      {
        onSuccess: () => {
          refetchUser()
          const next = {
            ...userData,
            name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            timezone: formData.timezone,
          }
          setUserData(next)
          navigate('/profile')
        },
        onError: (error: any) => {
          alert(
            t('profile.update_error', { defaultValue: 'Failed to update profile' }) +
            (error?.response?.data?.detail ? `: ${error.response.data.detail}` : '')
          )
        },
      }
    )
  }

  const handleOpenEditPhoto = () => {
    if (!avatarSrc) return
    setEditPhotoFileName('avatar.jpg')
    setEditPhotoSrc(avatarSrc)
    setEditPhotoOpen(true)
  }

  const handlePickNewAvatar = () => {
    avatarFileInputRef.current?.click()
  }

  const handleNewAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(t('profile.avatar.invalid_file', { defaultValue: 'Please select an image file' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('profile.avatar.file_too_large', { defaultValue: 'File size must be less than 5MB' }))
      return
    }

    if (newAvatarObjectUrlRef.current) {
      URL.revokeObjectURL(newAvatarObjectUrlRef.current)
      newAvatarObjectUrlRef.current = null
    }

    const url = URL.createObjectURL(file)
    newAvatarObjectUrlRef.current = url
    setEditPhotoFileName(file.name || 'avatar.jpg')
    setEditPhotoSrc(url)
    setEditPhotoOpen(true)
  }

  const handleSaveEditedPhoto = (file: File) => {
    uploadMedia(
      { file },
      {
        onSuccess: (response) => {
          updateUser(
            { id: userId, data: { avatar_url: response.url } },
            {
              onSuccess: () => {
                refetchUser()
                const updatedUser = { ...userData, avatar_url: response.url }
                setUserData(updatedUser)
                localStorage.setItem(
                  'userProfile',
                  JSON.stringify({ ...currentUser, avatar_url: response.url })
                )
                localStorage.setItem(
                  'currentUser',
                  JSON.stringify({ ...currentUser, avatar_url: response.url })
                )
                setEditPhotoOpen(false)
              },
              onError: () => {
                alert(
                  t('profile.avatar.upload_error', {
                    defaultValue: 'Failed to upload image. Please try again.',
                  })
                )
              },
            }
          )
        },
        onError: (error: any) => {
          alert(
            t('profile.avatar.upload_error', {
              defaultValue: 'Failed to upload image. Please try again.',
            }) + (error?.message ? `: ${error.message}` : '')
          )
        },
      }
    )
  }

  const Header = (
    <header className="sticky top-0 z-40 h-16 border-b border-xon-surface-outline bg-xon-surface md:bg-xon-surface/80 md:backdrop-blur-lg flex items-center justify-between px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            if (location.key) {
              navigate(-1)
            } else {
              navigate('/profile')
            }
          }}
          className="p-2 rounded-lg hover:bg-xon-surface-container-hover transition-colors text-xon-text-primary"
          title={t('common.back', { defaultValue: 'Back' })}
        >
          {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </button>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-xon-text-primary truncate text-center justify-center items-center flex text-center">
            {t('profile.edit_profile', { defaultValue: 'Edit Profile' })}
          </h2>
        </div>
      </div>
      <div className="w-10" />
    </header>
  )

  const Content = (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <section className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-xon-surface-outline">
          <h3 className="font-semibold text-xon-text-primary">
            {t('profile.avatar.title', { defaultValue: 'Profile Picture' })}
          </h3>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                if (avatarSrc) handleOpenEditPhoto()
                else handlePickNewAvatar()
              }}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-xon-surface shadow-md bg-xon-surface-container-hover flex items-center justify-center"
              title={t('profile.avatar.preview', { defaultValue: 'Preview' })}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={userData.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-xon-text-secondary" />
              )}
            </button>

            <button
              type="button"
              onClick={handlePickNewAvatar}
              disabled={isUploading || isUpdating}
              className={`absolute bottom-1 right-1 bg-xon-primary text-xon-primary-on w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-4 border-xon-surface  transition-all opacity-100
                }`}
              title={t('profile.avatar.change', { defaultValue: 'Change photo' })}
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>

            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleNewAvatarSelected}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-xon-text-primary">
              {t('profile.avatar.subtitle', { defaultValue: 'Upload a new photo' })}
            </p>
            <p className="text-xs text-xon-text-secondary mt-1">
              {t('profile.avatar.hint', { defaultValue: 'JPG, GIF or PNG. Max size of 5MB' })}
            </p>
          </div>
        </div>
      </section>

      <EditPhotoModal
        open={editPhotoOpen}
        onOpenChange={setEditPhotoOpen}
        imageSrc={editPhotoSrc}
        title={t('profile.edit_photo', { defaultValue: 'Edit Photo' })}
        description={t('profile.edit_photo_description', { defaultValue: 'Crop and rotate before uploading.' })}
        isSaving={isUploading || isUpdating}
        fileName={editPhotoFileName}
        onSave={handleSaveEditedPhoto}
      />

      <section className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-xon-surface-outline">
          <h3 className="font-semibold text-xon-text-primary">
            {t('profile.personal_information', { defaultValue: 'Personal Information' })}
          </h3>
        </div>

        <div className="p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name" className="text-xon-text-primary">
                {t('profile.full_name', { defaultValue: 'Full Name' })}
              </Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_email" className="text-xon-text-primary">
                {t('profile.email', { defaultValue: 'Email' })}
              </Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_phone" className="text-xon-text-primary">
                {t('profile.phone', { defaultValue: 'Phone' })}
              </Label>
              <Input
                id="edit_phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_timezone" className="text-xon-text-primary">
                {t('profile.timezone', { defaultValue: 'Timezone' })}
              </Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary focus-visible:ring-xon-primary">
                  <SelectValue placeholder={t('profile.select_timezone', { defaultValue: 'Select timezone' })} />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit_bio" className="text-xon-text-primary">
                {t('profile.bio', { defaultValue: 'Bio' })}
              </Label>
              <textarea
                id="edit_bio"
                className="flex min-h-[96px] w-full rounded-md border border-xon-surface-outline bg-xon-surface-container-hover px-3 py-2 text-sm shadow-sm text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-xon-primary disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>
          </form>
        </div>
      </section>

      <div className="hidden md:flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-xon-primary text-xon-primary-on hover:opacity-90"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('profile.saving', { defaultValue: 'Saving...' })}
            </>
          ) : (
            t('profile.save_changes', { defaultValue: 'Save Changes' })
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover"
        >
          {t('profile.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </div>
  )

  const MobileActions = (
    <div className="md:hidden fixed left-0 right-0 bottom-24 z-40 bg-xon-surface-container/95 backdrop-blur border-t border-xon-surface-outline px-4 py-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          className="flex-1 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover"
        >
          {t('profile.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="flex-1 bg-xon-primary text-xon-primary-on hover:opacity-90"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('profile.saving', { defaultValue: 'Saving...' })}
            </>
          ) : (
            t('profile.save_changes', { defaultValue: 'Save Changes' })
          )}
        </Button>
      </div>
    </div>
  )

  const Body = (
    <main className="min-h-0 flex-1 w-full flex flex-col bg-xon-surface overflow-hidden">
      {Header}
      <div className="flex-1 overflow-y-auto bg-xon-surface">{Content}</div>
    </main>
  )

  if (isLoadingUser && !currentUser) {
    return (
      <div className="h-screen text-xon-text-primary overflow-hidden bg-xon-surface">
        {isMobile ? (
          <div className="flex flex-col h-[100dvh] overflow-hidden">
            {Header}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="bg-xon-surface-container border border-xon-surface-outline rounded-2xl p-6">
                  <div className="flex items-center justify-center">
                    <Skeleton variant="circle" className="h-32 w-32" />
                  </div>
                </div>
                <div className="bg-xon-surface-container border border-xon-surface-outline rounded-2xl p-6 space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            </div>
            <MobileBottomNav />
          </div>
        ) : (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{Body}</SidebarInset>
          </SidebarProvider>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen text-xon-text-primary overflow-hidden bg-xon-surface">
      {isMobile ? (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-xon-surface">
          {Header}
          <div className="flex-1 overflow-y-auto bg-xon-surface pb-28">{Content}</div>
          {MobileActions}
          <MobileBottomNav />
        </div>
      ) : (
        <SidebarProvider className="h-full min-h-0">
          <AppSidebar />
          <SidebarInset className="h-full min-h-0">{Body}</SidebarInset>
        </SidebarProvider>
      )}
    </div>
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthUser, useSetAuthUser } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useUpdateUser, useUser } from '@/api/users/hooks'
import { useUploadMedia } from '@/api/media/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Camera, User, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import EditPhotoModal from '@/components/shared/EditPhotoModal'
import { timeZones } from '@/utils/dateUtils'

export default function EditProfileForm() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const location = useLocation()
  const isRTL = i18n.dir() === 'rtl'
  const isMobile = useIsMobile()

  const authUser = useAuthUser()
  const setAuthUser = useSetAuthUser()

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
  const { data: currentUser, refetch: refetchUser } = useUser(userId)
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

  const avatarSrc = useMemo(() => userData.avatar_url || '', [userData.avatar_url])

  type FormErrors = { full_name?: string; email?: string; phone?: string }
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!formData.full_name.trim())
      next.full_name = t('profile.validation.name_required', { defaultValue: 'Full name is required' })
    if (!formData.email.trim())
      next.email = t('profile.validation.email_required', { defaultValue: 'Email is required' })
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      next.email = t('profile.validation.email_invalid', { defaultValue: 'Enter a valid email address' })
    if (!formData.phone.trim())
      next.phone = t('profile.validation.phone_required', { defaultValue: 'Phone number is required' })
    else if (!/^\+?[\d\s\-().]{7,20}$/.test(formData.phone.trim()))
      next.phone = t('profile.validation.phone_invalid', { defaultValue: 'Enter a valid phone number' })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const [editPhotoOpen, setEditPhotoOpen] = useState(false)
  const [editPhotoSrc, setEditPhotoSrc] = useState<string | null>(null)
  const [editPhotoFileName, setEditPhotoFileName] = useState<string>('avatar.jpg')
  const newAvatarObjectUrlRef = useRef<string | null>(null)
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { setEditPhotoSrc(avatarSrc || null) }, [avatarSrc])

  useEffect(() => {
    return () => {
      if (newAvatarObjectUrlRef.current) {
        URL.revokeObjectURL(newAvatarObjectUrlRef.current)
        newAvatarObjectUrlRef.current = null
      }
    }
  }, [])

  const handleSave = () => {
    if (!validate()) return
    updateUser(
      { id: userId, data: { full_name: formData.full_name, email: formData.email, phone: formData.phone || undefined, bio: formData.bio || undefined, timezone: formData.timezone || undefined } },
      {
        onSuccess: () => {
          refetchUser()
          const updated = { ...authUser, full_name: formData.full_name, email: formData.email, phone: formData.phone, bio: formData.bio, timezone: formData.timezone }
          setAuthUser(updated)
          setUserData({ ...userData, name: formData.full_name, email: formData.email, phone: formData.phone, bio: formData.bio, timezone: formData.timezone })
          navigate('/profile')
        },
        onError: (error: any) => {
          alert(t('profile.update_error', { defaultValue: 'Failed to update profile' }) + (error?.response?.data?.detail ? `: ${error.response.data.detail}` : ''))
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

  const handlePickNewAvatar = () => avatarFileInputRef.current?.click()

  const handleNewAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { alert(t('profile.avatar.invalid_file', { defaultValue: 'Please select an image file' })); return }
    if (file.size > 5 * 1024 * 1024) { alert(t('profile.avatar.file_too_large', { defaultValue: 'File size must be less than 5MB' })); return }
    if (newAvatarObjectUrlRef.current) { URL.revokeObjectURL(newAvatarObjectUrlRef.current); newAvatarObjectUrlRef.current = null }
    const url = URL.createObjectURL(file)
    newAvatarObjectUrlRef.current = url
    setEditPhotoFileName(file.name || 'avatar.jpg')
    setEditPhotoSrc(url)
    setEditPhotoOpen(true)
  }

  const handleSaveEditedPhoto = (file: File) => {
    uploadMedia({ file }, {
      onSuccess: (response) => {
        updateUser({ id: userId, data: { avatar_url: response.url } }, {
          onSuccess: () => {
            refetchUser()
            const updatedUser = { ...userData, avatar_url: response.url }
            setUserData(updatedUser)
            localStorage.setItem('userProfile', JSON.stringify({ ...currentUser, avatar_url: response.url }))
            localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, avatar_url: response.url }))
            setEditPhotoOpen(false)
          },
          onError: () => alert(t('profile.avatar.upload_error', { defaultValue: 'Failed to upload image. Please try again.' })),
        })
      },
      onError: (error: any) => alert(t('profile.avatar.upload_error', { defaultValue: 'Failed to upload image. Please try again.' }) + (error?.message ? `: ${error.message}` : '')),
    })
  }

  return (
    <div className="h-full flex flex-col bg-xon-surface overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 py-[18px] shadow-sm bg-xon-surface-container flex items-center px-4 gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => location.key ? navigate(-1) : navigate('/profile')}
          className="p-1 rounded-lg hover:bg-xon-surface-container-hover transition-colors text-xon-text-primary"
        >
          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        <h2 className="text-base font-semibold text-xon-text-primary">
          {t('profile.edit_profile', { defaultValue: 'Edit Profile' })}
        </h2>
      </header>

      {/* Scrollable form */}
      <div className={`flex-1 overflow-y-auto xon-scrollbar-hidden bg-xon-surface ${isMobile ? 'pb-28' : ''}`}>
        <div className=" mx-auto p-2 space-y-3">

          {/* Profile Picture */}
          <section className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden">
            <div className="px-6 py-4 border-b border-xon-surface-outline">
              <h3 className="font-semibold text-xon-text-primary">
                {t('profile.avatar.title', { defaultValue: 'Profile Picture' })}
              </h3>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => avatarSrc ? handleOpenEditPhoto() : handlePickNewAvatar()}
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-xon-surface shadow-md bg-xon-surface-container-hover flex items-center justify-center"
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
                  className="absolute bottom-1 right-1 bg-xon-primary text-xon-primary-on w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-4 border-xon-surface"
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
                <input ref={avatarFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleNewAvatarSelected} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-xon-text-primary">{t('profile.avatar.subtitle', { defaultValue: 'Upload a new photo' })}</p>
                <p className="text-xs text-xon-text-secondary mt-1">{t('profile.avatar.hint', { defaultValue: 'JPG, GIF or PNG. Max size of 5MB' })}</p>
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

          {/* Personal Information */}
          <section className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden">
            <div className="px-6 py-4 border-b border-xon-surface-outline">
              <h3 className="font-semibold text-xon-text-primary">
                {t('profile.personal_information', { defaultValue: 'Personal Information' })}
              </h3>
            </div>
            <div className="p-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1">
                  <Label htmlFor="edit_full_name" className="text-xon-text-primary">{t('profile.full_name', { defaultValue: 'Full Name' })}</Label>
                  <Input
                    id="edit_full_name"
                    value={formData.full_name}
                    onChange={(e) => { setFormData({ ...formData, full_name: e.target.value }); setErrors(prev => ({ ...prev, full_name: undefined })) }}
                    className={`bg-xon-surface-container-hover border text-xon-text-primary focus-visible:ring-xon-primary ${errors.full_name ? 'border-xon-text-red focus-visible:ring-xon-text-red' : 'border-xon-surface-outline'}`}
                  />
                  {errors.full_name && <p className="text-xs text-xon-text-red">{errors.full_name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit_email" className="text-xon-text-primary">{t('profile.email', { defaultValue: 'Email' })}</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: undefined })) }}
                    className={`bg-xon-surface-container-hover border text-xon-text-primary focus-visible:ring-xon-primary ${errors.email ? 'border-xon-text-red focus-visible:ring-xon-text-red' : 'border-xon-surface-outline'}`}
                  />
                  {errors.email && <p className="text-xs text-xon-text-red">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit_phone" className="text-xon-text-primary">{t('profile.phone', { defaultValue: 'Phone' })}</Label>
                  <Input
                    id="edit_phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: undefined })) }}
                    className={`bg-xon-surface-container-hover border text-xon-text-primary focus-visible:ring-xon-primary ${errors.phone ? 'border-xon-text-red focus-visible:ring-xon-text-red' : 'border-xon-surface-outline'}`}
                  />
                  {errors.phone && <p className="text-xs text-xon-text-red">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_timezone" className="text-xon-text-primary">{t('profile.timezone', { defaultValue: 'Timezone' })}</Label>
                  <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                    <SelectTrigger className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary focus-visible:ring-xon-primary">
                      <SelectValue placeholder={t('profile.select_timezone', { defaultValue: 'Select timezone' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit_bio" className="text-xon-text-primary">{t('profile.bio', { defaultValue: 'Bio' })}</Label>
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

          {/* Desktop save actions */}
          <div className="flex items-center gap-3 pb-2">
            <Button onClick={handleSave} disabled={isUpdating} className="bg-xon-primary text-xon-primary-on hover:opacity-90">
              {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('profile.saving', { defaultValue: 'Saving...' })}</> : t('profile.save_changes', { defaultValue: 'Save Changes' })}
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile')} className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover">
              {t('profile.cancel', { defaultValue: 'Cancel' })}
            </Button>
          </div>

        </div>
      </div>

      {/* Mobile floating actions */}
      {isMobile && (
        <div className="fixed left-0 right-0 bottom-16 z-40 bg-xon-surface-container/95 backdrop-blur border-t border-xon-surface-outline px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/profile')} className="flex-1 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover">
              {t('profile.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button onClick={handleSave} disabled={isUpdating} className="flex-1 bg-xon-primary text-xon-primary-on hover:opacity-90">
              {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('profile.saving', { defaultValue: 'Saving...' })}</> : t('profile.save_changes', { defaultValue: 'Save Changes' })}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

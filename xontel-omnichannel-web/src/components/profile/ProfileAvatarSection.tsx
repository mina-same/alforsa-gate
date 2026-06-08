import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUploadMedia } from '@/api/media/hooks'
import Cropper, { type Area } from 'react-easy-crop'
import { Camera, Eye, Pencil } from 'lucide-react'

interface UserData {
  id: number
  name: string
  email: string
  avatar_url: string
  phone: string
  bio: string
}

interface ProfileAvatarSectionProps {
  userData: UserData
  isUploading: boolean
  isEditMode?: boolean
  onAvatarUpdate: (url: string) => void
}

export default function ProfileAvatarSection({
  userData,
  isUploading,
  isEditMode = false,
  onAvatarUpdate,
}: ProfileAvatarSectionProps) {
  const { t } = useTranslation(['chat', 'common'])
  const { mutate: uploadMedia } = useUploadMedia()

  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false)
  const [avatarEditOpen, setAvatarEditOpen] = useState(false)
  const [avatarEditSrc, setAvatarEditSrc] = useState<string | null>(null)
  const [avatarEditFile, setAvatarEditFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
  }

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  const getCroppedBlob = async (imageSrc: string, pixelCrop: Area, rotation = 0) => {
    // Remote URLs taint the canvas — fetch as a blob URL first to avoid CORS errors
    let src = imageSrc
    let tempBlobUrl: string | null = null
    if (!imageSrc.startsWith('blob:') && !imageSrc.startsWith('data:')) {
      const resp = await fetch(imageSrc)
      const blob = await resp.blob()
      src = URL.createObjectURL(blob)
      tempBlobUrl = src
    }

    try {
      const image = await createImage(src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')

      const rotRad = getRadianAngle(rotation)
      const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

      canvas.width = bBoxWidth
      canvas.height = bBoxHeight

      ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
      ctx.rotate(rotRad)
      ctx.translate(-image.width / 2, -image.height / 2)
      ctx.drawImage(image, 0, 0)

      const croppedCanvas = document.createElement('canvas')
      const croppedCtx = croppedCanvas.getContext('2d')
      if (!croppedCtx) throw new Error('Canvas not supported')

      croppedCanvas.width = pixelCrop.width
      croppedCanvas.height = pixelCrop.height

      croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      return await new Promise<Blob>((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image'))
            return
          }
          resolve(blob)
        }, 'image/jpeg')
      })
    } finally {
      if (tempBlobUrl) URL.revokeObjectURL(tempBlobUrl)
    }
  }

  const uploadAvatarFile = (file: File) => {
    try {
      uploadMedia(
        { file },
        {
          onSuccess: (response) => {
            onAvatarUpdate(response.url)
          },
          onError: (error: any) => {
            alert(
              t('profile.avatar.upload_error', {
                defaultValue: 'Failed to upload image. Please try again.',
              }) + (error.message ? `: ${error.message}` : '')
            )
          },
        }
      )
    } catch (error) {
      console.error('Avatar upload error:', error)
    }
  }

  const closeAvatarEditor = useCallback(() => {
    setAvatarEditOpen(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    setAvatarEditFile(null)
    setAvatarEditSrc((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const url = URL.createObjectURL(file)
    setAvatarEditFile(file)
    setAvatarEditSrc(url)
    setAvatarEditOpen(true)
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSaveEditedAvatar = useCallback(async () => {
    if (!avatarEditSrc || !croppedAreaPixels) return
    try {
      const blob = await getCroppedBlob(avatarEditSrc, croppedAreaPixels, rotation)
      const croppedFile = new File([blob], avatarEditFile?.name || 'avatar.jpg', { type: blob.type })
      uploadAvatarFile(croppedFile)
      closeAvatarEditor()
    } catch (e) {
      alert(
        t('profile.avatar.edit_error', {
          defaultValue: 'Failed to edit image. Please try uploading a new photo.',
        })
      )
    }
  }, [avatarEditSrc, croppedAreaPixels, avatarEditFile, rotation, closeAvatarEditor])

  return (
    <>
      <Dialog open={avatarPreviewOpen} onOpenChange={setAvatarPreviewOpen}>
        <div className="relative group">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-xon-primary/10 shadow-lg transition-all group-hover:shadow-xl group-hover:border-xon-primary/20">
              <AvatarImage src={userData.avatar_url} alt={userData.name} />
              <AvatarFallback className="text-3xl font-bold bg-xon-primary/10 text-xon-primary">
                {userData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {userData.avatar_url ? (
              <button
                type="button"
                onClick={() => setAvatarPreviewOpen(true)}
                className="absolute inset-0 rounded-full bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                aria-label={t('profile.view_avatar', { defaultValue: 'View profile photo' })}
              >
                <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </button>
            ) : null}

            {isEditMode && (
              <>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 bg-xon-primary text-xon-primary-on p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 group-hover:scale-110 cursor-pointer border border-xon-primary/20"
                  title={t('profile.avatar.edit_title', { defaultValue: 'Upload new photo' })}
                >
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </>
            )}
          </div>

          {isUploading && (
            <div className="mt-3 text-center">
              <p className="text-xs text-xon-text-secondary animate-pulse">
                {t('profile.uploading', { defaultValue: 'Uploading...' })}
              </p>
            </div>
          )}
        </div>

        <DialogContent className="bg-xon-surface-container border border-xon-surface-outline text-xon-text-primary max-w-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xon-text-primary text-xl">
              {t('profile.photo', { defaultValue: 'Profile Photo' })}
            </DialogTitle>
            <DialogDescription className="text-xon-text-secondary">
              {t('profile.photo_description', { defaultValue: 'Preview your profile picture.' })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <div />
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                setAvatarPreviewOpen(false)
                setAvatarEditFile(null)
                setAvatarEditSrc(userData.avatar_url)
                setAvatarEditOpen(true)
              }}
              className="border-xon-primary/50 text-xon-primary hover:bg-xon-primary/10 rounded-lg flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              <span>{t('profile.edit_avatar', { defaultValue: 'Edit Photo' })}</span>
            </Button> */}
          </div>
          <div className="py-4">
            <div className="w-full flex items-center justify-center rounded-xl overflow-hidden bg-xon-surface-hover">
              <img
                src={userData.avatar_url}
                alt={userData.name}
                className="max-h-[70vh] w-auto"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={avatarEditOpen}
        onOpenChange={(open) => {
          if (!open) closeAvatarEditor()
          else setAvatarEditOpen(true)
        }}
      >
        <DialogContent className="bg-xon-surface-container border border-xon-surface-outline text-xon-text-primary max-w-4xl shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xon-text-primary text-xl">
              {t('profile.edit_photo', { defaultValue: 'Edit Photo' })}
            </DialogTitle>
            <DialogDescription className="text-xon-text-secondary">
              {t('profile.edit_photo_description', { defaultValue: 'Crop and rotate before uploading.' })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div className="relative w-full h-[420px] rounded-2xl border-2 border-xon-surface-outline overflow-hidden bg-xon-surface-hover shadow-inner">
                {avatarEditSrc ? (
                  <Cropper
                    image={avatarEditSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between text-xs text-xon-text-secondary px-1">
                <span className="flex items-center gap-1">
                  <span>👆</span> {t('profile.drag_to_adjust', { defaultValue: 'Drag to position' })}
                </span>
                <span className="flex items-center gap-1">
                  🔍 {t('profile.scroll_to_zoom', { defaultValue: 'Scroll to zoom' })}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-xon-surface-outline bg-gradient-to-b from-xon-surface to-xon-surface-container p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-xon-text-primary">
                    {t('profile.adjustments', { defaultValue: 'Adjustments' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary mt-1">
                    {t('profile.fine_tune', { defaultValue: 'Fine-tune your image' })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs hover:bg-xon-surface-hover"
                  onClick={() => {
                    setCrop({ x: 0, y: 0 })
                    setZoom(1)
                    setRotation(0)
                  }}
                >
                  {t('profile.reset', { defaultValue: 'Reset' })}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-xon-text-primary flex items-center gap-2">
                      🔍 {t('profile.zoom', { defaultValue: 'Zoom' })}
                    </label>
                    <span className="text-xs font-semibold text-xon-primary tabular-nums bg-xon-primary/10 px-2 py-1 rounded">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 accent-xon-primary rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-xon-text-primary flex items-center gap-2">
                      🔄 {t('profile.rotate', { defaultValue: 'Rotate' })}
                    </label>
                    <span className="text-xs font-semibold text-xon-primary tabular-nums bg-xon-primary/10 px-2 py-1 rounded">
                      {rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 accent-xon-primary rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t border-xon-surface-outline pt-4 space-y-2">
                <p className="text-xs font-medium text-xon-text-secondary mb-3">
                  {t('profile.quick_actions', { defaultValue: 'Quick Actions' })}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover text-xs rounded-lg transition-colors"
                    onClick={() => setRotation((r) => r - 90)}
                    title={t('profile.rotate_left_title', { defaultValue: 'Rotate 90 degrees left' })}
                  >
                    ↺ 90°
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover text-xs rounded-lg transition-colors"
                    onClick={() => setRotation((r) => r + 90)}
                    title={t('profile.rotate_right_title', { defaultValue: 'Rotate 90 degrees right' })}
                  >
                    ↻ 90°
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-xon-surface-outline">
            <Button
              type="button"
              variant="outline"
              onClick={closeAvatarEditor}
              className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover rounded-lg"
            >
              {t('profile.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditedAvatar}
              disabled={!avatarEditSrc || !croppedAreaPixels || isUploading}
              className="bg-gradient-to-r from-xon-primary to-xon-primary/80 text-xon-primary-on hover:from-xon-primary hover:to-xon-primary rounded-lg transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-xon-primary-on/30 border-t-xon-primary-on rounded-full animate-spin" />
                  <span>{t('profile.saving', { defaultValue: 'Saving...' })}</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  ✓ {t('profile.save', { defaultValue: 'Save' })}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

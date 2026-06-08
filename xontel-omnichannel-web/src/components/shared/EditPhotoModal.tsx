import React, { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Move, Mouse, RotateCcw, RotateCw } from 'lucide-react'

type EditPhotoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  title?: string
  description?: string
  isSaving?: boolean
  fileName?: string
  onSave: (file: File) => void
}

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

const getCroppedBlob = async (imageSrc: string, pixelCrop: Area, rotation = 0) => {
  const image = await createImage(imageSrc)
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

  return new Promise<Blob>((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create image'))
        return
      }
      resolve(blob)
    }, 'image/jpeg')
  })
}

export default function EditPhotoModal({
  open,
  onOpenChange,
  imageSrc,
  title = 'Edit Photo',
  description = 'Crop and rotate before uploading.',
  isSaving,
  fileName = 'photo.jpg',
  onSave,
}: EditPhotoModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCroppedAreaPixels(null)
    }
  }, [open])

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation)
    const file = new File([blob], fileName, { type: blob.type })
    onSave(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-xon-surface-container border border-xon-surface-outline text-xon-text-primary w-[95vw] max-w-[95vw] md:max-w-4xl p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[92dvh] [&>button]:text-xon-text-secondary [&>button:hover]:text-xon-text-primary">
        <style>{`
          input.edit-photo-range[type='range'] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
          }
          input.edit-photo-range[type='range']::-webkit-slider-runnable-track {
            width: 100%;
            height: 6px;
            cursor: pointer;
            background: #E5E7EB;
            border-radius: 999px;
          }
          .dark input.edit-photo-range[type='range']::-webkit-slider-runnable-track {
            background: #374151;
          }
          input.edit-photo-range[type='range']::-webkit-slider-thumb {
            height: 18px;
            width: 18px;
            border-radius: 999px;
            background: #0078D4;
            cursor: pointer;
            -webkit-appearance: none;
            margin-top: -6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          }
          input.edit-photo-range[type='range']::-moz-range-track {
            width: 100%;
            height: 6px;
            cursor: pointer;
            background: #E5E7EB;
            border-radius: 999px;
          }
          .dark input.edit-photo-range[type='range']::-moz-range-track {
            background: #374151;
          }
          input.edit-photo-range[type='range']::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 999px;
            background: #0078D4;
            cursor: pointer;
            border: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          }
        `}</style>
        <div className="flex flex-col max-h-[92dvh]">
          <div className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 md:px-8 md:pt-8 md:pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-xon-text-primary">{title}</h2>
              <p className="text-sm text-xon-text-secondary mt-1">{description}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 md:px-8 md:pb-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <div className="flex-1">
                <div className="relative aspect-square bg-xon-surface-hover rounded-xl overflow-hidden border border-xon-surface-outline group w-full max-w-[340px] sm:max-w-[420px] md:max-w-none mx-auto">
              {imageSrc ? (
                <img
                  alt="Background"
                  src={imageSrc}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px]"
                />
              ) : null}

              <div className="absolute inset-0">
                {imageSrc ? (
                  <Cropper
                    image={imageSrc}
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

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4/5 aspect-square border-2 border-white/50 rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.4)]" />
              </div>

              <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-between px-6 pointer-events-none">
                <div className="flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                  <Move className="h-4 w-4" />
                  Drag to position
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                  <Mouse className="h-4 w-4" />
                  Scroll to zoom
                </div>
              </div>
                </div>
              </div>

              <div className="w-full md:w-80 flex flex-col gap-4 md:gap-6">
                <div className="p-4 md:p-6 border border-xon-surface-outline rounded-2xl bg-xon-surface-hover/30">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-xon-text-secondary">Adjustments</h3>
                    <button
                      type="button"
                      className="text-xon-primary text-sm font-medium hover:underline"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mb-6 md:mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-sm font-medium text-xon-text-primary">Zoom</Label>
                      <span className="text-sm font-semibold text-xon-text-primary">{Math.round(zoom * 100)}%</span>
                    </div>
                <input
                  className="w-full edit-photo-range"
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
                  </div>

                  <div className="mb-6 md:mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-sm font-medium text-xon-text-primary">Rotate</Label>
                      <span className="text-sm font-semibold text-xon-text-primary">{rotation}°</span>
                    </div>
                <input
                  className="w-full edit-photo-range"
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-xon-text-primary bg-xon-surface-container border border-xon-surface-outline rounded-lg hover:bg-xon-surface-hover transition-all shadow-sm active:scale-[0.98]"
                      onClick={() => setRotation((r) => r - 90)}
                    >
                      <RotateCcw className="h-5 w-5" />
                      -90°
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-xon-text-primary bg-xon-surface-container border border-xon-surface-outline rounded-lg hover:bg-xon-surface-hover transition-all shadow-sm active:scale-[0.98]"
                      onClick={() => setRotation((r) => r + 90)}
                    >
                      <RotateCw className="h-5 w-5" />
                      +90°
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex gap-3 md:mt-auto pt-2 md:pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 px-6 py-2.5 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-hover rounded-lg"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 px-6 py-2.5 bg-xon-primary text-xon-primary-on font-medium rounded-lg hover:opacity-90 shadow-lg"
                    onClick={handleSave}
                    disabled={!imageSrc || !croppedAreaPixels || !!isSaving}
                  >
                    {isSaving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden sticky bottom-0 left-0 right-0 border-t border-xon-surface-outline bg-xon-surface-container/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-6 py-2.5 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-hover rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 px-6 py-2.5 bg-xon-primary text-xon-primary-on font-medium rounded-lg hover:opacity-90 shadow-lg"
                onClick={handleSave}
                disabled={!imageSrc || !croppedAreaPixels || !!isSaving}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

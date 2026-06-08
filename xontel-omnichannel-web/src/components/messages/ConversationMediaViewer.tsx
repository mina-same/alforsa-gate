import React, { useEffect, useMemo, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, Play, Reply as ReplyIcon, SmilePlus, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useIsMobile } from '@/hooks/use-mobile'
import { useConversationMedia } from '@/api/conversations/hooks'
import type { ConversationMediaItem } from '@/api/conversations/types'
import { useCreateMessage, useDeleteMessage } from '@/api/messages/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { getThumbnailUrl, normalizeMediaUrl } from '@/utils/urlHelper'
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react'

interface ConversationMediaViewerProps {
  conversationId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMessageId?: number | null
  items?: ConversationMediaItem[]
  onReply?: (messageId: number) => void
  reactionsByMessageId?: Record<number, Array<{ emoji: string; numericId?: number; isMine?: boolean }>>
}

export default function ConversationMediaViewer({
  conversationId,
  open,
  onOpenChange,
  initialMessageId,
  items,
  onReply,
  reactionsByMessageId,
}: ConversationMediaViewerProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const isMobile = useIsMobile()
  const isDarkMode = document.documentElement.classList.contains('dark')

  const queryClient = useQueryClient()

  const createMessageMutation = useCreateMessage()
  const deleteMessageMutation = useDeleteMessage()

  const [reactionPickerOpen, setReactionPickerOpen] = useState(false)
  const [mobileReactionOpen, setMobileReactionOpen] = useState(false)
  const [mobileReactionValue, setMobileReactionValue] = useState('')
  const [localMyReaction, setLocalMyReaction] = useState<string | null>(null)
  const [localMyReactionId, setLocalMyReactionId] = useState<number | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const [hasCopied, setHasCopied] = useState(false)

  // --- State ---
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [showControls, setShowControls] = useState(true) // Start with controls visible

  // Transform / Gesture State
  const [imageScale, setImageScale] = useState(1)
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
  const [dismissOffset, setDismissOffset] = useState(0) // For vertical drag-to-dismiss
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const activeVideoRef = useRef<HTMLVideoElement | null>(null)
  const mediaContainerRef = useRef<HTMLDivElement | null>(null)
  const activeImageRef = useRef<HTMLImageElement | null>(null)
  const imageBaseSizeRef = useRef<{ w: number; h: number } | null>(null)

  // Gesture Refs
  const viewerTouchStartXRef = useRef<number | null>(null)
  const viewerTouchStartYRef = useRef<number | null>(null)
  const viewerPinchStartDistRef = useRef<number | null>(null)
  const viewerPinchStartScaleRef = useRef<number>(1)
  const lastTapAtRef = useRef<number>(0)
  const imageDragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const dismissDragStartRef = useRef<{ y: number, startOffset: number } | null>(null)

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  const getMaxOffset = (scale: number) => {
    const base = imageBaseSizeRef.current
    const container = mediaContainerRef.current
    if (!base || !container) return { x: 0, y: 0 }

    const rect = container.getBoundingClientRect()
    const scaledW = base.w * scale
    const scaledH = base.h * scale
    const maxX = Math.max(0, (scaledW - rect.width) / 2)
    const maxY = Math.max(0, (scaledH - rect.height) / 2)
    return { x: maxX, y: maxY }
  }

  const clampOffset = (offset: { x: number; y: number }, scale: number) => {
    const max = getMaxOffset(scale)
    return {
      x: clamp(offset.x, -max.x, max.x),
      y: clamp(offset.y, -max.y, max.y),
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes <= 0) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
    const value = bytes / Math.pow(1024, i)
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
  }

  const toMs = (s: string) => {
    const t = new Date(s).getTime()
    return Number.isFinite(t) ? t : 0
  }

  const enabled = open && !!conversationId && !items

  const { data: imagePngMedia = [] } = useConversationMedia(conversationId, 'image/png', enabled)
  const { data: imageJpegMedia = [] } = useConversationMedia(conversationId, 'image/jpeg', enabled)
  const { data: imageMedia = [] } = useConversationMedia(conversationId, 'image', enabled)
  const { data: videoMp4Media = [] } = useConversationMedia(conversationId, 'video', enabled)
  const { data: documentMedia = [] } = useConversationMedia(conversationId, 'document', enabled)

  const isImageLike = (item: ConversationMediaItem) => {
    const t = String(item.media_type || '').toLowerCase()
    if (t === 'image' || t.startsWith('image/')) return true
    const name = String(item.media_name || '').toLowerCase()
    const url = String(item.media_url || '').toLowerCase()
    const raw = name || url
    return raw.endsWith('.png') || raw.endsWith('.jpg') || raw.endsWith('.jpeg') || raw.endsWith('.webp') || raw.endsWith('.gif')
  }

  const combinedMedia: ConversationMediaItem[] = useMemo(() => {
    if (items) return items
    const map = new Map<number, ConversationMediaItem>()
    for (const item of [...imagePngMedia, ...imageJpegMedia, ...imageMedia, ...videoMp4Media, ...documentMedia.filter(isImageLike)]) {
      map.set(item.message_id, item)
    }
    return Array.from(map.values())
  }, [items, imageJpegMedia, imageMedia, imagePngMedia, videoMp4Media, documentMedia])

  const sortedCombinedMedia: ConversationMediaItem[] = useMemo(() => {
    return [...combinedMedia].sort((a, b) => toMs(b.created_at) - toMs(a.created_at))
  }, [combinedMedia])

  const activeViewerItem = sortedCombinedMedia[activeMediaIndex]
  const isActiveVideo = (activeViewerItem?.media_type || '').toLowerCase().startsWith('video')
  const canCopyActiveImage = !!activeViewerItem?.media_url && !isActiveVideo

  const activeReactions = useMemo(() => {
    const id = activeViewerItem?.message_id
    if (!id || !reactionsByMessageId) return [] as Array<{ emoji: string; numericId?: number; isMine?: boolean }>
    return reactionsByMessageId[id] || []
  }, [activeViewerItem?.message_id, reactionsByMessageId])

  const myReactionFromProps = useMemo(() => {
    const mine = activeReactions.find((r) => r.isMine)
    return {
      emoji: mine?.emoji || null,
      id: typeof mine?.numericId === 'number' ? mine.numericId : null,
    }
  }, [activeReactions])

  useEffect(() => {
    setLocalMyReaction(myReactionFromProps.emoji)
    setLocalMyReactionId(myReactionFromProps.id)
  }, [activeViewerItem?.message_id, myReactionFromProps.emoji, myReactionFromProps.id])

  const activeReactionsBadge = useMemo(() => {
    if (!activeReactions.length) return null
    const first = activeReactions[0]?.emoji
    if (!first) return null
    const extra = activeReactions.length - 1
    return { emoji: first, extra }
  }, [activeReactions])

  const goPrevMedia = () => setActiveMediaIndex((i) => Math.max(0, i - 1))
  const goNextMedia = () => setActiveMediaIndex((i) => Math.min(sortedCombinedMedia.length - 1, i + 1))

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (isRTL) {
          goNextMedia()
        } else {
          goPrevMedia()
        }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (isRTL) {
          goPrevMedia()
        } else {
          goNextMedia()
        }
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }

      if (e.key === ' ' || e.code === 'Space') {
        const current = sortedCombinedMedia[activeMediaIndex]
        const isVideo = (current?.media_type || '').toLowerCase().startsWith('video')
        if (!isVideo) return
        e.preventDefault()

        const v = activeVideoRef.current
        if (!v) return
        if (v.paused) {
          void v.play()
        } else {
          v.pause()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isRTL, activeMediaIndex, sortedCombinedMedia])

  // Reset state when opening or changing item
  useEffect(() => {
    if (!open) return

    setImageScale(1)
    setImageOffset({ x: 0, y: 0 })
    setDismissOffset(0)
    imageDragStartRef.current = null
    viewerPinchStartDistRef.current = null
    viewerPinchStartScaleRef.current = 1
    imageBaseSizeRef.current = null
    setShowControls(true)
  }, [open, activeViewerItem?.message_id])

  useEffect(() => {
    if (!open) return
    if (!initialMessageId) return

    const idx = sortedCombinedMedia.findIndex((m) => m.message_id === initialMessageId)
    setActiveMediaIndex(Math.max(0, idx))
  }, [open, initialMessageId, sortedCombinedMedia])

  useEffect(() => {
    if (!open) return
    if (activeMediaIndex <= sortedCombinedMedia.length - 1) return
    setActiveMediaIndex(Math.max(0, sortedCombinedMedia.length - 1))
  }, [open, activeMediaIndex, sortedCombinedMedia.length])

  const visibleThumbnails = useMemo(() => {
    const total = sortedCombinedMedia.length
    const size = isMobile ? 5 : 9
    if (total <= size) return { start: 0, items: sortedCombinedMedia }

    const half = Math.floor(size / 2)
    let start = Math.max(0, activeMediaIndex - half)
    let end = start + size
    if (end > total) {
      end = total
      start = total - size
    }
    return { start, items: sortedCombinedMedia.slice(start, end) }
  }, [sortedCombinedMedia, activeMediaIndex, isMobile])

  const downloadCurrent = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeViewerItem?.media_url) return
    const url = normalizeMediaUrl(activeViewerItem.media_url)
    try {
      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = activeViewerItem.media_name || 'file'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(url, '_blank')
    }
  }

  const openCurrentInNewTab = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeViewerItem?.media_url) return
    const url = normalizeMediaUrl(activeViewerItem.media_url)
    try {
      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
    } catch {
      window.open(url, '_blank')
    }
  }

  const copyCurrentImage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canCopyActiveImage) return

    try {
      const url = normalizeMediaUrl(activeViewerItem.media_url)
      // Ensure absolute URL so it works when pasted in a browser address bar
      const absoluteUrl = /^https?:\/\//i.test(url)
        ? url
        : `${window.location.origin}${url.startsWith('/') ? url : '/' + url}`

      if (!window.isSecureContext || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
        await navigator.clipboard?.writeText(absoluteUrl)
        setHasCopied(true)
        window.setTimeout(() => setHasCopied(false), 2000)
        return
      }

      const blobPromise: Promise<Blob> = fetch(url, { credentials: 'include' })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.blob()
        })
        .then(async blob => {
          if (blob.type === 'image/png') return blob
          const bitmap = await createImageBitmap(blob)
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
          return new Promise<Blob>((res, rej) =>
            canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png')
          )
        })

      const urlBlob = new Blob([absoluteUrl], { type: 'text/plain' })
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise, 'text/plain': urlBlob })])
      } catch {
        // Image fetch/conversion failed — fall back to URL-only so paste in address bar still works
        await navigator.clipboard.writeText(absoluteUrl)
      }
      setHasCopied(true)
      window.setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const sendReaction = async (emoji: string) => {
    const targetId = activeViewerItem?.message_id
    if (!targetId || !conversationId) return

    const clean = String(emoji || '').trim()
    if (!clean) return

    try {
      const isRemove = localMyReaction === clean

      // Remove (or switch): delete existing my reaction first if we have its id
      const idToDelete = localMyReactionId || myReactionFromProps.id
      if (idToDelete) {
        await deleteMessageMutation.mutateAsync(idToDelete)
        setLocalMyReactionId(null)
      }

      // Ensure chat thread reflects deletion/switch without requiring a hard refresh
      await queryClient.invalidateQueries({ queryKey: ['conversationMessages', conversationId] })

      if (isRemove) {
        setLocalMyReaction(null)
        return
      }

      // Optimistic badge
      setLocalMyReaction(clean)

      const resp: any = await createMessageMutation.mutateAsync({
        content: clean,
        message_type: 'reaction',
        conversation_id: conversationId,
        reply_to_message_id: targetId,
      })

      // Ensure chat thread reflects the new reaction without requiring a hard refresh
      await queryClient.invalidateQueries({ queryKey: ['conversationMessages', conversationId] })

      if (resp && typeof resp.id === 'number') {
        setLocalMyReactionId(resp.id)
      }
    } catch {
      // If it fails, fall back to showing whatever was on the message
      setLocalMyReaction(myReactionFromProps.emoji)
      setLocalMyReactionId(myReactionFromProps.id)
    }
  }


  // Calculate opacity based on dismiss drag
  const backdropOpacity = useMemo(() => {
    const maxDrag = 200
    const progress = Math.min(Math.abs(dismissOffset) / maxDrag, 1)
    return 1 - progress * 0.5 // Fade out to 50%
  }, [dismissOffset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 max-w-none w-screen h-[100dvh] bg-black text-white border-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        style={{ backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }}
        hideClose
      >
        <DialogTitle className="sr-only">Conversation media viewer</DialogTitle>
        <DialogDescription className="sr-only">Browse conversation images and videos.</DialogDescription>
        <div className="h-full w-full flex flex-col relative overflow-hidden">

          {/* --- Header Overlay --- */}
          <div
            className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
          >
            {/* Gradient Background for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" style={{ height: '100px' }} />

            <div className={`relative flex items-center justify-between ${isMobile
              ? 'h-14 px-4 pt-[env(safe-area-inset-top)]'
              : 'h-16 px-6'
              }`}>
              <div className="min-w-0 flex-1 pr-2">
                <div className="text-sm font-medium text-white/90 drop-shadow-md">
                  {sortedCombinedMedia.length > 0 ? `${activeMediaIndex + 1} / ${sortedCombinedMedia.length}` : ''}
                </div>
                {activeViewerItem && (
                  <div className="mt-0.5 min-w-0 text-xs text-white/70 truncate drop-shadow-md">
                    {activeViewerItem.media_name || 'Media'}
                    {(activeViewerItem.media_size ? ` • ${formatBytes(activeViewerItem.media_size)}` : '')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={openCurrentInNewTab}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
                {!isActiveVideo && (
                  <button
                    type="button"
                    onClick={copyCurrentImage}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                    aria-label={hasCopied ? 'Copied' : 'Copy'}
                  >
                    {hasCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={downloadCurrent}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* --- Main Media Area --- */}
          <div
            className={`flex-1 w-full h-full relative flex items-center justify-center touch-none`} // touch-none for custom gestures
            ref={mediaContainerRef}
            style={{
              transform: `translateY(${dismissOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            onWheel={(e) => {
              // Existing wheel logic (keep for desktop zoom)
              const current = sortedCombinedMedia[activeMediaIndex]
              const isVideo = (current?.media_type || '').toLowerCase().startsWith('video')
              if (isVideo) return

              if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
              }
              const delta = e.deltaY
              const next = Math.min(3, Math.max(1, imageScale + (delta > 0 ? -0.15 : 0.15)))
              setImageScale(next)
              if (next === 1) {
                setImageOffset({ x: 0, y: 0 })
              } else {
                setImageOffset((prev) => clampOffset(prev, next))
              }
            }}
            onMouseDown={(e) => {
              // Existing mouse drag (desktop)
              const current = sortedCombinedMedia[activeMediaIndex]
              const isVideo = (current?.media_type || '').toLowerCase().startsWith('video')
              if (isVideo) return
              if (imageScale <= 1) return
              imageDragStartRef.current = { x: e.clientX, y: e.clientY, ox: imageOffset.x, oy: imageOffset.y }
            }}
            onMouseMove={(e) => {
              const st = imageDragStartRef.current
              if (!st) return
              const next = { x: st.ox + (e.clientX - st.x), y: st.oy + (e.clientY - st.y) }
              setImageOffset(clampOffset(next, imageScale))
            }}
            onMouseUp={(e) => {
              if (!imageDragStartRef.current) {
                // If it wasn't a drag, toggle controls
                setShowControls(prev => !prev)
              }
              imageDragStartRef.current = null
            }}
            onMouseLeave={() => {
              imageDragStartRef.current = null
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                viewerTouchStartXRef.current = e.touches[0].clientX
                viewerTouchStartYRef.current = e.touches[0].clientY
                setIsDragging(true)
                return
              }

              if (e.touches.length === 2) {
                const current = sortedCombinedMedia[activeMediaIndex]
                const isVideo = (current?.media_type || '').toLowerCase().startsWith('video')
                if (isVideo) return

                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                viewerPinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy)
                viewerPinchStartScaleRef.current = imageScale
              }
            }}
            onTouchMove={(e) => {
              const current = sortedCombinedMedia[activeMediaIndex]
              const isVideo = (current?.media_type || '').toLowerCase().startsWith('video')

              // Handle Pinch Zoom
              if (!isVideo && e.touches.length === 2) {
                const startDist = viewerPinchStartDistRef.current
                if (!startDist) return
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const dist = Math.sqrt(dx * dx + dy * dy)
                const ratio = dist / startDist
                const next = Math.min(3, Math.max(1, viewerPinchStartScaleRef.current * ratio))
                setImageScale(next)
                if (next === 1) {
                  setImageOffset({ x: 0, y: 0 })
                } else {
                  setImageOffset((prev) => clampOffset(prev, next))
                }
                return
              }

              // Handle Single Touch (Panning or Swiping)
              if (e.touches.length === 1) {
                const t = e.touches[0]
                const sx = viewerTouchStartXRef.current
                const sy = viewerTouchStartYRef.current
                if (sx == null || sy == null) return

                const dx = t.clientX - sx
                const dy = t.clientY - sy

                if (imageScale > 1) {
                  // Panning image when zoomed in
                  setImageOffset((prev) =>
                    clampOffset(
                      {
                        x: prev.x + (t.clientX - viewerTouchStartXRef.current!),
                        y: prev.y + (t.clientY - viewerTouchStartYRef.current!)
                      },
                      imageScale,
                    ),
                  )
                  viewerTouchStartXRef.current = t.clientX
                  viewerTouchStartYRef.current = t.clientY
                } else {
                  // Scale === 1: Handle Dismiss or Swipe
                  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5) {
                    // Vertical Swipe (Drag to dismiss)
                    setDismissOffset(dy)
                    // If dragging down significantly, hide controls for better focus
                    if (Math.abs(dy) > 20) setShowControls(false)
                  }
                }
              }
            }}
            onTouchEnd={(e) => {
              setIsDragging(false)
              if (viewerPinchStartDistRef.current) {
                viewerPinchStartDistRef.current = null
                return
              }

              const sx = viewerTouchStartXRef.current
              const sy = viewerTouchStartYRef.current
              if (sx == null || sy == null) return
              const t = e.changedTouches[0]
              const dx = t.clientX - sx
              const dy = t.clientY - sy
              viewerTouchStartXRef.current = null
              viewerTouchStartYRef.current = null

              // Handle Dismiss Logic
              if (imageScale <= 1 && Math.abs(dy) > 100) {
                onOpenChange(false)
                return
              } else {
                setDismissOffset(0)
              }

              // Handle Tap Logic
              if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                const now = Date.now()
                if (now - lastTapAtRef.current < 300) {
                  // DOUBLE TAP
                  const nextScale = imageScale === 1 ? 2.5 : 1
                  setImageScale(nextScale)
                  if (nextScale === 1) {
                    setImageOffset({ x: 0, y: 0 })
                  } else {
                    setImageOffset({ x: 0, y: 0 })
                  }
                  lastTapAtRef.current = 0
                  return
                }
                lastTapAtRef.current = now
                // SINGLE TAP - Toggle controls
                setShowControls(prev => !prev)
                return
              }

              // Handle Horizontal Navigation
              if (imageScale <= 1) {
                const threshold = 60
                if (Math.abs(dx) > threshold && Math.abs(dy) < threshold) {
                  if (dx > 0) {
                    isRTL ? goNextMedia() : goPrevMedia()
                  } else {
                    isRTL ? goPrevMedia() : goNextMedia()
                  }
                }
              }
            }}
          >
            {activeViewerItem?.media_url ? (
              (activeViewerItem.media_type || '').toLowerCase().startsWith('video') ? (
                <video
                  key={activeViewerItem.message_id}
                  ref={activeVideoRef}
                  src={normalizeMediaUrl(activeViewerItem.media_url)}
                  controls={showControls} // Show native controls when UI is visible
                  controlsList="nodownload noremoteplayback"
                  playsInline
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                  onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking video controls
                  className={
                    isMobile
                      ? 'w-full max-w-none object-contain transition-all duration-300'
                      : 'max-w-full w-auto h-auto object-contain'
                  }
                  style={
                    isMobile
                      ? {
                        maxHeight: showControls
                          ? 'calc(100dvh - 190px)'
                          : 'calc(100dvh - 120px)',
                        height: 'auto',
                      }
                      : {
                        maxHeight: showControls
                          ? 'calc(100dvh - 160px)'
                          : 'calc(100dvh - 96px)',
                      }
                  }
                />
              ) : (
                <img
                  ref={activeImageRef}
                  src={normalizeMediaUrl(activeViewerItem.media_url)}
                  alt="Media"
                  className={
                    isMobile
                      ? "w-full h-auto max-w-none object-contain select-none"
                      : "max-w-full w-auto h-auto object-contain select-none"
                  }
                  style={{
                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`,
                    transformOrigin: 'center center',
                    transition: imageDragStartRef.current ? 'none' : 'transform 120ms ease',
                    touchAction: 'none', // Critical for custom gestures
                    cursor: imageScale > 1 ? 'grab' : 'default',
                    maxHeight: isMobile
                      ? (showControls ? 'calc(100dvh - 190px)' : 'calc(100dvh - 120px)')
                      : (showControls ? 'calc(100dvh - 180px)' : 'calc(100dvh - 120px)'),
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    const rect = img.getBoundingClientRect()
                    imageBaseSizeRef.current = { w: rect.width, h: rect.height }
                    if (imageScale > 1) {
                      setImageOffset((prev) => clampOffset(prev, imageScale))
                    }
                  }}
                />
              )
            ) : null}

            {!isMobile && sortedCombinedMedia.length > 1 && (
              <div className={`hidden md:flex transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrevMedia() }}
                  disabled={activeMediaIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center disabled:opacity-30 transition-colors text-white"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNextMedia() }}
                  disabled={activeMediaIndex === sortedCombinedMedia.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center disabled:opacity-30 transition-colors text-white"
                  aria-label="Next"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>
            )}

          </div>

          {mobileReactionOpen && (
            <div className="absolute inset-0 z-[60]" onClick={() => setMobileReactionOpen(false)}>
              <div className="absolute inset-0 bg-black/30" />
              <div
                className="absolute left-4 right-4 bottom-6 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <input
                    value={mobileReactionValue}
                    onChange={(e) => setMobileReactionValue(e.target.value)}
                    autoFocus
                    placeholder="😀"
                    className="flex-1 h-11 rounded-xl bg-white/10 border border-white/10 px-3 text-white outline-none"
                    inputMode="text"
                  />
                  <button
                    type="button"
                    className="h-11 px-4 rounded-xl bg-white text-black font-medium"
                    onClick={() => {
                      const v = mobileReactionValue.trim()
                      if (!v) return
                      void sendReaction(v)
                      setMobileReactionOpen(false)
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Thumbnail Footer Overlay --- */}
          {!isActiveVideo || !isVideoPlaying ? (
            <div
              className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out relative ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
              {/* Gradient Background */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
                style={{ height: '140px', top: '-20px' }}
              />

              <div
                className={`relative w-full overflow-x-auto xon-scrollbar-thin flex justify-center py-4 px-2 pb-[calc(1rem+env(safe-area-inset-bottom))]`}
              >
                <div className="flex items-center gap-2">
                  {visibleThumbnails.items.map((item, idx) => {
                    const globalIdx = visibleThumbnails.start + idx
                    const url = item.media_url
                    const thumbUrl = normalizeMediaUrl(getThumbnailUrl(url, '128x128'))
                    const fallbackUrl = normalizeMediaUrl(url)
                    const isVideo = (item.media_type || '').toLowerCase().startsWith('video')
                    const isActive = globalIdx === activeMediaIndex

                    return (
                      <button
                        key={item.message_id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex(globalIdx);
                        }}
                        className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 ease-out ${isActive
                          ? 'w-14 h-14 ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110 z-10'
                          : 'w-12 h-12 opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                      >
                        <img
                          src={thumbUrl || fallbackUrl}
                          alt="thumb"
                          className="h-full w-full object-cover"
                          draggable={false}
                          onDragStart={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onError={(e) => { if (thumbUrl) e.currentTarget.src = fallbackUrl }}
                        />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {activeViewerItem?.message_id && showControls && (
                <div className="pointer-events-none absolute bottom-4 right-3 z-[55] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (typeof onReply === 'function') {
                        onReply(activeViewerItem.message_id)
                      }
                    }}
                    className="pointer-events-auto h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white flex items-center justify-center"
                    aria-label="Reply"
                  >
                    <ReplyIcon className="h-5 w-5" />
                  </button>

                  <div className="pointer-events-auto relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isMobile) {
                          setMobileReactionOpen(true)
                          setMobileReactionValue('')
                          return
                        }
                        setReactionPickerOpen((p) => !p)
                      }}
                      className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white flex items-center justify-center"
                      aria-label="React"
                    >
                      {localMyReaction ? (
                        <span className="text-lg leading-none">{localMyReaction}</span>
                      ) : activeReactionsBadge ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-lg leading-none">{activeReactionsBadge.emoji}</span>
                          {activeReactionsBadge.extra > 0 && (
                            <span className="text-[10px] leading-none text-white/80">+{activeReactionsBadge.extra}</span>
                          )}
                        </span>
                      ) : (
                        <SmilePlus className="h-5 w-5" />
                      )}
                    </button>

                    {!isMobile && reactionPickerOpen && (
                      <div className="absolute bottom-14 right-0 z-50" onClick={(e) => e.stopPropagation()}>
                        <EmojiPicker
                          width={320}
                          height={420}
                          reactionsDefaultOpen
                          allowExpandReactions
                          onEmojiClick={(ed) => {
                            void sendReaction(ed.emoji)
                            setReactionPickerOpen(false)
                          }}
                          theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                          emojiStyle={EmojiStyle.NATIVE}
                          className="xon-emoji-picker"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

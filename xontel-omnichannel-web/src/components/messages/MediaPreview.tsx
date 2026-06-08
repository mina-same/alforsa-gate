import { getFileIcon } from '@/utils/getFileIcon'
import { Download, Play } from 'lucide-react'
import { VideoPreview } from './videopreview/VideoPreview'
import downloadFile from '@/utils/downloadFile'
import { getThumbnailUrl, normalizeMediaUrl } from '@/utils/urlHelper'
import isFile from '@/utils/FileHelper'
import { MessageType } from '@/api'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import MessageStatus from './MessageStatus'

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

interface LinkMetadata {
  title?: string
  description?: string
  image?: string
}

interface MediaPreviewProps {
  type: MessageType
  url: string
  metadata?: LinkMetadata
  thumbnail?: string
  blob :Blob
  name:string
  messageId?: number
  content?: string
  onOpenViewer?: (messageId: number) => void
  isPreview?:boolean
  footerTimestamp?: string
  footerStatus?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  footerIsSender?: boolean
  onPlay?: () => void
}

export default function MediaPreview({
  content,
  type,
  url,
  metadata,
  thumbnail,
  blob,
  name,
  messageId,
  onOpenViewer,
  isPreview,
  footerTimestamp,
  footerStatus,
  footerIsSender,
  onPlay,
}: MediaPreviewProps) {
  const getFileExt = (nameOrUrl: string | undefined | null) => {
    const raw = String(nameOrUrl || '').trim()
    if (!raw) return ''
    const base = raw.split(/[?#]/)[0]
    const part = base.split('/').pop() || base
    const dot = part.lastIndexOf('.')
    if (dot === -1) return ''
    return part.slice(dot + 1).toLowerCase()
  }

  const isPdf = useMemo(() => {
    const blobType = String((blob as any)?.type || '').toLowerCase()
    if (blobType.includes('application/pdf')) return true

    const msgType = String(type || '').toLowerCase()
    if (msgType === 'pdf') return true

    const displayName = name == 'file' ? content : name
    const ext = getFileExt(displayName) || getFileExt(url)
    return ext === 'pdf'
  }, [blob, content, name, type, url])

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pdfPagesCount, setPdfPagesCount] = useState<number | null>(null)
  const [pdfPreviewError, setPdfPreviewError] = useState(false)
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false)

  useEffect(() => {
    if (!isPdf) return

    let cancelled = false
    setPdfPreviewError(false)
    setPdfPreviewLoading(true)
    const resolvedUrl = normalizeMediaUrl(url) || url

    const canvas = pdfCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const run = async () => {
      try {
        const hasBlob = !!(blob && typeof (blob as any).arrayBuffer === 'function' && (blob as any).size > 0)
        const source = hasBlob
          ? { data: await (blob as any).arrayBuffer() }
          : {
              url: resolvedUrl,
              withCredentials: true,
              disableRange: true,
              disableStream: true,
            }

        const task = getDocument(source as any)
        const doc = await task.promise
        if (cancelled) return
        setPdfPagesCount(doc.numPages)

        const page = await doc.getPage(1)
        if (cancelled) return

        const canvas = pdfCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const viewport = page.getViewport({ scale: 1 })
        const targetWidth = 320
        const scale = viewport.width ? targetWidth / viewport.width : 1
        const scaledViewport = page.getViewport({ scale })

        canvas.width = Math.floor(scaledViewport.width)
        canvas.height = Math.floor(scaledViewport.height)

        const renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport, canvas })
        await renderTask.promise
        setPdfPreviewLoading(false)
      } catch (err) {
        if (cancelled) return
        if (import.meta.env?.DEV) {
          // eslint-disable-next-line no-console
          console.error('PDF preview failed', err)
        }
        setPdfPagesCount(null)
        setPdfPreviewError(true)
        setPdfPreviewLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
      setPdfPreviewLoading(false)
    }
  }, [isPdf, url])

  const formatBytes = (bytes: number | undefined | null) => {
    if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${Math.round(kb)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
  }

  const isSticker = content === '[sticker]'
  const hasCaption = (() => {
    const c = (content || '').trim()
    if (!c) return false
    if (c === '[Image]' || c === '[Video]' || c === '[sticker]') return false
    return true
  })()
  const [isTallImage, setIsTallImage] = useState(false)
  const [thumbError, setThumbError] = useState(false)
  const icon = getFileIcon(type, name=='file'?content:name, "w-6 h-6");
  // use the shared helper; prefer `blob` when available
  const handleDownload = () => downloadFile(normalizeMediaUrl(url), name=='file'?content:name)
    // const handleDownload = () => downloadFile(normalizeMediaUrl(url), "application/msword", name=='file'?content:name)

  
  
  if (type==='image') {
    const containerClassName = useMemo(() => {
      if (isSticker) return 'overflow-hidden max-w-xs'
      const size = isTallImage ? 'h-72 md:h-80' : ''
      return `relative overflow-hidden rounded max-w-[85vw] sm:max-w-sm md:max-w-[360px] ${size}`
    }, [isSticker, isTallImage])

    const imageClassName = useMemo(() => {
      if (isSticker) return 'w-36 h-36'
      return `${isTallImage ? 'h-full w-full' : 'w-full max-h-72 md:max-h-80'} object-cover object-center cursor-pointer hover:opacity-90 transition`
    }, [isSticker, isTallImage])

    const thumbSrc = !isSticker && !thumbError
      ? normalizeMediaUrl(getThumbnailUrl(url, '640x360'))
      : null
    const imgSrc = thumbSrc || normalizeMediaUrl(url)

    return (
      <div className={containerClassName}>
        <img
          src={imgSrc}
          alt="Shared image"
          className={imageClassName}
          draggable={false}
          onDragStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onLoad={(e) => {
            if (isSticker) return
            const img = e.currentTarget
            const w = img.naturalWidth
            const h = img.naturalHeight
            if (w && h) setIsTallImage(h / w >= 1.6)
          }}
          onError={() => { if (thumbSrc) setThumbError(true) }}
          onClick={() => {
            if (typeof messageId === 'number' && onOpenViewer) {
              onOpenViewer(messageId)
              return
            }
            window.open(url, '_blank')
          }}
        />

        {!!footerTimestamp && !hasCaption && (
          <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
            {!isSticker && <div className="h-14 bg-gradient-to-t from-black/60 to-transparent rounded-b" />}
           <div className="absolute bottom-1.5 right-2">
              <MessageStatus
                status={footerStatus || 'sent'}
                time={footerTimestamp}
                isSender={!!footerIsSender}
                className="flex items-center gap-1 text-[10px] text-white/90 justify-end"
                sentIconClassName="text-white/90"
                deliveredIconClassName="text-white/90"
                readIconClassName="text-white/90"
                pendingIconClassName="text-white/90"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (type?.includes("video")) {
    const videoThumbSrc = !thumbError ? normalizeMediaUrl(getThumbnailUrl(url, '640x360')) : null
    const handleVideoClick = () => {
      onPlay?.()
      if (typeof messageId === 'number' && onOpenViewer) {
        onOpenViewer(messageId)
        return
      }
      window.open(url, '_blank')
    }

    if (!videoThumbSrc) {
      return (
        <div className="rounded-md overflow-hidden w-full relative group max-h-[320px]">
          <VideoPreview
            show={false}
            src={normalizeMediaUrl(url)}
            className="w-full max-h-[320px] object-contain"
            onPlay={onPlay}
            onOpen={handleVideoClick}
          />
          {!!footerTimestamp && !hasCaption && (
            <div className="pb-0 absolute inset-x-0 bottom-[6px] z-10 pointer-events-none">
              <div className="h-14 bg-gradient-to-t from-black/60 to-transparent rounded-b-md" />
              <div className="absolute bottom-1.5 right-2">
                <MessageStatus
                  status={footerStatus || 'sent'}
                  time={footerTimestamp}
                  isSender={!!footerIsSender}
                  className="flex items-center gap-1 text-[10px] text-white/90 justify-end"
                  sentIconClassName="text-white/90"
                  deliveredIconClassName="text-white/90"
                  readIconClassName="text-white/90"
                  pendingIconClassName="text-white/90"
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        className="rounded-md overflow-hidden w-full relative group max-h-[320px] cursor-pointer"
        onClick={handleVideoClick}
      >
        <img
          src={videoThumbSrc}
          alt="Video thumbnail"
          className="w-full max-h-[320px] object-contain"
          draggable={false}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          onError={() => setThumbError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="p-4 bg-black/60 rounded-full">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        {!!footerTimestamp && !hasCaption && (
          <div className="pb-0 absolute inset-x-0 bottom-[6px] z-10 pointer-events-none">
            <div className="h-14 bg-gradient-to-t from-black/60 to-transparent rounded-b-md" />
            <div className="absolute bottom-1.5 right-2">
              <MessageStatus
                status={footerStatus || 'sent'}
                time={footerTimestamp}
                isSender={!!footerIsSender}
                className="flex items-center gap-1 text-[10px] text-white/90 justify-end"
                sentIconClassName="text-white/90"
                deliveredIconClassName="text-white/90"
                readIconClassName="text-white/90"
                pendingIconClassName="text-white/90"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (type === 'audio') {
    return (
      <div className="bg-muted rounded-md p-3 max-w-xs flex items-center gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <audio
            src={normalizeMediaUrl(url) || url}
            controls
            className="w-full h-8"
          />
        </div>
      </div>
    )
  }

  if (isFile(type,name) || type === 'document') {
    if (isPdf) {
      const displayName = (name == 'file' ? content : name) || 'PDF'
      const openPdf = () => {
        window.open(normalizeMediaUrl(url), '_blank')
      }

      const sizeLabel = formatBytes((blob as any)?.size)
      const pagesLabel = pdfPagesCount ? `${pdfPagesCount} page${pdfPagesCount === 1 ? '' : 's'}` : ''
      const meta = [pagesLabel, sizeLabel, 'pdf'].filter(Boolean).join(' · ')

      return (
        <div
          className="max-w-xs w-full rounded-xl overflow-hidden bg-muted/40 border border-border cursor-pointer hover:bg-muted/55 transition"
          onClick={openPdf}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') openPdf()
          }}
        >
          <div className="bg-xon-surface-gray/40">
            <div className="w-full max-h-[210px] overflow-hidden flex items-center justify-center">
              {pdfPreviewError ? (
                <div className="w-full h-[210px] flex items-center justify-center text-xs text-muted-foreground">
                  Preview unavailable
                </div>
              ) : (
                <canvas ref={pdfCanvasRef} className={`w-full h-auto ${pdfPreviewLoading ? 'opacity-70' : ''}`} />
              )}
            </div>
          </div>

          <div className="px-3 py-2 flex items-center gap-3 bg-muted/10">
            <div className="h-9 w-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">PDF</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90 truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{meta || 'pdf'}</p>
            </div>

            {!isPreview && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                className="p-2 rounded-full hover:bg-muted transition flex items-center justify-center"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-muted/70 rounded-md p-3 max-w-xs flex items-center gap-3 transition">
      {icon}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {name=='file'?content:name || "Download file"}
        </p>
      </div>
{!isPreview && 
   <button
   onClick={handleDownload}
   className="p-2 rounded-full hover:bg-muted transition flex items-center justify-center"
>
  <Download className="w-4 h-4" />
</button>
}
    </div>
    )
  }

  if (type === 'link' && metadata) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-md overflow-hidden max-w-xs border border-border hover:border-primary transition"
      >
        {metadata.image && (
          <img
            src={metadata.image}
            alt={metadata.title}
            className="w-full h-40 object-cover"
            draggable={false}
            onDragStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          />
        )}
        <div className="p-3 bg-muted/50">
          <p className="text-sm font-semibold line-clamp-2 text-foreground">
            {metadata.title}
          </p>
          {metadata.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {metadata.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {url}
          </p>
        </div>
      </a>
    )
  }

  return (
    <div className="bg-muted rounded-md p-3 max-w-xs flex items-center gap-2">
      {icon}
      {/* <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline truncate"
      >
        {name}
      </a> */}
    </div>
  )
}

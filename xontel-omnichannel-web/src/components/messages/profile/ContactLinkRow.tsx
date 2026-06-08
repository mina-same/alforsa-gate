import { Link as LinkIcon } from 'lucide-react'
import { useLinkMetadata } from '@/hooks/useLinkMetadata'

export function ContactLinkRow({ url, id }: { url: string; id: number }) {
  const { metadata, isLoading } = useLinkMetadata(url)

  const cleanUrl = url.replace(/^https?:\/\//, '')
  const host = (() => {
    try {
      return new URL(url).hostname
    } catch {
      return cleanUrl.split(/[/?#]/)[0]
    }
  })()

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-xon-surface-container-hover border border-xon-surface-outline animate-pulse">
        <div className="h-11 w-11 rounded-lg bg-xon-container-green" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-1/2 bg-xon-surface-container rounded" />
          <div className="h-3 w-3/4 bg-xon-surface-container-hover rounded" />
        </div>
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl bg-xon-surface-container border border-xon-surface-outline hover:bg-xon-surface-container-hover transition-colors"
    >
      <div className="h-11 w-11 rounded-lg overflow-hidden bg-xon-container-green flex items-center justify-center flex-shrink-0">
        {metadata?.image ? (
          <img
            src={metadata.image}
            alt={metadata.title || host}
            className="w-full h-full object-cover"
          />
        ) : (
          <LinkIcon className="h-5 w-5 text-xon-text-green" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-semibold text-xon-text-primary line-clamp-2">
          {metadata?.title || host}
        </p>
        {metadata?.description && (
          <p className="text-xs text-xon-text-secondary line-clamp-2">
            {metadata.description}
          </p>
        )}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="max-w-[60%] text-[11px] text-xon-text-secondary truncate">
            {cleanUrl}
          </span>
          {metadata?.domain && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-xon-container-green text-[10px] font-medium text-xon-text-green">
              {metadata.domain}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

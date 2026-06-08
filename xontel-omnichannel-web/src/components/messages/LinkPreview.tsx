import React from 'react'
import { Link2, Loader2, Globe } from 'lucide-react'
import { useLinkMetadata } from '@/hooks/useLinkMetadata'

interface LinkPreviewProps {
    url: string
}

export default function LinkPreview({ url }: LinkPreviewProps) {
    const { metadata, isLoading } = useLinkMetadata(url)

    if (!url) return null
if (url.startsWith("https://www.google.com/maps/search/?api=1&query=")) {
  const query = new URL(url).searchParams.get("query");
  const [lat, lng] = query?.split(",") ?? [];

  return (
    <iframe
      width="100%"
      height="180"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
    />
  );
}


    const displayUrl = (() => {
        try {
            return new URL(url).hostname
        } catch {
            return url
        }
    })()

    if (isLoading) {
        return (
            <div className="mt-2 w-full text-xs flex items-center gap-2 text-xon-text-secondary bg-xon-surface-container-hover border border-xon-surface-outline p-2 rounded-lg animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading preview...</span>
            </div>
        )
    }

    if (!metadata) return null

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 w-full rounded-xl overflow-hidden bg-xon-surface-container-hover border border-xon-surface-outline border-l-4 border-l-xon-primary hover:bg-xon-surface-hover transition-colors"
        >
            {metadata.image && (
                <div className="h-32 w-full overflow-hidden">
                    <img
                        src={metadata.image}
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-3">
                <h4 className="font-semibold text-sm line-clamp-1 mb-1 text-xon-text-primary">
                    {metadata.title || displayUrl}
                </h4>

                {metadata.description && (
                    <p className="text-xs text-xon-text-secondary line-clamp-2 mb-2">
                        {metadata.description}
                    </p>
                )}

                <div className="flex items-center gap-1.5 mt-auto pt-1">
                    {/* Favicon fallback */}
                    <div className="bg-xon-surface-container p-1 rounded-full border border-xon-surface-outline">
                        <Globe className="h-3 w-3 text-xon-text-secondary" />
                    </div>
                    <span className="text-[10px] text-xon-text-secondary uppercase tracking-wider font-medium">
                        {metadata.domain || displayUrl}
                    </span>
                </div>
            </div>
        </a>
    )
}

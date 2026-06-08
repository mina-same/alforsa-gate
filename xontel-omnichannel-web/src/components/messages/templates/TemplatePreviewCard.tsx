import React from 'react'
import { CheckCheck } from 'lucide-react'
import { WhatsAppTemplate } from '@/types/template'
import { TemplateButtonIcon } from './TemplateButtonIcon'
import { extractLatLngFromGoogleMaps } from '@/utils/urlHelper'

const ensureHttps = (url: string) => {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

interface TemplatePreviewCardProps {
  template: WhatsAppTemplate
  headerImageUrl: string
  previewBody: string
}

export function TemplatePreviewCard({ template, headerImageUrl, previewBody }: TemplatePreviewCardProps) {
  const buttons = template.buttons ?? []


  const details = extractLatLngFromGoogleMaps(headerImageUrl);
  
  const mapSrc = details && (details.latitude !== null && details.longitude !== null)
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        [details.name, details.address].filter(Boolean).join(', ')
      )}&ll=${details.latitude},${details.longitude}&z=15&output=embed`
    : headerImageUrl;




  return (
    <div className="rounded-2xl overflow-hidden shadow-md bg-background border border-border">
      {headerImageUrl !== '' && template.header_type === 'IMAGE' && (
        <img
          src={ensureHttps(headerImageUrl)}
          alt="Header"
          className="h-36 w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      {
        headerImageUrl !== '' && template.header_type === 'DOCUMENT' && (
           <>
                <iframe
                  src={ensureHttps(headerImageUrl)}
                  className="w-full h-full min-h-[150px] rounded-lg"
                />
               
              </>
          
        )
      }
      {
        headerImageUrl !== '' && template.header_type === 'VIDEO' && (
           <>
                <video
                  src={ensureHttps(headerImageUrl)}
                  className="w-full h-full min-h-[150px] rounded-lg"
                />
               
              </>
        )
      }
      {
       template.header_type === 'LOCATION' && (
           <>
                <iframe
                  src={mapSrc}
                  className="w-full h-full min-h-[150px] rounded-lg"
                />
               
              </>
          
        )
      }

      <div className="px-3 pt-2.5 pb-1.5">
        {template.header_text && (
          <p className="text-sm font-semibold text-foreground mb-1">{template.header_text}</p>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">{previewBody}</p>
        <div className="flex items-end justify-between mt-1.5">
          {template.footer_text && (
            <p className="text-[11px] text-muted-foreground mr-2 line-clamp-1">{template.footer_text}</p>
          )}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-muted-foreground">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <CheckCheck className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>

      {buttons.length > 0 && (
        <div className="border-t border-border">
          {buttons.map((btn, i) => (
            <div
              key={i}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-primary ${
                i < buttons.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <TemplateButtonIcon type={btn.type} />
              <span>{btn.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

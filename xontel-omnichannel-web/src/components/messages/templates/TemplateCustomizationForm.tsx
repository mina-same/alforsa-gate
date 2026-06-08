import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Sparkles, Upload, X, Loader2 } from 'lucide-react'
import { WhatsAppTemplate, TemplateVariable} from '@/types/template'
import { useUploadMedia } from '@/api/media/hooks'

interface TemplateCustomizationFormProps {
  template: WhatsAppTemplate
  headerImageUrl: string
  variableValues: Record<string, string>
  onHeaderImageUrlChange: (value: string) => void
  onVariableChange: (name: string, value: string) => void

}

export function TemplateCustomizationForm({
  template,
  headerImageUrl,
  variableValues,
  onHeaderImageUrlChange,
  onVariableChange,


}: TemplateCustomizationFormProps) {
  const { t } = useTranslation('chat')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { mutateAsync: uploadMedia } = useUploadMedia()

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await uploadMedia({
        file,
        onProgress: setUploadProgress,
      })
      onHeaderImageUrlChange(response.url)
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClearImage = () => {
    onHeaderImageUrlChange('')
    setUploadError(null)
  }

  return (
    <div className="space-y-5">
      <div className="bg-accent rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t('whatsapp_modal.customize_title')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t('whatsapp_modal.customize_description')}</p>
        </div>
      </div>

      {
        template.header_type === 'LOCATION' && (
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <Image className="h-3.5 w-3.5 text-muted-foreground" />
             {t('whatsapp_modal.header_location_url')}
            </label>
            <input
              type="url"
              value={headerImageUrl || ''}
                          onChange={(e) => onHeaderImageUrlChange(e.target.value)}

                          className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"

              placeholder="https://www.google.com/maps/place/..."
            />
          </div>
        )
      }

      {template.header_type === 'IMAGE' && (
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <Image className="h-3.5 w-3.5 text-muted-foreground" />
            {t('whatsapp_modal.header_image_url')}
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileChange}
          />

          {headerImageUrl && !uploading ? (
            // Preview of the uploaded/existing image
            <div className="relative rounded-xl overflow-hidden border border-input bg-muted">
              <img
                src={headerImageUrl}
                alt="Header preview"
                className="w-full h-36 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-foreground text-xs font-medium rounded-lg shadow hover:bg-white transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-destructive text-xs font-medium rounded-lg shadow hover:bg-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            // Upload button
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-input rounded-xl bg-background hover:bg-accent hover:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    Uploading… {uploadProgress}%
                  </span>
                  <div className="w-full max-w-[140px] h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Upload Image</span>
                  <span className="text-[11px] text-muted-foreground">Click to open gallery</span>
                </>
              )}
            </button>
          )}

          {uploadError && (
            <p className="text-[11px] text-destructive mt-1">{uploadError}</p>
          )}
        </div>
      )}

      {
        template.header_type === 'DOCUMENT' && (
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <Image className="h-3.5 w-3.5 text-muted-foreground" />
              {t('whatsapp_modal.header_document_url')}
            </label>
              <input
            type="url"
            value={headerImageUrl}
            onChange={(e) => onHeaderImageUrlChange(e.target.value)}
            placeholder="https://example.com/document.pdf"
            className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <p className="text-[11px] text-muted-foreground mt-1">{t('whatsapp_modal.https_auto_added')}</p>
          </div>
        )

      }

      {template.variables && template.variables.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-foreground mb-2 block">{t('whatsapp_modal.template_variables')}</label>
          <div className="space-y-2.5">
            {template.variables.map((v: TemplateVariable, i: number) => (
              <div key={i}>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  {`{{${v.name}}}`} · {v.type}
                </label>
                <input
                  type="text"
                  value={variableValues[v.name] || ''}
                  onChange={(e) => onVariableChange(v.name, e.target.value)}
                  placeholder={v.example}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

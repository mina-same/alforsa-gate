import { useState, useMemo, useEffect } from 'react'
import { Search} from 'lucide-react'
import { Button } from '@components/ui/button'
import { ScrollArea } from '@components/ui/scroll-area'
import { WhatsAppTemplate } from '@/types/template'
import { useWhatsAppTemplates, type WhatsAppTemplateResponse } from '@api'
import { TemplateListItem } from './TemplateListItem'
import { TemplateSearchBar } from './TemplateSearchBar'
import { TemplatePreviewCard } from './TemplatePreviewCard'
import { TemplateCustomizationForm } from './TemplateCustomizationForm'
import { TemplateDetails } from './TemplateDetails'
import { TemplateModalHeader } from './TemplateModalHeader'
import { TemplateModalFooter } from './TemplateModalFooter'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: WhatsAppTemplate) => void
}

const ensureHttps = (url: string) => {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  // Editable fields state
  const [headerImageUrl, setHeaderImageUrl] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})


  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useWhatsAppTemplates(undefined, isOpen)

  const templates = useMemo<WhatsAppTemplate[]>(() => {
    const mapTemplate = (t: WhatsAppTemplateResponse): WhatsAppTemplate => ({
      id: t.id,
      name: t.name,
      language: t.language,
      category: t.category,
      body_text: t.body_text ?? '',
      header_type: t.header_type,
      header_text: t.header_text,
      header_media_url: t.header_media_url,
      footer_text: t.footer_text,
      status: t.status,
      template_id: t.template_id ?? undefined,
      usage_count: t.usage_count,
      created_at: new Date(t.created_at),
      updated_at: new Date(t.updated_at),
      submitted_at: t.submitted_at ? new Date(t.submitted_at) : null,
      approved_at: t.approved_at ? new Date(t.approved_at) : null,
      buttons: t.buttons ?? [],
      variables: t.variables ?? [],
    })

    if (!templatesData?.items) return []
    return templatesData.items.map(mapTemplate)
  }, [templatesData])

  // Reset editable fields when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setHeaderImageUrl(ensureHttps(selectedTemplate.header_media_url || ''))
      // Initialize variable values with examples
      const initialVars: Record<string, string> = {}
      selectedTemplate.variables?.forEach(v => {
        initialVars[v.name] = v.example || ''
      })
      setVariableValues(initialVars)
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const filteredTemplates = useMemo(() => {
    // Only show approved templates
    let approvedTemplates = templates.filter(template => template.status === 'APPROVED')
    
    if (!searchQuery.trim()) return approvedTemplates
    
    const query = searchQuery.toLowerCase()
    return approvedTemplates.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.body_text.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    )
  }, [searchQuery, templates])

  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleBack = () => {
    setShowPreview(false)
    setSelectedTemplate(null)
  }

  const handleClose = () => {
    if (showPreview) {
      handleBack()
    } else {
      onClose()
    }
  }

  const handleSendTemplate = () => {
    console.log('Sending template with values:', {
      headerImageUrl,
      variableValues,
    })
  

    if (selectedTemplate) {
      // Create modified template with user-edited values
      const modifiedTemplate: WhatsAppTemplate = {
        ...selectedTemplate,
        

        header_media_url: ensureHttps(headerImageUrl || selectedTemplate.header_media_url || ''),
        // Replace variables in body text
        body_text: Object.entries(variableValues).reduce(
          (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), value),
          selectedTemplate.body_text
        ),
        variables: selectedTemplate.variables?.map(v => ({
          ...v,
          example: variableValues[v.name] || v.example || '',
        })) || [],

        

        

      }
      console.log('Modified template to send:', modifiedTemplate)
      onSelectTemplate(modifiedTemplate)
      onClose()
      setSelectedTemplate(null)
      setShowPreview(false)
      setSearchQuery('')
      setHeaderImageUrl('')
      setVariableValues({})
    }
  }

  if (!isOpen) return null

  const previewBody = selectedTemplate
    ? Object.entries(variableValues).reduce(
      (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`),
      selectedTemplate.body_text,
    )
    : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className="w-full sm:max-w-5xl bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[85vh] sm:mx-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-300">
        <TemplateModalHeader 
          showPreview={showPreview}
          selectedTemplate={selectedTemplate}
          onClose={handleClose}
          onBack={handleBack}
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {!showPreview ? (
            // Template List View
            <div className="w-full flex flex-col">
              {/* Search Bar */}
              <div className="px-4 sm:px-6 py-3 border-b border-border shrink-0">
                <TemplateSearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              {/* Templates List */}
              <ScrollArea className="flex-1">
                {isTemplatesLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Loading templates...
                  </div>
                ) : templatesError && !import.meta.env.DEV ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 text-center">
                    <p>Failed to load templates</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => refetchTemplates()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Search className="h-10 w-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No templates found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 space-y-2">
                    {filteredTemplates.map((template) => (
                      <TemplateListItem 
                        key={template.id}
                        template={template}
                        onClick={handleSelectTemplate}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : selectedTemplate ? (
            <div className="w-full flex flex-col lg:flex-row overflow-hidden">
              {/* Preview Panel */}
              <div className="lg:w-1/2 bg-muted/30 p-4 sm:p-6 lg:border-r border-border flex flex-col shrink-0">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Preview</p>
                <div className="flex-1 flex items-start justify-center overflow-auto scrollbar-thin">
                  <div className="w-full max-w-xs">
                    <TemplatePreviewCard 
                      template={selectedTemplate}
                      headerImageUrl={headerImageUrl}
                      previewBody={previewBody}
                    />
                  </div>
                </div>
              </div>

              {/* Customization Panel */}
              <ScrollArea className="lg:w-1/2 flex-1">
                <div className="p-4 sm:p-6 space-y-5">
                  <TemplateCustomizationForm
                    template={selectedTemplate}
                    headerImageUrl={headerImageUrl}
                    variableValues={variableValues}
                    onHeaderImageUrlChange={setHeaderImageUrl}
                    onVariableChange={(name, value) => setVariableValues(prev => ({ ...prev, [name]: value }))}
                 
                  />

                  <TemplateDetails template={selectedTemplate} />
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </div>

        {showPreview && selectedTemplate && (
          <TemplateModalFooter 
            onBack={handleBack}
            onSend={handleSendTemplate}
          />
        )}
      </div>
    </div>
  )
}

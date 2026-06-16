import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Loader2, UserPlus, Users, Plus, X, Tag } from "lucide-react"
import { useContacts, useCreateContact } from "@/api/contacts/hooks"
import { ContactResponse } from "@/api/contacts/types"
import { useContactTags } from "@/api/tags/hooks"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { CountryPhoneInput } from "@/components/ui/country-phone-input"

interface AddContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectContact: (contact: ContactResponse) => void
  prefillPhone?: string
  defaultMode?: "existing" | "new"
}

export default function AddContactModal({
  open,
  onOpenChange,
  onSelectContact,
  prefillPhone,
  defaultMode = "existing",
}: AddContactModalProps) {
  const { t, i18n } = useTranslation("chat")
  const isRTL = i18n.language === "ar"
  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for new contact
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    organization_id: 1,
    middle_name: "",
    last_name: "",
    identifier: "",
    location: "",
  })

  // Tags state
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: contactsData, isLoading: isContactsLoading, refetch } = useContacts(
    { limit: 50, search: debouncedSearch || undefined }
  )
  const existingContacts = contactsData?.contacts || []
  const { data: tagsData } = useContactTags(0, 100)
  const availableTags = tagsData?.items || []
  const createContactMutation = useCreateContact()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        phone: "",
        email: "",
        organization_id: 1,
        middle_name: "",
        last_name: "",
        identifier: "",
        location: "",
      })
      setSelectedTags([])
      setNewTagInput("")
      setSearchQuery("")
      setMode("existing")
    } else {
      // Modal opened - prefill phone if provided
      if (prefillPhone) {
        setFormData((prev) => ({ ...prev, phone: prefillPhone }))
      }
      // Set the default mode when opening
      setMode(defaultMode)
      if (defaultMode === "existing") {
        refetch()
      }
    }
  }, [open, defaultMode, refetch, prefillPhone])

  const filteredContacts = React.useMemo(() => {
    return existingContacts
  }, [existingContacts])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddTag = (tagName: string) => {
    if (!tagName.trim()) return
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName])
    }
    setNewTagInput("")
  }

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName))
  }

  const handleCreateNewTag = () => {
    if (newTagInput.trim()) {
      handleAddTag(newTagInput.trim())
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.phone) {
      toast.error(t("contacts.validation.required", "Name and phone are required"))
      return
    }

    // Basic phone validation
    const phoneRegex = /^\+?[\d\s-()]+$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error(t("contacts.validation.phone", "Please enter a valid phone number"))
      return
    }

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t("contacts.validation.email", "Please enter a valid email address"))
      return
    }

    setIsSubmitting(true)

    try {
      // Create contact first
      const newContact = await createContactMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        organization_id: formData.organization_id,
        middle_name: formData.middle_name || undefined,
        last_name: formData.last_name || undefined,
        identifier: formData.identifier || undefined,
        location: formData.location || undefined,
      })

      // Add tags to contact if any selected
      if (selectedTags.length > 0) {
        try {
          const { contactsAPI } = await import("@/api/contacts/endpoints")
          const { tagsAPI } = await import("@/api/tags/endpoints")

          for (const tagName of selectedTags) {
            let tagId: number | undefined;
            const existing = (availableTags || []).find(
              (t) => t.name.toLowerCase() === tagName.toLowerCase()
            );

            if (existing) {
              tagId = existing.id;
            } else {
              try {
                const created = await tagsAPI.createContactTag({
                  name: tagName,
                  organization_id: formData.organization_id
                });
                tagId = created.id;
              } catch (createError) {
                console.error(`Error creating tag ${tagName}:`, createError);
              }
            }

            if (tagId) {
              await contactsAPI.addTagToContact(newContact.id, tagId);
            }
          }
        } catch (tagError) {
          console.error("Error adding tags:", tagError)
          // Don't fail if tags couldn't be added
        }
      }

      toast.success(t("contacts.created", "Contact created successfully"))
      onSelectContact({ ...newContact, tags: selectedTags })
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating contact:", error)
      // Extract error message from API response - handle Axios error structure
      // Axios errors have response.data, while the detail might be at different levels
      let errorMessage = t("contacts.create_error", "Failed to create contact")

      if (error?.response?.data?.detail) {
        // Standard API error response
        errorMessage = error.response.data.detail
      } else if (typeof error?.response?.data === 'string') {
        // Sometimes the error is a plain string
        errorMessage = error.response.data
      } else if (error?.detail) {
        // Direct detail property
        errorMessage = error.detail
      } else if (error?.message) {
        // Fallback to error message
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectExisting = (contact: ContactResponse) => {
    onSelectContact(contact)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 overflow-hidden bg-xon-surface-container border-xon-surface-outline"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader className={cn("p-6 pb-2 flex-shrink-0", isRTL && "text-right")}>
          <DialogTitle className={cn("text-xl font-bold flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
            <Users className="h-6 w-6 text-xon-primary" />
            {t("contacts.add.title", "Add Contact")}
          </DialogTitle>
        </DialogHeader>

        {/* Mode Toggle Buttons */}
        <div className="px-6 pb-4 border-b border-xon-surface-outline flex-shrink-0">
          <div className={cn("flex gap-2", isRTL && "flex-rwow")}>
            <Button
              variant={mode === "existing" ? "default" : "outline"}
              onClick={() => setMode("existing")}
              className={cn(
                "flex-1 gap-2",
                mode === "existing"
                  ? "bg-xon-primary hover:bg-xon-primary-active"
                  : "hover:bg-xon-surface-container-hover",
                isRTL && "flex-row-reverse"
              )}
            >
              <Users className="h-4 w-4" />
              {t("contacts.add.existing", "Existing Contacts")}
            </Button>
            <Button
              variant={mode === "new" ? "default" : "outline"}
              onClick={() => setMode("new")}
              className={cn(
                "flex-1 gap-2",
                mode === "new"
                  ? "bg-xon-primary hover:bg-xon-primary-active"
                  : "hover:bg-xon-surface-container-hover",
                isRTL && "flex-row-reverse"
              )}
            >
              <UserPlus className="h-4 w-4" />
              {t("contacts.add.new", "New Contact")}
            </Button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {mode === "existing" ? (
            <div className="h-full flex flex-col p-6">
              {/* Search Bar */}
              <div className="relative mb-4 flex-shrink-0">
                <Search className={cn("absolute top-2.5 h-4 w-4 text-xon-text-secondary", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t("contacts.search_placeholder", "Search contacts...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("bg-xon-surface border-xon-surface-outline", isRTL ? "pr-9 text-right" : "pl-9 text-left")}
                />
              </div>

              {/* Contacts List - Scrollable */}
              <ScrollArea className="flex-1 -mx-2 px-2">
                {isContactsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-xon-primary" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-xon-text-secondary opacity-20 mb-3" />
                    <p className="text-sm text-xon-text-secondary">
                      {searchQuery
                        ? t("contacts.no_results", "No contacts found")
                        : t("contacts.empty", "No contacts yet")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleSelectExisting(contact)}
                        className="p-3 rounded-lg cursor-pointer transition-all hover:bg-xon-surface-container-hover border border-transparent hover:border-xon-surface-outline"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium text-xon-text-primary">
                              {contact.name}
                            </p>
                            <p className="text-xs text-xon-text-secondary dir-ltr">
                              {contact.phone}
                            </p>
                            {contact.email && (
                              <p className="text-xs text-xon-text-secondary truncate">
                                {contact.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Name Fields */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                      {t("contacts.form.name", "First Name")} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={t("contacts.form.name_placeholder", "John")}
                      className="bg-xon-surface border-xon-surface-outline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                      {t("contacts.form.middle_name", "Middle Name")}
                    </Label>
                    <Input
                      id="middle_name"
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange("middle_name", e.target.value)}
                      placeholder={t("contacts.form.middle_name_placeholder", "Michael")}
                      className="bg-xon-surface border-xon-surface-outline"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                    {t("contacts.form.last_name", "Last Name")}
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder={t("contacts.form.last_name_placeholder", "Doe")}
                    className="bg-xon-surface border-xon-surface-outline"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4">
                <div className="space-y-2" dir="ltr">
                  <Label className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                    {t("contacts.form.phone", "Phone Number")} *
                  </Label>
                  <CountryPhoneInput
                    value={formData.phone}
                    onChange={(phone: string, isValid: boolean) => {
                      handleInputChange("phone", phone)
                    }}
                    placeholder={t("contacts.form.phone_placeholder", "Enter phone number...")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                    {t("contacts.form.email", "Email Address")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className="bg-xon-surface border-xon-surface-outline"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                    {t("contacts.form.identifier", "Identifier")}
                  </Label>
                  <Input
                    id="identifier"
                    value={formData.identifier}
                    onChange={(e) => handleInputChange("identifier", e.target.value)}
                    placeholder="US"
                    className="bg-xon-surface border-xon-surface-outline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                    {t("contacts.form.location", "Location")}
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder={t("contacts.form.location_placeholder", "New York")}
                    className="bg-xon-surface border-xon-surface-outline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier" className={cn("text-sm font-semibold block", isRTL && "text-right")}>
                  {t("contacts.form.identifier", "Identifier")}
                </Label>
                <Input
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) => handleInputChange("identifier", e.target.value)}
                  placeholder={t("contacts.form.identifier_placeholder", "ID or reference number")}
                  className="bg-xon-surface border-xon-surface-outline"
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-3 pt-2 border-t border-xon-surface-outline">
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Tag className="h-4 w-4 text-xon-primary" />
                  <Label className="text-sm font-semibold">{t("contacts.tags.title", "Contact Tags")}</Label>
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-xon-primary/10 text-xon-primary border border-xon-primary/20"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-xon-red transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add New Tag Input */}
                <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder={t("contacts.tags.add_new", "Add new tag...")}
                    className="flex-1 bg-xon-surface border-xon-surface-outline"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateNewTag()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCreateNewTag}
                    disabled={!newTagInput.trim()}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Available Tags */}
                {availableTags && availableTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-xon-text-secondary">{t("contacts.tags.existing", "Existing tags:")}</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag.name)}
                          disabled={selectedTags.includes(tag.name)}
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium transition-all",
                            selectedTags.includes(tag.name)
                              ? "bg-xon-surface text-xon-text-secondary cursor-not-allowed"
                              : "bg-xon-surface-container hover:bg-xon-surface-container-hover text-xon-text-primary border border-xon-surface-outline hover:border-xon-primary"
                          )}
                          style={!selectedTags.includes(tag.name) ? { borderColor: tag.color || undefined } : {}}
                        >
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: tag.color || '#ccc' }}
                          />
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          )}
        </div>

        <DialogFooter className={cn("p-6 pt-4 border-t border-xon-surface-outline flex-shrink-0", isRTL && "flex-row-reverse")}>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="hover:bg-xon-surface-container-hover"
          >
            {t("interface.cancel", "Cancel")}
          </Button>
          {mode === "new" && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.phone}
              className="gap-2 bg-xon-primary hover:bg-xon-primary-active text-xon-primary-on"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("contacts.add.create", "Create Contact")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

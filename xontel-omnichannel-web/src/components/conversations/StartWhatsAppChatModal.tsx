import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Edit,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useWhatsAppTemplates } from "@/api/whatsapp-templates/hooks";
import { TemplateListItem } from "@/components/messages/templates/TemplateListItem";
import { WhatsAppTemplate } from "@/types/template";
import { WhatsAppTemplateResponse } from "@/api/whatsapp-templates/types";
import { messagesAPI } from "@/api/messages/endpoints";
import { contactsAPI } from "@/api/contacts/endpoints";
import { inboxesAPI } from "@/api/inboxes/endpoints";
import { useQuery } from "@tanstack/react-query";
import { ContactResponse } from "@/api/contacts/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TemplateMessage } from "@/types/chat";
import { buildTemplateComponents } from "@/utils/templateHelper";
import { TemplateCustomizationForm } from "@/components/messages/templates/TemplateCustomizationForm";
import { TemplatePreviewCard } from "@/components/messages/templates/TemplatePreviewCard";
import { TemplateDetails } from "@/components/messages/templates/TemplateDetails";
import { TemplateModalFooter } from "@/components/messages/templates/TemplateModalFooter";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  CountryCode,
} from "libphonenumber-js";
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
} from "@/api/contacts/hooks";
import { useContactTags } from "@/api/tags/hooks";
import { Users, UserPlus, Tag, ArrowRight, ArrowLeft } from "lucide-react";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleFlag } from "react-circle-flags";

interface StartWhatsAppChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inboxId: number;
  channelId?: number;
  selectedContact?: ContactResponse | null;
}

const ensureHttps = (url: string) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export default function StartWhatsAppChatModal({
  open,
  onOpenChange,
  inboxId,
  channelId,
  selectedContact: initialContact,
}: StartWhatsAppChatModalProps) {
  const { t, i18n } = useTranslation("chat");
  const isRTL = i18n.language === "ar";
  const [currentStep, setCurrentStep] = useState<"contact" | "template">(
    initialContact ? "template" : "contact",
  );
  const [contactMode, setContactMode] = useState<"existing" | "new">("existing");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("KW");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedContact, setSelectedContact] =
    useState<ContactResponse | null>(initialContact || null);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );

  const [contactFormData, setContactFormData] = useState({
    name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    email: "",
    identifier: "",
    location: "",
  });

  // Tags state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const navigate = useNavigate();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      if (initialContact) {
        setSelectedContact(initialContact);
        setCurrentStep("template");
      } else {
        setSelectedContact(null);
        setCurrentStep("contact");
        setContactMode("existing");
      }
      setSelectedTemplate(null);
      setContactFormData({
        name: "",
        middle_name: "",
        last_name: "",
        phone: "",
        email: "",
        identifier: "",
        location: "",
      });
      setContactSearchQuery("");
      setSearchQuery("");
      setSelectedTags([]);
      setNewTagInput("");
    }
  }, [open, initialContact]);

  // Set phone number when contact is selected
  React.useEffect(() => {
    if (selectedContact) {
      // Try to parse country code from the phone number
      const phone = selectedContact.phone;
      const parsed = parsePhoneNumberFromString(phone);
      if (parsed && parsed.country) {
        setCountryCode(parsed.country as CountryCode);
        setPhoneNumber(parsed.nationalNumber as string);
      } else {
        setPhoneNumber(phone);
      }
    }
  }, [selectedContact]);

  // Get the full international phone number
  const getFullPhoneNumber = useMemo(() => {
    const callingCode = getCountryCallingCode(countryCode);
    // Remove any existing + or calling code from phoneNumber to avoid duplication
    let cleanNumber = phoneNumber.replace(/^\+/, "");
    // Remove country calling code if it exists at the start
    if (cleanNumber.startsWith(callingCode)) {
      cleanNumber = cleanNumber.slice(callingCode.length);
    }
    cleanNumber = cleanNumber.replace(/\D/g, ""); // Remove non-digits
    return `+${callingCode}${cleanNumber}`;
  }, [countryCode, phoneNumber]);
 
  const isPhoneValid = useMemo(() => {
    if (!contactFormData.phone) return false;
    // Check if it's a valid international number or potentially valid
    try {
      return isValidPhoneNumber(contactFormData.phone);
    } catch (e) {
      return false;
    }
  }, [contactFormData.phone]);

  const { data: inboxData } = useQuery({
    queryKey: ["inbox", inboxId],
    queryFn: () => inboxesAPI.getInbox(inboxId),
    enabled: open && !!inboxId && !channelId,
  });

  const effectiveChannelId = channelId || inboxData?.channel_id;

  const { data: templatesData, isLoading: isTemplatesLoading } =
    useWhatsAppTemplates(undefined, open);

  const {
    data: contactsData,
    isLoading: isContactsLoading,
    refetch: refetchContacts,
  } = useContacts({
    limit: 50,
    search: contactSearchQuery || undefined,
  });

  const existingContacts: ContactResponse[] = contactsData?.contacts || [];

  // Load contacts when modal opens
  React.useEffect(() => {
    if (open) {
      refetchContacts();
    }
  }, [open, refetchContacts]);

  // Reset editable fields when template changes
  React.useEffect(() => {
    if (selectedTemplate) {
      setHeaderImageUrl(selectedTemplate.header_media_url || "");
      // Initialize variable values with examples
      const initialVars: Record<string, string> = {};
      selectedTemplate.variables?.forEach((v) => {
        initialVars[v.name] = v.example || "";
      });
      setVariableValues(initialVars);
    }
  }, [selectedTemplate]);

  const templates = useMemo<WhatsAppTemplate[]>(() => {
    if (!templatesData?.items) return [];
    // Filter only approved templates
    return templatesData.items
      .filter((t: WhatsAppTemplateResponse) => t.status === "APPROVED")
      .map((t: WhatsAppTemplateResponse) => ({
        id: t.id,
        name: t.name,
        language: t.language,
        category: t.category,
        body_text: t.body_text ?? "",
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
      }));
  }, [templatesData]);

  const filteredTemplates = useMemo<WhatsAppTemplate[]>(() => {
    // Automatically prioritize "permission" template if it exists
    const query = searchQuery.toLowerCase();

    let result = templates;
    if (query) {
      result = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.body_text.toLowerCase().includes(query),
      );
    }

    // Sort by name, but put 'permission' related ones at top
    return [...result].sort((a, b) => {
      const aIsPermission = a.name.toLowerCase().includes("permission");
      const bIsPermission = b.name.toLowerCase().includes("permission");
      if (aIsPermission && !bIsPermission) return -1;
      if (!aIsPermission && bIsPermission) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [templates, searchQuery]);


  const { data: tagsData } = useContactTags(0, 100);
  const availableTags = tagsData?.items || [];

  const handleContactFormDataChange = (field: string, value: string) => {
    setContactFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tagName: string) => {
    if (!tagName.trim()) return;
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagName));
  };

  const handleCreateNewTag = () => {
    if (newTagInput.trim()) {
      handleAddTag(newTagInput.trim());
    }
  };

  const handleContactSelect = (contact: ContactResponse) => {
    setSelectedContact(contact);
    setCurrentStep("template");
  };

  const getCountryCode = (phone: string) => {
    if (!phone) return "+965";
    const parsed = parsePhoneNumberFromString(phone);
    if (parsed?.countryCallingCode) {
      return `+${parsed.countryCallingCode}`;
    }
    // Fallback for Egypt
    if (phone.startsWith("+20")) return "+20";
    const match = phone.trim().match(/^\+([0-9]{1,3})/);
    return match?.[0] || "+965";
  };

  const handleCreateContact = async () => {
    if (!contactFormData.name || !contactFormData.phone) {
      toast.error(t("contacts.validation.required"));
      return;
    }
 
    if (!isPhoneValid) {
      toast.error(t("contacts.validation.phone"));
      return;
    }

    setIsSubmitting(true);
    try {
      const organizationIdStr = localStorage.getItem("organization_id") || "1";
      const organizationId = parseInt(organizationIdStr);
 
      let updatedContact: ContactResponse;

      if (selectedContact?.id) {
        // Only send phone if it has changed
        const cleanFormPhone = contactFormData.phone?.replace(/^\+/, '').trim();
        const cleanContactPhone = selectedContact.phone?.replace(/^\+/, '').trim();
        const hasPhoneChanged = cleanFormPhone !== cleanContactPhone;

        const updateData: any = {
          name: contactFormData.name,
          middle_name: contactFormData.middle_name || undefined,
          last_name: contactFormData.last_name || undefined,
          email: contactFormData.email || undefined,
          location: contactFormData.location || undefined,
          country_code: getCountryCode(contactFormData.phone),
        };

        if (hasPhoneChanged) {
          updateData.phone = contactFormData.phone;
        }

        // Update existing contact
        updatedContact = await updateContactMutation.mutateAsync({
          contactId: selectedContact.id,
          data: updateData,
        });
      } else {
        // Create new contact
        updatedContact = await createContactMutation.mutateAsync({
          name: contactFormData.name,
          middle_name: contactFormData.middle_name || undefined,
          last_name: contactFormData.last_name || undefined,
          phone: contactFormData.phone,
          email: contactFormData.email || undefined,
          organization_id: organizationId,
          identifier: contactFormData.identifier || undefined,
          location: contactFormData.location || undefined,
          country_code: getCountryCode(contactFormData.phone),
        });
      }

      // Add tags to contact if any selected
      if (selectedTags.length > 0) {
        try {
          const { tagsAPI } = await import("@/api/tags/endpoints");

          for (const tagName of selectedTags) {
            let tagId: number | undefined;
            const existing = (availableTags || []).find(
              (t: any) => t.name.toLowerCase() === tagName.toLowerCase(),
            );

            if (existing) {
              tagId = existing.id;
            } else {
              try {
                const created = await tagsAPI.createContactTag({
                  name: tagName,
                  organization_id: organizationId,
                });
                tagId = created.id;
              } catch (createError) {
                console.error(`Error creating tag ${tagName}:`, createError);
              }
            }

            if (tagId) {
              await contactsAPI.addTagToContact(updatedContact.id, tagId);
            }
          }
        } catch (tagError) {
          console.error("Error adding tags:", tagError);
        }
      }

      toast.success(
        selectedContact?.id
          ? t("contacts.updated", "Contact updated successfully")
          : t("whatsapp_modal.success.contact_created"),
      );
      setSelectedContact({ ...updatedContact, tags: selectedTags });
      setCurrentStep("template");
    } catch (error: any) {
      console.error("Error saving contact:", error);
      toast.error(
        error.message || t("whatsapp_modal.errors.create_contact_failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleStartChat = async () => {
    if (!selectedContact) {
      toast.error(t("whatsapp_modal.errors.enter_phone"));
      return;
    }
    if (!selectedTemplate) {
      toast.error(t("whatsapp_modal.errors.select_template"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare template data
      const modifiedTemplateBody = Object.entries(variableValues).reduce(
        (text, [key, value]) =>
          text.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`),
        selectedTemplate.body_text,
      );

      const templateData: TemplateMessage = {
        name: selectedTemplate.name,
        header_text: selectedTemplate.header_text ?? undefined,
        header_media_url: ensureHttps(
          headerImageUrl || selectedTemplate.header_media_url || "",
        ),
        body_text: modifiedTemplateBody,
        header_type: selectedTemplate.header_type ?? "TEXT",
        variables:
          selectedTemplate.variables?.map((v) => ({
            name: v.name,
            type: v.type as any,
            example: variableValues[v.name] || v.example || "",
          })) || [],
        footer_text: selectedTemplate.footer_text ?? undefined,
        buttons: selectedTemplate.buttons?.map((btn) => ({
          type: btn.type,
          text: btn.text,
          url: btn.url ?? undefined,
          phone_number: btn.phone_number ?? undefined,
        })) as any,
      };

      const message = await messagesAPI.createMessage({
        conversation_id: 0,
        inbox_id: inboxId,
        channel_id: effectiveChannelId,
        content: JSON.stringify(templateData),
        direction: "outbound",
        message_type: "template_message",
        template_id: selectedTemplate.id,
        contact_id: selectedContact.id,
        additional_attributes: buildTemplateComponents(templateData),
      });

      toast.success(
        t("whatsapp_modal.success.message_sent", { name: selectedContact.name }),
      );
      onOpenChange(false);

      if (message.conversation_id) {
        navigate(`/?inbox_id=${inboxId}&conversation=${message.conversation_id}`);
      }
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast.error(error.message || t("whatsapp_modal.errors.start_chat_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate preview body by replacing variables
  const previewBody = selectedTemplate
    ? Object.entries(variableValues).reduce(
        (text, [key, value]) =>
          text.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`),
        selectedTemplate.body_text,
      )
    : "";

  const isCustomizing = selectedTemplate !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "transition-all duration-300 flex flex-col p-0 overflow-hidden bg-xon-surface-container border-xon-surface-outline",
          isCustomizing ? "sm:max-w-[900px] h-[90vh]" : "sm:max-w-[550px] h-[85vh]",
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader className={cn("p-6 pb-2", isRTL && "text-right")}>
          <DialogTitle
            className={cn(
              "text-xl font-bold flex items-center gap-2",
              isRTL && "flex-row-reverse justify-end",
            )}
          >
            {currentStep === "contact" ? (
              <>
                <Users className="h-6 w-6 text-xon-primary" />
                {contactMode === "new" && selectedContact?.id
                  ? t("contacts.edit.title", "Edit Contact")
                  : t("contacts.add.title")}
              </>
            ) : isCustomizing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTemplate(null)}
                  className="h-8 w-8 -ml-1 mr-2"
                >
                  <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
                </Button>
                <span>{selectedTemplate?.name}</span>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep("contact")}
                  className="h-8 w-8 -ml-1 mr-2"
                >
                  <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
                </Button>
                <MessageCircle className="h-6 w-6 text-xon-primary" />
                {t("whatsapp_modal.title")}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {currentStep === "contact" && (
          <div className="px-6 pb-4 border-b border-xon-surface-outline flex-shrink-0">
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button
                variant={contactMode === "existing" ? "default" : "outline"}
                onClick={() => setContactMode("existing")}
                className={cn(
                  "flex-1 gap-2",
                  contactMode === "existing"
                    ? "bg-xon-primary hover:bg-xon-primary-active"
                    : "hover:bg-xon-surface-container-hover",
                  isRTL && "flex-row-reverse",
                )}
              >
                <Users className="h-4 w-4" />
                {t("contacts.add.existing")}
              </Button>
              <Button
                variant={contactMode === "new" ? "default" : "outline"}
                onClick={() => setContactMode("new")}
                className={cn(
                  "flex-1 gap-2",
                  contactMode === "new"
                    ? "bg-xon-primary hover:bg-xon-primary-active"
                    : "hover:bg-xon-surface-container-hover",
                  isRTL && "flex-row-reverse",
                )}
              >
                <UserPlus className="h-4 w-4" />
                {selectedContact?.id
                  ? t("contacts.edit.title", "Edit Contact")
                  : t("contacts.add.new")}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "template" && !isCustomizing && selectedContact && (
          <div className="px-6 pb-4 border-b border-xon-surface-outline flex-shrink-0">
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg bg-xon-container-blue border border-xon-primary",
                isRTL && "flex-row-reverse",
              )}
            >
              <div className={cn("flex flex-col", isRTL && "items-end")}>
                <p className="text-sm font-medium text-xon-text-primary">
                  {selectedContact.name}
                </p>
                <p className="text-xs text-xon-text-secondary dir-ltr">
                  {selectedContact.phone}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setContactFormData({
                    name: selectedContact.name || "",
                    middle_name: selectedContact.middle_name || "",
                    last_name: selectedContact.last_name || "",
                    phone: selectedContact.phone || "",
                    email: selectedContact.email || "",
                    identifier: selectedContact.identifier || "",
                    location: selectedContact.location || "",
                  });
                  const tags = Array.isArray(selectedContact.tags)
                    ? selectedContact.tags
                    : typeof selectedContact.tags === "string"
                      ? selectedContact.tags.split(",").filter(Boolean)
                      : [];
                  setSelectedTags(tags);
                  setContactMode("new");
                  setCurrentStep("contact");
                }}
                className="text-xs text-xon-primary hover:text-xon-primary-active"
              >
                {t("common.edit")}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative">
          {currentStep === "contact" ? (
            contactMode === "existing" ? (
              <div className="h-full flex flex-col p-6">
                <div className="relative mb-4 flex-shrink-0">
                  <Search
                    className={cn(
                      "absolute top-2.5 h-4 w-4 text-xon-text-secondary",
                      isRTL ? "right-3" : "left-3",
                    )}
                  />
                  <Input
                    placeholder={t("contacts.search_placeholder")}
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    className={cn(
                      "bg-xon-surface border-xon-surface-outline",
                      isRTL ? "pr-9 text-right" : "pl-9 text-left",
                    )}
                  />
                </div>

                <ScrollArea className="flex-1 -mx-2 px-2">
                  {isContactsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-xon-primary" />
                    </div>
                  ) : existingContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-xon-text-secondary">
                      <Users className="h-12 w-12 opacity-20 mb-3" />
                      <p className="text-sm">
                        {contactSearchQuery
                          ? t("contacts.no_results")
                          : t("contacts.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {existingContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => handleContactSelect(contact)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:border-xon-surface-outline hover:bg-xon-surface-container-hover",
                            selectedContact?.id === contact.id &&
                              "bg-xon-container-blue border-xon-primary",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-start justify-between gap-3",
                              isRTL && "flex-row-reverse",
                            )}
                          >
                            <div
                              className={cn(
                                "flex-1 min-w-0 space-y-1",
                                isRTL && "text-right",
                              )}
                            >
                              <p className="text-sm font-medium text-xon-text-primary">
                                {contact.name}
                              </p>
                              <p className="text-xs text-xon-text-secondary dir-ltr">
                                {contact.phone}
                              </p>
                            </div>
                            {selectedContact?.id === contact.id && (
                              <div className="flex items-center gap-1.5 ml-auto">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-xon-primary hover:bg-xon-container-blue"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContact(contact);
                                    setContactFormData({
                                      name: contact.name || "",
                                      middle_name: contact.middle_name || "",
                                      last_name: contact.last_name || "",
                                      phone: contact.phone || "",
                                      email: contact.email || "",
                                      identifier: contact.identifier || "",
                                      location: contact.location || "",
                                    });
                                    const tags = Array.isArray(contact.tags)
                                      ? contact.tags
                                      : typeof contact.tags === "string"
                                        ? contact.tags.split(",").filter(Boolean)
                                        : [];
                                    setSelectedTags(tags);
                                    setContactMode("new");
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <div className="w-2 h-2 bg-xon-primary rounded-full shrink-0" />
                              </div>
                            )}
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
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className={cn(
                            "text-sm font-semibold block",
                            isRTL && "text-right",
                          )}
                        >
                          {t("contacts.form.name")} *
                        </Label>
                        <Input
                          id="name"
                          value={contactFormData.name}
                          onChange={(e) =>
                            handleContactFormDataChange("name", e.target.value)
                          }
                          placeholder={t("contacts.form.name_placeholder")}
                          className="bg-xon-surface border-xon-surface-outline"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="middle_name"
                          className={cn(
                            "text-sm font-semibold block",
                            isRTL && "text-right",
                          )}
                        >
                          {t("contacts.form.middle_name")}
                        </Label>
                        <Input
                          id="middle_name"
                          value={contactFormData.middle_name}
                          onChange={(e) =>
                            handleContactFormDataChange(
                              "middle_name",
                              e.target.value,
                            )
                          }
                          placeholder={t(
                            "contacts.form.middle_name_placeholder",
                          )}
                          className="bg-xon-surface border-xon-surface-outline"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="last_name"
                        className={cn(
                          "text-sm font-semibold block",
                          isRTL && "text-right",
                        )}
                      >
                        {t("contacts.form.last_name")}
                      </Label>
                      <Input
                        id="last_name"
                        value={contactFormData.last_name}
                        onChange={(e) =>
                          handleContactFormDataChange("last_name", e.target.value)
                        }
                        placeholder={t("contacts.form.last_name_placeholder")}
                        className="bg-xon-surface border-xon-surface-outline"
                      />
                    </div>

                    <div className="space-y-2" dir="ltr">
                      <Label
                        className={cn(
                          "text-sm font-semibold block",
                          isRTL && "text-right",
                        )}
                      >
                        {t("contacts.form.phone")} *
                      </Label>
                      <CountryPhoneInput
                        value={contactFormData.phone}
                        onChange={(phone: string) =>
                          handleContactFormDataChange("phone", phone)
                        }
                        placeholder={t("contacts.form.phone_placeholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className={cn(
                          "text-sm font-semibold block",
                          isRTL && "text-right",
                        )}
                      >
                        {t("contacts.form.email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactFormData.email}
                        onChange={(e) =>
                          handleContactFormDataChange("email", e.target.value)
                        }
                        placeholder="john@example.com"
                        className="bg-xon-surface border-xon-surface-outline"
                      />
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-3 pt-2 border-t border-xon-surface-outline">
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          isRTL && "flex-row-reverse",
                        )}
                      >
                        <Tag className="h-4 w-4 text-xon-primary" />
                        <Label className="text-sm font-semibold">
                          {t("contacts.tags.title", "Contact Tags")}
                        </Label>
                      </div>

                      {/* Selected Tags */}
                      {selectedTags.length > 0 && (
                        <div
                          className={cn(
                            "flex flex-wrap gap-2",
                            isRTL && "flex-row-reverse",
                          )}
                        >
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
                      <div
                        className={cn(
                          "flex gap-2",
                          isRTL && "flex-row-reverse",
                        )}
                      >
                        <Input
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          placeholder={t(
                            "contacts.tags.add_new",
                            "Add new tag...",
                          )}
                          className="flex-1 bg-xon-surface border-xon-surface-outline"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateNewTag();
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
                          <p
                            className={cn(
                              "text-xs text-xon-text-secondary",
                              isRTL && "text-right",
                            )}
                          >
                            {t("contacts.tags.existing", "Existing tags:")}
                          </p>
                          <div
                            className={cn(
                              "flex flex-wrap gap-2",
                              isRTL && "flex-row-reverse",
                            )}
                          >
                            {availableTags.map((tag: any) => (
                              <button
                                key={tag.id}
                                onClick={() => handleAddTag(tag.name)}
                                disabled={selectedTags.includes(tag.name)}
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                                  selectedTags.includes(tag.name)
                                    ? "bg-xon-surface text-xon-text-secondary cursor-not-allowed"
                                    : "bg-xon-surface-container hover:bg-xon-surface-container-hover text-xon-text-primary border border-xon-surface-outline hover:border-xon-primary",
                                  isRTL && "flex-row-reverse",
                                )}
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: tag.color || "#ccc",
                                  }}
                                />
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )
          ) : !isCustomizing ? (
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center justify-between mb-4 gap-4">
                <Label className="text-sm font-semibold text-xon-text-primary shrink-0">
                  {t("whatsapp_modal.select_template")}
                </Label>
                <div className="relative flex-1">
                  <Search
                    className={cn(
                      "absolute top-2.5 h-4 w-4 text-xon-text-secondary",
                      isRTL ? "right-2" : "left-2",
                    )}
                  />
                  <Input
                    placeholder={t("whatsapp_modal.template_search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "h-9 text-xs bg-xon-surface border-xon-surface-outline",
                      isRTL ? "pr-8" : "pl-8",
                    )}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 border border-xon-surface-outline rounded-lg bg-xon-surface-container p-2">
                {isTemplatesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-xon-primary" />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-xon-text-secondary">
                    {t("whatsapp_modal.no_templates")}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn(
                          "cursor-pointer rounded-md border transition-all border-transparent hover:bg-xon-surface-container-hover",
                          (selectedTemplate as WhatsAppTemplate | null)?.id === template.id &&
                            "border-xon-primary bg-xon-container-blue ring-1 ring-xon-primary",
                        )}
                      >
                        <TemplateListItem
                          template={template}
                          onClick={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex flex-col lg:flex-row">
              {/* Preview Panel */}
              <div
                className={cn(
                  "lg:w-2/5 bg-muted/30 p-4 border-b lg:border-b-0 flex flex-col shrink-0 max-h-[40vh] lg:max-h-none overflow-y-auto",
                  isRTL ? "lg:border-l" : "lg:border-r",
                )}
              >
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  {t("whatsapp_modal.preview")}
                </p>
                <div className="flex-1 flex items-start justify-center">
                  <div className="w-full max-w-xs">
                    <TemplatePreviewCard
                      template={selectedTemplate!}
                      headerImageUrl={headerImageUrl}
                      previewBody={previewBody}
                    />
                  </div>
                </div>
              </div>

              {/* Customization Panel */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-5">
                  <TemplateCustomizationForm
                    template={selectedTemplate!}
                    headerImageUrl={headerImageUrl}
                    variableValues={variableValues}
                    onHeaderImageUrlChange={setHeaderImageUrl}
                    onVariableChange={(name, value) =>
                      setVariableValues((prev) => ({
                        ...prev,
                        [name]: value,
                      }))
                    }
                  />
                  <TemplateDetails template={selectedTemplate!} />
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            "p-6 pt-4 border-t border-xon-surface-outline",
            isRTL && "flex-row-reverse",
          )}
        >
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="hover:bg-xon-surface-container-hover"
          >
            {t("common.cancel")}
          </Button>

          {currentStep === "contact" && contactMode === "new" ? (
            <Button
              onClick={handleCreateContact}
              disabled={
                isSubmitting ||
                !contactFormData.name ||
                !contactFormData.phone ||
                !isPhoneValid
              }
              className="gap-2 bg-xon-primary hover:bg-xon-primary-active text-xon-primary-on"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedContact?.id
                ? t("contacts.edit.save", "Save Changes")
                : t("contacts.add.create")}
              <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
            </Button>
          ) : currentStep === "contact" && contactMode === "existing" ? (
            <Button
              onClick={() => setCurrentStep("template")}
              disabled={!selectedContact}
              className="gap-2 bg-xon-primary hover:bg-xon-primary-active text-xon-primary-on"
            >
              {t("common.next", "Next")}
              <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
            </Button>
          ) : isCustomizing ? (
            <Button
              onClick={handleStartChat}
              disabled={isSubmitting}
              className="gap-2 bg-xon-primary hover:bg-xon-primary-active text-xon-primary-on"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("whatsapp_modal.start_conversation")}
            </Button>
          ) : (
            <Button
              onClick={() => {}}
              disabled={true}
              className="gap-2 bg-xon-primary opacity-50"
            >
              {t("whatsapp_modal.select_template")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

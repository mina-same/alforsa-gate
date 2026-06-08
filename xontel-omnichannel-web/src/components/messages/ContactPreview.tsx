import React, { useState } from 'react'
import { User, Phone, ChevronDown, ChevronUp } from 'lucide-react'
import { ContactResponse } from '@/api/contacts/types'

interface ContactPreviewProps {
    contacts: ContactResponse[] | string
    isSender: boolean
}

// Function to parse contact text format like "[Ola W Shimaa\n+20 15 53891454\n+20 15 54519478]"
function parseContactText(text: string): ContactResponse[] {
    if (!text) return []

    // Remove surrounding brackets if present
    const cleanText = text.replace(/^\[|\]$/g, '').trim()

    // Split by newlines
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line)

    if (lines.length === 0) return []

    // First line is the name, subsequent lines are phone numbers
    const name = lines[0]
    const phones = lines.slice(1).filter(line => line.match(/^\+\d/)) // Filter lines that start with +

    return [{
        id: 0,
        organization_id: 0,
        name: name,
        phone: phones.length > 0 ? phones[0] : '',
        email: '',
        middle_name: '',
        last_name: '',
        identifier: '',
        location: '',
        country_code: '',
        contact_type: 0,
        is_blocked: false,
        total_conversations: 0,
        created_at: '',
        updated_at: '',
        tags: phones.slice(1) // Additional phones as tags
    }]
}

export default function ContactPreview({ contacts, isSender }: ContactPreviewProps) {
    const [showAdditionalPhones, setShowAdditionalPhones] = useState(false)

    let contactList: ContactResponse[] = []

    if (typeof contacts === 'string') {
        contactList = parseContactText(contacts)
    } else if (Array.isArray(contacts)) {
        contactList = contacts
    }

    if (!contactList || contactList.length === 0) return null

    return (
        <div className="">
            {contactList.map((contact, index) => (
                <div
                    key={contact.id || index}
                    className="w-full rounded-md overflow-hidden bg-xon-surface-container border border-xon-surface-outline cursor-pointer"
                    onClick={() => setShowAdditionalPhones(!showAdditionalPhones)}
                >
                    <div className="p-5">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-xon-surface-container to-xon-surface-container-hover flex items-center justify-center flex-shrink-0 shadow-sm">
                                {contact.avatar_url ? (
                                    <img
                                        src={contact.avatar_url}
                                        alt={contact.name}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-7 w-7 text-xon-text-secondary" />
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h6 className="font-semibold text-base text-xon-text-primary truncate">
                                        {contact.name}
                                    </h6>
                                    {contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-blue-500">
                                            {showAdditionalPhones ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                            <span>({contact.tags.length})</span>
                                        </div>
                                    )}
                                </div>

                                {/* Phone */}
                                {contact.phone && (
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="flex items-center gap-2 mt-2 group"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Phone className="h-4 w-4  text-blue-500 transition-colors flex-shrink-0" />
                                        <span className="text-sm text-xon-text-secondary group-hover:text-blue-600 truncate transition-colors">
                                            {contact.phone}
                                        </span>
                                    </a>
                                )}

                                {/* Additional phones from tags */}
                                {showAdditionalPhones && contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 && (
                                    contact.tags.map((tag, tagIndex) => (
                                        <a
                                            key={tagIndex}
                                            href={`tel:${tag}`}
                                            className="flex items-center gap-2 group"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Phone className="h-4 w-4 text-xon-text-secondary group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                            <span className="text-sm text-xon-text-secondary group-hover:text-blue-600 truncate transition-colors">
                                                {tag}
                                            </span>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

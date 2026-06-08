import { MessageType, MessageDirection } from "@/api";

export type MediaType =
  | "image"
  | "video"
  | "audio"
  | "file"
  | "link"
  | "location";

export type Call = {
  id: string;
  status: "incoming" | "outgoing" | "missed";
  type: "audio" | "video";
  time: string;
  duration?: string;
};

export type CallWithConversation = Call & {
  conversationId: string;
  conversationName: string;
  conversationAvatar?: string;
};

export type Media = {
  type: MediaType;
  url: string;
  thumbnail?: string;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
  blob?: Blob;
  name: string;
};

export type TemplateMessage = {
  name: string;
  header_text?: string;
  header_media_url?: string;
  header_type?: string;
  body_text: string;
  template_id?: number;
  variables?: Array<{
    name: string;
    type: 'text' | 'image' | 'video' | 'document';
    example: string;
  }>;
  footer_text?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
};

export type Message = {
  id: string;
  numericId?: number;
  text: string;
  senderId: string;
  template_id: number;
  senderName?: string;
  senderAvatar?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  edited?: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  message_type: MessageType;
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
  external_message_id?: string;
  media?: Media;
  replyTo?: {
    messageId: string;
    numericId?: number;
    external_message_id?: string;
    text: string;
    senderName: string;
    senderId?: string;
    message_type?: MessageType;
    media_type?: string;
    media_url?: string;
    media_name?: string;
    direction?: MessageDirection;
    location?: {
      lat: number;
      lng: number;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  media_type?: string;
  template?: TemplateMessage;
  deletedBy?: "me" | "everyone";
  isDraft?: boolean;
  sent_by_user_id?: number;
  sent_by_contact_id?: number;
  direction?: MessageDirection;
  mediaPending?: boolean;
  additional_attributes?: string | Record<string, any>;
  reactions?: Array<{
    /** Emoji character, e.g. "😮" */
    emoji: string;
    /** Whether this reaction was sent by the current user */
    isMine?: boolean;
    /** Server identifiers for the reaction message itself */
    messageId?: string;
    numericId?: number;
    /** When the reaction was created (server timestamp string) */
    createdAt?: string;
    /** Information about the reactor */
    reactorId?: string;
    reactorType?: "user" | "contact";
    userName?: string;
    userAvatar?: string;
    direction?: string;
  }>;
};

export type Conversation = {
  id: string;
  numeric_id?: number;
  name: string;
  calls?: Call[];
  avatar?: string;
  pinned?: boolean;
  unread_messages_count?: number;
  unread?: number;
  lastMessage?: Message;
  last_message_id?: number;
  contact_name?:string;
  contact_avatar_url?:string;
  contact_phone?:string;
  contact_tags?:any[];
  closed?: boolean;
  blocked?: boolean;
  archived?: boolean;
  assigned_agent_id?: number;
  channel_id?: number;
  inbox_id?: number;
  contact_id?: number;
  updated_at?: string;
  status?: string;
  phone?: string;
  conversation_type?: 'group' | 'direct' | 'contact' | 'external';
  subject?: string;
  user_ids?: number[];
};


export interface OutgoingMessage {
  text?: string;
  message_type?: MessageType;
  template_id?: number;


  media?: {
    type: Exclude<MediaType, "link">;
    blob: Blob;
    url: string;
    name: string;
  };

  audio?: {
    blob: Blob;
    url: string;
  };

  location?: {
    lat: number;
    lng: number;
  };
  template?: TemplateMessage;
  
}

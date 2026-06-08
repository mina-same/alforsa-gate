/**
 * API Module Exports
 * Centralized export point for all API endpoints and hooks
 */

// Auth
export { authAPI } from './auth/endpoints';
export * from './auth/hooks';
export type {
  LoginRequest,
  TokenResponse,
  UserRegister,
  UserResponse,
  RefreshTokenRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ChangePasswordRequest,
  PasskeyInfo,
  PasskeyRegisterOptionsRequest,
  PasskeyRegisterVerifyRequest,
  PasskeyLoginOptionsRequest,
  PasskeyLoginVerifyRequest,
} from './auth/types';

// Conversations
export { conversationsAPI } from './conversations/endpoints';
export * from './conversations/hooks';
export type {
  ConversationResponse,
  ConversationSnooze,
  ConversationBulkAction,
  ConversationNoteCreate,
  GetConversationsParams,
} from './conversations/types';

// Messages
export { messagesAPI } from './messages/endpoints';
export * from './messages/hooks';
export type {
  MessageCreate,
  MessageUpdate,
  MessageResponse,
  MessageDirection,
  MessageType,
  MessageStatus,
} from './messages/types';

// Contacts
export { contactsAPI } from './contacts/endpoints';
export * from './contacts/hooks';
export * from './contacts/types';

// Inboxes
export { inboxesAPI } from './inboxes/endpoints';
export * from './inboxes/hooks';
export * from './inboxes/types';

// Users
export { usersAPI } from './users/endpoints';
export * from './users/hooks';
export * from './users/types';

// Teams
export { teamsAPI } from './teams/endpoints';
export * from './teams/hooks';
export * from './teams/types';

// Labels
export { labelsAPI } from './labels/endpoints';
export * from './labels/hooks';
export * from './labels/types';

// Analytics
export { analyticsAPI } from './analytics/endpoints';
export * from './analytics/hooks';
export * from './analytics/types';

// Client
// Canned Responses
export { cannedResponsesAPI } from './canned-responses/endpoints';
export * from './canned-responses/hooks';
export * from './canned-responses/types';

// Channels
export { channelsAPI } from './channels/endpoints';
export * from './channels/hooks';
export * from './channels/types';

// Media
export { mediaAPI } from './media/endpoints';
export * from './media/hooks';
export * from './media/types';

// WhatsApp Templates
export { whatsappTemplatesAPI } from './whatsapp-templates/endpoints';
export * from './whatsapp-templates/hooks';
export * from './whatsapp-templates/types';

// Email
export { emailAPI } from './email/endpoints';
export * from './email/hooks';
export * from './email/types';

// Tags
export { tagsAPI } from './tags/endpoints';
export * from './tags/hooks';
export * from './tags/types';

export { default as apiClient } from './client';

/**
 * Auth API Types
 */

export interface LoginRequest {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface ExternalLoginRequest {
  xontel_token: string;
}

export interface AgentInactivitySetting {
  value: number;
  unit: 'mins' | 'hrs';
  enabled: boolean;
}

export interface AgentInactivitySettings {
  online?: AgentInactivitySetting;
  away?: AgentInactivitySetting;
  busy?: AgentInactivitySetting;
  offline?: AgentInactivitySetting;
}

export interface OrgInternalAttributes {
  agent_inactivity?: AgentInactivitySettings;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  internal_attributes?: string; // JSON-encoded OrgInternalAttributes
}

export interface UserRegister {
  email: string;
  password: string;
  full_name: string;
  organization_id: number;
}

export interface UserResponse {
    id: number;
    email: string;
    full_name: string;
    organization_id: number;
    role: string | UserRole;
    status: string | UserStatus;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    timezone?: string;
    is_agent?: boolean;
    contact_id?: number;
    max_concurrent_chats?: number;
    current_chat_count?: number;
    agent_status?: string;
    last_login?: string;
    is_verified?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Aliases for hook compatibility
export type LoginResponse = TokenResponse;
export type RegisterRequest = UserRegister;
export type RegisterResponse = UserResponse;
export type User = UserResponse;

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * Error response from API
 */
export interface AuthErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  error_code?: string;
  status_code?: number;
}

/**
 * Error codes for authentication
 */
export enum ErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_INACTIVE = 'account_inactive',
  NOT_AGENT = 'not_agent',
  ACCOUNT_LOCKED = 'account_locked',
  RATE_LIMIT = 'rate_limit',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

/**
 * User roles
 */
export enum UserRole {
  AGENT = 'agent',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  USER = 'user',
}

export interface PasskeyInfo {
  id: number;
  credential_id: string;
  display_name: string;
  created_at: string;
  last_used_at: string | null;
}

export interface PasskeyRegisterOptionsRequest {
  displayName?: string;
  username?: string;
}

export interface PasskeyRegisterVerifyRequest {
  challenge: string;
  challenge_nonce?: string;
  credential: object;
  name?: string;
}

export interface PasskeyLoginOptionsRequest {
  email?: string;
}

export interface PasskeyLoginVerifyRequest {
  credential: object; // nonce is nested inside credential by the endpoint function
}

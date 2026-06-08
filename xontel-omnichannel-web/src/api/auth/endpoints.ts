import apiClient from '../client';
import {
  LoginRequest,
  ExternalLoginRequest,
  TokenResponse,
  UserRegister,
  UserResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  PasskeyInfo,
  PasskeyRegisterOptionsRequest,
  PasskeyRegisterVerifyRequest,
  PasskeyLoginOptionsRequest,
  PasskeyLoginVerifyRequest,
} from './types';

/**
 * Auth API Endpoints - /api/v1/auth
 */

export const authAPI = {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register: async (data: UserRegister): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/v1/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.grant_type) formData.append('grant_type', data.grant_type);
    if (data.scope) formData.append('scope', data.scope);
    if (data.client_id) formData.append('client_id', data.client_id);
    if (data.client_secret) formData.append('client_secret', data.client_secret);

    const response = await apiClient.post<TokenResponse>('/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  /**
   * External Login via Xontel Call Center
   * POST /api/v1/auth/external/login
   */
  externalLogin: async (data: ExternalLoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/v1/auth/external/login', data);
    return response.data;
  },

  /**
   * Refresh authentication token
   * POST /api/v1/auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/v1/auth/refresh', null, {
      params: { refresh_token: refreshToken },
    });
    return response.data;
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/v1/auth/logout');
  },

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/v1/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   * PUT /api/v1/auth/me
   */
  updateProfile: async (data: Partial<UserResponse>): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>('/v1/auth/me', data);
    return response.data;
  },

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/v1/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/v1/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Verify email
   * POST /api/v1/auth/verify-email
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/v1/auth/verify-email', {
      token,
    });
    return response.data;
  },
  updateStatus: async (agent_status: string,availability:number=0): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>("/v1/users/me/status", {
      agent_status,
      availability
    });
    return response.data;
  },

  passkeyRegisterOptions: async (data?: PasskeyRegisterOptionsRequest): Promise<any> => {
    const response = await apiClient.post('/v1/auth/passkeys/register/options', data || {});
    // handle both direct options and wrapped { options: {...} }
    return response.data?.options ?? response.data;
  },

  passkeyRegisterVerify: async (data: PasskeyRegisterVerifyRequest): Promise<PasskeyInfo> => {
    const response = await apiClient.post<PasskeyInfo>('/v1/auth/passkeys/register/verify', data);
    return response.data;
  },

  passkeyLoginOptions: async (data?: PasskeyLoginOptionsRequest): Promise<any> => {
    const response = await apiClient.post('/v1/auth/passkeys/login/options', data || {});
    // server also sets a session cookie here — withCredentials ensures browser stores it
    return response.data?.options ?? response.data;
  },

  passkeyLoginVerify: async (credential: object, nonce?: string): Promise<TokenResponse> => {
    // nonce must be nested INSIDE the credential object, per the API contract
    const response = await apiClient.post<TokenResponse>('/v1/auth/passkeys/login/verify', {
      credential: nonce ? { ...credential, nonce } : credential,
    });
    return response.data;
  },

  listPasskeys: async (): Promise<PasskeyInfo[]> => {
    const response = await apiClient.get('/v1/auth/passkeys/');
    const data = response.data;
    return Array.isArray(data) ? data : (data.passkeys || []);
  },

  deletePasskey: async (passkeyId: number): Promise<void> => {
    await apiClient.delete(`/v1/auth/passkeys/${passkeyId}`);
  },
};

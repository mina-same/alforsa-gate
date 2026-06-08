import axios, { AxiosInstance, AxiosError } from 'axios';
import { setSessionCookie } from '@/hooks/useAuth';

/**
 * API Client Configuration
 * Centralized axios instance with interceptors
 */

// API Base URL Configuration
// On localhost: use VITE_API_BASE_URL from .env so you can point at any backend
// On a real deployment: derive from the current origin so no .env config is needed
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost
  ? (import.meta.env.VITE_API_BASE_URL )
  : `${window.location.origin}/api`;

const DEBUG_API_LOGS = import.meta.env.DEV && import.meta.env.VITE_DEBUG_API_LOGS === 'true';

if (DEBUG_API_LOGS) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Flag to prevent multiple redirects
let isRedirecting = false;

// Shared in-flight refresh promise — prevents concurrent 401s from each firing
// their own refresh call and racing to exhaust the refresh token.
let refreshPromise: Promise<{ access_token: string; refresh_token?: string }> | null = null;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required for passkey session cookie (Set-Cookie from /login/options)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Use 'authToken' consistently
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (DEBUG_API_LOGS) {
        console.log('✓ Token added to request:', config.url);
      }
    } else {
      console.warn('⚠ No auth token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as unknown as {
      _retry?: boolean;
      headers: any;
    };

    console.error('✗ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data,
      code: (error as any).code,
    });

    // List of endpoints that should NOT trigger automatic redirect or refresh
    const isAuthEndpoint = error.config?.url?.includes('/v1/auth/');
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent('api:forbidden', { detail: { url: error.config?.url } })
      );
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const isMeEndpoint = error.config?.url?.includes('/v1/auth/me');
      
      // If NOT an auth endpoint (except /auth/me), try to refresh token
      if (!originalRequest._retry && !isAuthEndpoint && !isMeEndpoint) {
        console.log('🔄 Attempting token refresh...');
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            // Serialize concurrent 401s onto a single refresh call so we never
            // race multiple refresh requests and exhaust the refresh token.
            if (!refreshPromise) {
              refreshPromise = axios
                .post(`${API_BASE_URL}/v1/auth/refresh`, null, {
                  params: { refresh_token: refreshToken },
                })
                .then((r) => r.data)
                .finally(() => {
                  refreshPromise = null;
                });
            }

            const { access_token, refresh_token: newRefreshToken } = await refreshPromise;
            localStorage.setItem('authToken', access_token);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Keep session_fp in sync with the new token so App.tsx's fingerprint
            // guard doesn't invalidate the session on the next render.
            setSessionCookie(access_token);

            console.log('✓ Token refreshed successfully');

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          refreshPromise = null;
          console.error('✗ Token refresh failed:', refreshError);
        }
      }

      // If we reach here, it's either:
      // 1. /auth/me failed with 401
      // 2. Token refresh failed
      // 3. Retry after refresh failed
      // 4. Any other auth endpoint failed with 401 (e.g. login - which shouldn't redirect but skip clearing)
      
      const isLoginSignup = error.config?.url?.includes('/v1/auth/login') || error.config?.url?.includes('/v1/auth/signup');

      if (!isLoginSignup) {
        console.error('✗ Unauthorized access. Clearing storage and redirecting...');
        
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('currentUser');
        
        // Clear all local storage to be safe (optional, but requested by user "clear localstorage")
        // localStorage.clear(); 
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        if (!isRedirecting && window.location.pathname !== '/web/login') {
          isRedirecting = true;
          window.location.href = '/web/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

import {
  useMutation,
  useQuery,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { authAPI } from "./endpoints";
import { usersAPI } from "../users/endpoints";
import { analyticsAPI } from "../analytics/endpoints";
import {
  LoginRequest,
  ExternalLoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "./types";
import { useAuthUser, useSetAuthUser, useSetOrgSettings } from "@/contexts/AuthContext";
import type { OrgInternalAttributes } from "./types";
import type { UserResponse } from "@/api/users/types";
import { userPermissionsStorage } from "@/lib/userPermissions";
import { clearSessionCookie, setSessionCookie } from "@/hooks/useAuth";

/**
 * Auth API Hooks using React Query
 */

function storeOrgSettings(
  internalAttributes: string | undefined,
  setOrgSettings: (s: OrgInternalAttributes | null) => void
) {
  if (!internalAttributes) return;
  try {
    const parsed: OrgInternalAttributes = JSON.parse(internalAttributes);
    localStorage.setItem("orgSettings", JSON.stringify(parsed));
    setOrgSettings(parsed);
  } catch {
    // malformed JSON — skip silently
  }
}

/**
 * Login hook
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useSetAuthUser();
  const setOrgSettings = useSetOrgSettings();
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      try {
        // 1. Perform login
        const loginData = await authAPI.login(credentials);
        // Don't fail login if status update fails
        // Store token immediately to allow subsequent authenticated calls
        localStorage.setItem("authToken", loginData.access_token);
        if (loginData.refresh_token) {
          localStorage.setItem("refreshToken", loginData.refresh_token);
        }
        storeOrgSettings(loginData.internal_attributes, setOrgSettings);
        
        await authAPI.updateStatus("online");
        // 2. Fetch current user ('me')
        const meData = await authAPI.getCurrentUser();

        // 3. Check if account is active
        if (meData.status !== "active") {
          // Clear tokens as the login is effectively rejected
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");

          // Throw an error that the UI can catch and display
          const error = new Error("Account is inactive") as any;
          error.response = {
            data: { detail: "Account is inactive. Please contact support." },
            status: 403,
          };
          throw error;
        }

        // Store current user data
        setAuthUser(meData);
        localStorage.setItem("currentUser", JSON.stringify(meData));

        // 4. Fetch full user profile by ID to get complete data
        if (meData.id) {
          try {
            // Note: Ensuring the ID is treated as a number as per the API definition
            const userId =
              typeof meData.id === "string"
                ? parseInt(meData.id, 10)
                : meData.id;

            // Try fetching the full profile
            const fullUserData = await usersAPI.getUser(userId);

            // Store the full profile data
            localStorage.setItem("userProfile", JSON.stringify(fullUserData));

            // 5. Fetch user inboxes
            try {
              const inboxes = await usersAPI.getUserInboxes(userId);
              localStorage.setItem("userInboxes", JSON.stringify(inboxes));
            } catch (inboxError) {
              console.error("✗ Failed to fetch user inboxes:", inboxError);
              // We might still allow login if inboxes fail, but based on user prompt,
              // let's be careful. Actually, I'll just log it.
            }

            // 6. Fetch user permissions
            try {
              const permissionsData = await usersAPI.getPermissions(userId);
              userPermissionsStorage.set(permissionsData);
            } catch (permError) {
              console.error("✗ Failed to fetch user permissions:", permError);
            }

            // Also update currentUser with any missing fields from full profile if necessary
            localStorage.setItem(
              "currentUser",
              JSON.stringify({ ...meData, ...fullUserData }),
            );
          } catch (profileError) {
            console.error("✗ User profile fetch failed:", profileError);
            // If the profile fetch fails, we still consider the login incomplete
            // as per requirements, so we clear and throw.
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("userProfile");
            throw profileError;
          }
        }

        // 6. Update user status to online
      

        return loginData;
      } catch (error) {
        // If any step fails (login or me call), ensure we don't leave partial state
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userProfile");
        throw error;
      }
    },
    onSuccess: (data: LoginResponse) => {
      console.log("✓ Login and data fetching successful");
      window.dispatchEvent(new Event("app:login"));
      const today = new Date().toISOString().split('T')[0];
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'myAgent', { start_date: today, end_date: today }],
        queryFn: () => analyticsAPI.getMyAgentAnalytics({ start_date: today, end_date: today }),
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
    onError: (error: any) => {
      console.error("✗ Login failed:", {
        status: error.response?.status,
        message: error.response?.data?.detail || error.message,
      });
      // Clear any existing tokens and data on login failure
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userProfile");
    },
  });
};

/**
 * External login hook
 */
export const useExternalLogin = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useSetAuthUser();
  const setOrgSettings = useSetOrgSettings();
  return useMutation({
    mutationFn: async (credentials: ExternalLoginRequest) => {
      try {
        const loginData = await authAPI.externalLogin(credentials);
        localStorage.setItem("authToken", loginData.access_token);
        if (loginData.refresh_token) {
          localStorage.setItem("refreshToken", loginData.refresh_token);
        }
        storeOrgSettings(loginData.internal_attributes, setOrgSettings);
        
        await authAPI.updateStatus("online");
        const meData = await authAPI.getCurrentUser();

        if (meData.status !== "active") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          const error = new Error("Account is inactive") as any;
          error.response = {
            data: { detail: "Account is inactive. Please contact support." },
            status: 403,
          };
          throw error;
        }

        setAuthUser(meData);
        localStorage.setItem("currentUser", JSON.stringify(meData));

        if (meData.id) {
          try {
            const userId = typeof meData.id === "string" ? parseInt(meData.id, 10) : meData.id;
            const fullUserData = await usersAPI.getUser(userId);
            localStorage.setItem("userProfile", JSON.stringify(fullUserData));
            try {
              const inboxes = await usersAPI.getUserInboxes(userId);
              localStorage.setItem("userInboxes", JSON.stringify(inboxes));
            } catch (inboxError) {
              console.error("✗ Failed to fetch user inboxes:", inboxError);
            }
            try {
              const permissionsData = await usersAPI.getPermissions(userId);
              userPermissionsStorage.set(permissionsData);
            } catch (permError) {
              console.error("✗ Failed to fetch user permissions:", permError);
            }
            localStorage.setItem("currentUser", JSON.stringify({ ...meData, ...fullUserData }));
          } catch (profileError) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("userProfile");
            throw profileError;
          }
        }
        return loginData;
      } catch (error) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userProfile");
        throw error;
      }
    },
    onSuccess: () => {
      console.log("✓ External Login and data fetching successful");
      window.dispatchEvent(new Event("app:login"));
      const today = new Date().toISOString().split('T')[0];
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'myAgent', { start_date: today, end_date: today }],
        queryFn: () => analyticsAPI.getMyAgentAnalytics({ start_date: today, end_date: today }),
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
    onError: (error: any) => {
      console.error("✗ External Login failed:", {
        status: error.response?.status,
        message: error.response?.data?.detail || error.message,
      });
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userProfile");
    },
  });
};

/**
 * Register hook
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });
};

/**
 * Get current user hook
 */
export const useCurrentUser = (): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update profile hook
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => authAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });
};

/**
 * Change password hook
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => authAPI.changePassword(oldPassword, newPassword),
  });
};

/**
 * Logout hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const setOrgSettings = useSetOrgSettings();
  return useMutation({
    mutationFn: async () => {
      // Update status to offline before logging out
      try {
        await authAPI.updateStatus("offline");
      } catch (error) {
        console.error("Failed to update status to offline:", error);
        // Don't fail logout if status update fails
      }
      return authAPI.logout();
    },
    onSuccess: () => {
      // Clear all auth tokens and user data
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userInboxes");
      localStorage.removeItem("orgSettings");
      clearSessionCookie();
      userPermissionsStorage.clear();
      setOrgSettings(null);
      queryClient.clear();
      window.location.href = "/web/login";
    },
  });
};

/**
 * Update user status hook
 */
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useSetAuthUser();
  // Use the server-authoritative user ID from context, never from localStorage.
  // Reading from localStorage here would let a tampered value corrupt context state
  // and cause an infinite render loop across sidebar/permission components.
  const currentUserId = useAuthUser().id;

  return useMutation({
    mutationFn: (status: string) => authAPI.updateStatus(status),
    onSuccess: async (data) => {
      const userId = currentUserId;

      const currentUser = localStorage.getItem("currentUser");
      const userData = currentUser ? JSON.parse(currentUser) : {};
      // Force the correct id from context so tampered localStorage can't bleed in.
      const updatedUser = { ...userData, ...data, status: data.status, id: userId };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setAuthUser(updatedUser);

      if (userId) {
        try {
          const fullUserData = await usersAPI.getUser(Number(userId));
          localStorage.setItem("userProfile", JSON.stringify(fullUserData));
          localStorage.setItem(
            "currentUser",
            JSON.stringify({ ...updatedUser, ...fullUserData }),
          );
        } catch (error) {
          console.error("✗ Failed to refresh user profile:", error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["users", Number(userId)] });
        queryClient.invalidateQueries({ queryKey: ["users", Number(userId), "permissions"] });
      }
    },
  });
};

/**
 * Forgot password hook
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
  });
};

/**
 * Reset password hook
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authAPI.resetPassword(token, newPassword),
  });
};

/**
 * Verify email hook
 */
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authAPI.verifyEmail(token),
  });
};

/**
 * Refresh token hook
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authAPI.refreshToken(refreshToken),
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("authToken", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
      }
      setSessionCookie(data.access_token);
    },
  });
};

import {
  prepareRegistrationOptions,
  prepareAuthenticationOptions,
  serializeRegistrationCredential,
  serializeAuthenticationCredential,
} from "@/utils/passkey";

async function completeLoginWithTokens(
  loginData: LoginResponse,
  setAuthUser: (user: UserResponse) => void,
  setOrgSettings: (s: OrgInternalAttributes | null) => void
) {
  localStorage.setItem("authToken", loginData.access_token);
  if (loginData.refresh_token) {
    localStorage.setItem("refreshToken", loginData.refresh_token);
  }
  storeOrgSettings(loginData.internal_attributes, setOrgSettings);

  await authAPI.updateStatus("online");
  const meData = await authAPI.getCurrentUser();

  if (meData.status !== "active") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    const error = new Error("Account is inactive") as any;
    error.response = {
      data: { detail: "Account is inactive. Please contact support." },
      status: 403,
    };
    throw error;
  }

  setAuthUser(meData);
  localStorage.setItem("currentUser", JSON.stringify(meData));

  if (meData.id) {
    const userId = typeof meData.id === "string" ? parseInt(meData.id, 10) : meData.id;
    const fullUserData = await usersAPI.getUser(userId);
    localStorage.setItem("userProfile", JSON.stringify(fullUserData));
    try {
      const inboxes = await usersAPI.getUserInboxes(userId);
      localStorage.setItem("userInboxes", JSON.stringify(inboxes));
    } catch {}
    try {
      const permissionsData = await usersAPI.getPermissions(userId);
      userPermissionsStorage.set(permissionsData);
    } catch {}
    localStorage.setItem("currentUser", JSON.stringify({ ...meData, ...fullUserData }));
  }

  return loginData;
}

/**
 * Passkey login — triggers native browser biometric/passkey prompt.
 * Accepts optional email to help the server filter this user's passkeys.
 */
export const usePasskeyLogin = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useSetAuthUser();
  const setOrgSettings = useSetOrgSettings();

  return useMutation({
    mutationFn: async (email?: string) => {
      try {
        // 1. Get challenge — server also sets session cookie (withCredentials handles it)
        const serverOptions = await authAPI.passkeyLoginOptions(email ? { email } : undefined);

        // 2. Convert base64url fields to ArrayBuffers and trigger browser prompt
        const requestOptions = prepareAuthenticationOptions(serverOptions);
        const raw = await navigator.credentials.get({ publicKey: requestOptions }) as PublicKeyCredential | null;
        if (!raw) throw new Error("No credential returned from browser.");

        // 3. Serialize back to base64url and POST — nonce nested inside credential
        const serialized = serializeAuthenticationCredential(raw);
        const loginData = await authAPI.passkeyLoginVerify(serialized, serverOptions.nonce);

        return await completeLoginWithTokens(loginData, setAuthUser, setOrgSettings);
      } catch (error) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userProfile");
        throw error;
      }
    },
    onSuccess: () => {
      window.dispatchEvent(new Event("app:login"));
      const today = new Date().toISOString().split('T')[0];
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'myAgent', { start_date: today, end_date: today }],
        queryFn: () => analyticsAPI.getMyAgentAnalytics({ start_date: today, end_date: today }),
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });
};

/**
 * Register a new passkey for the current logged-in user.
 * Accepts an optional display name shown in the passkey manager.
 */
export const useRegisterPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (displayName?: string) => {
      // 1. Get registration challenge from server
      const serverOptions = await authAPI.passkeyRegisterOptions(
        displayName ? { displayName } : undefined
      );

      // 2. Convert base64url fields to ArrayBuffers and trigger browser prompt
      const creationOptions = prepareRegistrationOptions(serverOptions);
      const raw = await navigator.credentials.create({ publicKey: creationOptions }) as PublicKeyCredential | null;
      if (!raw) throw new Error("No credential returned from browser.");

      // 3. Serialize and verify with server
      const serialized = serializeRegistrationCredential(raw);
      return authAPI.passkeyRegisterVerify({
        challenge: serverOptions.challenge,
        challenge_nonce: serverOptions.nonce,
        credential: serialized,
        name: displayName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
    },
  });
};

/**
 * List passkeys registered to the current user
 */
export const useListPasskeys = () => {
  return useQuery({
    queryKey: ["auth", "passkeys"],
    queryFn: () => authAPI.listPasskeys(),
    staleTime: 60 * 1000,
  });
};

/**
 * Delete a passkey by ID
 */
export const useDeletePasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passkeyId: number) => authAPI.deletePasskey(passkeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
    },
  });
};

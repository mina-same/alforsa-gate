/**
 * Form Validation Utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

/**
 * Validate login form
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate signup form
 */
export const validateSignupForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword?: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Full name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
  }

  // Email validation
  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password validation
  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.message || 'Invalid password' });
    }
  }

  // Confirm password validation
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  return errors.find((err) => err.field === field)?.message;
};

/**
 * Error category for better error handling
 */
export enum ErrorCategory {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_INACTIVE = 'account_inactive',
  NOT_AGENT = 'not_agent',
  ACCOUNT_LOCKED = 'account_locked',
  RATE_LIMIT = 'rate_limit',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface ParsedError {
  message: string;
  category: ErrorCategory;
  originalError?: any;
}

/**
 * Parse API error response with categorization
 */
export const parseApiError = (error: unknown): string => {
  const parsed = parseApiErrorDetailed(error);
  return parsed.message;
};

/**
 * Parse API error response with detailed categorization
 */
export const parseApiErrorDetailed = (error: unknown): ParsedError => {
  try {
    if (error instanceof Error) {
      // Check if it's an Axios error
      if ('response' in error) {
        const axiosError = error as any;
        const data = axiosError.response?.data;
        const status = axiosError.response?.status;

        // Extract error message from different formats
        let errorMessage = '';
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data?.detail) {
          errorMessage = data.detail;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        }

        const errorLower = errorMessage.toLowerCase();

        // Categorize errors based on message content and status code

        // Check for inactive account
        if (
          errorLower.includes('inactive') ||
          errorLower.includes('disabled') ||
          errorLower.includes('deactivated') ||
          errorLower.includes('account is not active') ||
          data?.error_code === 'account_inactive'
        ) {
          return {
            message: errorMessage || 'Your account is inactive. Please contact support to activate your account.',
            category: ErrorCategory.ACCOUNT_INACTIVE,
            originalError: error,
          };
        }

        // Check for non-agent user
        if (
          errorLower.includes('not an agent') ||
          errorLower.includes('not agent') ||
          errorLower.includes('agent only') ||
          errorLower.includes('restricted to agents') ||
          errorLower.includes('access denied') ||
          data?.error_code === 'not_agent'
        ) {
          return {
            message: errorMessage || 'Access denied. This portal is restricted to agent accounts only.',
            category: ErrorCategory.NOT_AGENT,
            originalError: error,
          };
        }

        // Check for account locked
        if (
          errorLower.includes('locked') ||
          errorLower.includes('suspended') ||
          errorLower.includes('blocked') ||
          data?.error_code === 'account_locked'
        ) {
          return {
            message: errorMessage || 'Your account has been locked due to multiple failed login attempts. Please try again later or contact support.',
            category: ErrorCategory.ACCOUNT_LOCKED,
            originalError: error,
          };
        }

        // Check for rate limiting
        if (
          errorLower.includes('too many') ||
          errorLower.includes('rate limit') ||
          errorLower.includes('try again later') ||
          status === 429 ||
          data?.error_code === 'rate_limit'
        ) {
          return {
            message: errorMessage || 'Too many login attempts. Please wait a few minutes and try again.',
            category: ErrorCategory.RATE_LIMIT,
            originalError: error,
          };
        }

        // Check for invalid credentials
        if (
          errorLower.includes('invalid') ||
          errorLower.includes('incorrect') ||
          errorLower.includes('wrong password') ||
          errorLower.includes('authentication failed') ||
          status === 401 ||
          data?.error_code === 'invalid_credentials'
        ) {
          return {
            message: errorMessage || 'Invalid email or password. Please try again.',
            category: ErrorCategory.INVALID_CREDENTIALS,
            originalError: error,
          };
        }

        // Check for network errors
        if (
          axiosError.code === 'ECONNABORTED' ||
          axiosError.code === 'ERR_NETWORK' ||
          axiosError.message?.includes('Network Error')
        ) {
          return {
            message: 'Network error. Please check your connection and try again.',
            category: ErrorCategory.NETWORK_ERROR,
            originalError: error,
          };
        }

        // Check for server errors
        if (status >= 500) {
          return {
            message: errorMessage || 'Server error. Please try again later.',
            category: ErrorCategory.SERVER_ERROR,
            originalError: error,
          };
        }

        // Return the error message if we have one
        if (errorMessage) {
          return {
            message: errorMessage,
            category: ErrorCategory.UNKNOWN_ERROR,
            originalError: error,
          };
        }
      }

      // Network or other errors
      if (error.message?.includes('Network Error')) {
        return {
          message: 'Network error. Please check your connection and try again.',
          category: ErrorCategory.NETWORK_ERROR,
          originalError: error,
        };
      }

      return {
        message: error.message || 'An unexpected error occurred. Please try again.',
        category: ErrorCategory.UNKNOWN_ERROR,
        originalError: error,
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        category: ErrorCategory.UNKNOWN_ERROR,
        originalError: error,
      };
    }

    return {
      message: 'An unexpected error occurred. Please try again.',
      category: ErrorCategory.UNKNOWN_ERROR,
      originalError: error,
    };
  } catch (parseError) {
    console.error('Error parsing API error:', parseError);
    return {
      message: 'An unexpected error occurred. Please try again.',
      category: ErrorCategory.UNKNOWN_ERROR,
      originalError: error,
    };
  }
};

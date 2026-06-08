import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Button } from '@components/ui/button'
import { Skeleton } from '@components/ui/skeleton'
import { useTranslation } from 'react-i18next';
import { useLogin, useExternalLogin, type LoginResponse } from '@api'
import RobotCheckbox from './RobotCheckbox'
import authImage from '@assets/auth/image.png'
import logoDark from '@assets/logos/logoDark.svg'
import logoArDark from '@assets/logos/logoArDark.svg'
import { Bot, AlertCircle, X, Eye, EyeOff, Fingerprint } from 'lucide-react'
import { validateLoginForm, parseApiErrorDetailed, ErrorCategory } from '@/utils/validation'
import { notificationService } from '@/services/notificationService'
import { usePasskeyLogin } from '@api'
import { isPasskeySupported } from '@/utils/passkey'

type Props = {
  onSuccess: (token: string) => void
  onSwitchToSignup?: () => void
  onSwitchToForgotPassword?: () => void
}

export default function LoginForm({ onSuccess, onSwitchToSignup, onSwitchToForgotPassword }: Props) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isNotRobot, setIsNotRobot] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [errorCategory, setErrorCategory] = useState<ErrorCategory | null>(null)
  const { t, i18n } = useTranslation('login')
  const lang = i18n.language || 'en';
  const isRTL = i18n.language === 'ar'

  const [searchParams] = useSearchParams()
  const externalToken = searchParams.get('access_token')

  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { mutate: externalLogin, isPending: isExternalLoginPending } = useExternalLogin()
  const { mutate: passkeyLogin, isPending: isPasskeyPending } = usePasskeyLogin()

  const isPending = isLoginPending || isExternalLoginPending || isPasskeyPending

  const handleDismissError = () => {
    setError(null)
    setErrorCategory(null)
  }

  const handleNavigateToSignup = () => {
    navigate('../signup')
  }

  const handleNavigateToForgotPassword = () => {
    navigate('../forgot-password')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Unlocks audio for the session since this is a user-initiated event
    notificationService.unlockAudio()
    setError(null)

    if (externalToken) {
      externalLogin(
        { xontel_token: externalToken },
        {
          onSuccess: (data: LoginResponse) => {
            try {
              onSuccess(data.access_token)
              navigate('/')
            } catch (navError) {
              console.error('Navigation error:', navError)
              setError('Login successful but navigation failed. Please refresh the page.')
            }
          },
          onError: (err: Error) => {
            try {
              const parsedError = parseApiErrorDetailed(err)
              setError(parsedError.message || 'An error occurred during external login')
              setErrorCategory(parsedError.category)
            } catch (parseError) {
              setError('External login failed')
              setErrorCategory(ErrorCategory.UNKNOWN_ERROR)
            }
          },
        }
      )
      return
    }

    try {
      // Validate form inputs
      const validation = validateLoginForm(email, password)
      if (!validation.isValid) {
        const firstError = validation.errors[0]?.message
        setError(firstError || t('error_missing_credentials') || 'Please check your inputs')
        return
      }

      // Check CAPTCHA
      if (!isNotRobot) {
        setError(t('error_robot_check') || 'Please verify that you are not a robot')
        return
      }

      // Call login API
      login(
        { username: email, password },
        {
          onSuccess: (data: LoginResponse) => {
            try {
              onSuccess(data.access_token)
              navigate('/')
            } catch (navError) {
              console.error('Navigation error:', navError)
              setError('Login successful but navigation failed. Please refresh the page.')
            }
          },
          onError: (err: Error) => {
            try {
              const parsedError = parseApiErrorDetailed(err)
              console.error('Login error:', { category: parsedError.category, message: parsedError.message })

              // Set error message based on category with translation fallback
              let errorMessage = parsedError.message

              switch (parsedError.category) {
                case ErrorCategory.ACCOUNT_INACTIVE:
                  errorMessage = t('error_account_inactive') || parsedError.message
                  break
                case ErrorCategory.NOT_AGENT:
                  errorMessage = t('error_not_agent') || parsedError.message
                  break
                case ErrorCategory.ACCOUNT_LOCKED:
                  errorMessage = t('error_account_locked') || parsedError.message
                  break
                case ErrorCategory.RATE_LIMIT:
                  errorMessage = t('error_rate_limit') || parsedError.message
                  break
                case ErrorCategory.NETWORK_ERROR:
                  errorMessage = t('error_network') || parsedError.message
                  break
                case ErrorCategory.SERVER_ERROR:
                  errorMessage = t('error_server') || parsedError.message
                  break
                case ErrorCategory.INVALID_CREDENTIALS:
                  errorMessage = t('error_invalid_credentials') || parsedError.message
                  break
                default:
                  errorMessage = parsedError.message || t('error_invalid_credentials') || 'An error occurred'
              }

              setError(errorMessage)
              setErrorCategory(parsedError.category)
            } catch (parseError) {
              console.error('Error parsing API response:', parseError)
              setError(t('error_invalid_credentials') || 'Invalid email or password')
              setErrorCategory(ErrorCategory.UNKNOWN_ERROR)
            }
          },
        }
      )
    } catch (err) {
      console.error('Form submission error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  // Define the current year for the footer
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-xon-surface text-xon-text-primary flex flex-col">
      {/* <Header /> */}
      <div className="grid lg:grid-cols-2 flex-1">

        {/* Left side / marketing panel (hidden on mobile) */}
        <div className="relative hidden lg:flex flex-col justify-between border-r border-xon-surface-outline px-12 py-10 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">

          {/* Left-side background image */}
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            src={authImage}
            alt="Authentication visual"
          />

          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Logo at top */}
            <div className="mb-4">
              <img src={isRTL ? logoArDark : logoDark} alt="Telsip Logo" className="h-12 w-auto" />
            </div>

            {/* Text in middle */}
            <div className="space-y-4 max-w-md">
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {t('welcome_title')}
              </h1>
              <p className="text-sm text-zinc-200/80">
                {t('sign_in_prompt')}
              </p>
            </div>

            {/* Copyright footer */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-zinc-400">
                {currentYear} Telsip. All rights reserved.
              </p>
              <Link
                to="/privacy-policy"
                className="text-xs text-zinc-400 hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                {t('privacy_policy_link')}
              </Link>
            </div>
          </div>
        </div>

        {/* Right side / auth card */}
        <div className="flex flex-col px-12 py-10 bg-xon-surface">
          <div className="flex-1 flex items-center">
            <div className="mx-auto w-full max-w-md space-y-6">
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('login_title')}
                </h2>
                <p className="text-sm text-xon-text-secondary">
                  {t('form_title')}
                </p>
              </div>

              <div className="bg-xon-surface-container border border-xon-surface-outline rounded-xl p-6 shadow-md backdrop-blur">
                {isPending ? (
                  <div className="space-y-4" aria-busy="true" aria-live="polite">
                    <div className="space-y-2">
                      <Skeleton variant="text" className="h-4 w-20" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>

                    <div className="space-y-2">
                      <Skeleton variant="text" className="h-4 w-24" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>

                    <div className="flex justify-end">
                      <Skeleton variant="text" className="h-3 w-24" />
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-xon-surface-outline" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                            <Bot />
                          </span>
                        </div>
                      </div>
                    </div>

                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-9 w-full rounded-md" />

                    <div className="mt-4 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-xon-surface-outline" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div
                        className={`flex items-start gap-3 p-3 rounded-lg border ${errorCategory === ErrorCategory.ACCOUNT_INACTIVE ||
                          errorCategory === ErrorCategory.NOT_AGENT ||
                          errorCategory === ErrorCategory.ACCOUNT_LOCKED
                          ? 'bg-xon-container-yellow border-xon-yellow'
                          : 'bg-xon-container-red border-xon-red'
                        }`}
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${errorCategory === ErrorCategory.ACCOUNT_INACTIVE ||
                              errorCategory === ErrorCategory.NOT_AGENT ||
                              errorCategory === ErrorCategory.ACCOUNT_LOCKED
                              ? 'text-xon-text-yellow'
                              : 'text-xon-text-red'
                            }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm ${errorCategory === ErrorCategory.ACCOUNT_INACTIVE ||
                                errorCategory === ErrorCategory.NOT_AGENT ||
                                errorCategory === ErrorCategory.ACCOUNT_LOCKED
                                ? 'text-xon-text-yellow'
                                : 'text-xon-text-red'
                              }`}
                          >
                            {error}
                          </p>
                          {(errorCategory === ErrorCategory.ACCOUNT_INACTIVE ||
                            errorCategory === ErrorCategory.ACCOUNT_LOCKED) && (
                              <a
                                href="mailto:support@telsip.net"
                                className="inline-block mt-2 text-xs font-medium text-xon-text-yellow hover:underline"
                              >
                                {t('contact_support')}
                              </a>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={handleDismissError}
                          className={`flex-shrink-0 ${errorCategory === ErrorCategory.ACCOUNT_INACTIVE ||
                              errorCategory === ErrorCategory.NOT_AGENT ||
                              errorCategory === ErrorCategory.ACCOUNT_LOCKED
                              ? 'text-xon-text-yellow hover:opacity-80'
                              : 'text-xon-text-red hover:opacity-80'
                            }`}
                          aria-label="Dismiss error"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {externalToken ? (
                      <div className="py-4 text-center">
                        <p className="text-sm text-xon-text-secondary">
                          {t('external_auth_prompt') || 'Authenticate using your secure access token.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className={`text-sm font-medium text-xon-text-primary ${isRTL ? 'text-right block' : ''}`} htmlFor="email">
                            {t('email_label')}
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder={t('email_placeholder') || 'Enter your email'}
                            className={`flex h-9 w-full rounded-lg border border-xon-surface-outline bg-xon-surface-container-hover px-3 py-1 text-sm shadow-sm outline-none transition-all duration-200 text-xon-text-primary placeholder:text-xon-text-secondary placeholder:transition-colors focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface hover:border-xon-primary/60 ${isRTL ? 'text-right' : ''}`}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isPending}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-sm font-medium text-xon-text-primary ${isRTL ? 'text-right block' : ''}`} htmlFor="password">
                            {t('password_label')}
                          </label>
                          <div className="relative">
                            <input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder={t('password_placeholder') || 'Enter your password'}
                              className={`flex h-9 w-full rounded-lg border border-xon-surface-outline bg-xon-surface-container-hover px-3 py-1 text-sm shadow-sm outline-none transition-all duration-200 text-xon-text-primary placeholder:text-xon-text-secondary placeholder:transition-colors focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface hover:border-xon-primary/60 ${isRTL ? 'text-right pl-10' : 'pr-10'}`}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              disabled={isPending}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => !prev)}
                              disabled={isPending}
                              className={`absolute top-1/2 -translate-y-1/2 text-xon-text-secondary hover:text-xon-text-primary transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleNavigateToForgotPassword}
                            className="text-xs text-xon-primary hover:underline cursor-pointer"
                          >
                            {t('forgot_password_link') || 'Forgot password?'}
                          </button>
                        </div>

                        <div className="mt-4 space-y-4">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-xon-surface-outline" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                                <Bot />
                              </span>
                            </div>
                          </div>
                        </div>

                        <RobotCheckbox checked={isNotRobot} onChange={setIsNotRobot} />
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? (t('login_button_loading') || 'Logging in...') : t('login_button')}
                    </Button>

                    {!externalToken && isPasskeySupported() && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-xon-surface-outline" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                              {t('or') || 'or'}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full gap-2"
                          disabled={isPending}
                          onClick={() => {
                            notificationService.unlockAudio()
                            setError(null)
                            // pass email so the server can filter this user's passkeys
                            passkeyLogin(email || undefined, {
                              onSuccess: (data) => {
                                onSuccess(data.access_token)
                                navigate('/')
                              },
                              onError: (err: any) => {
                                console.error('[Passkey login error]', err)
                                const domName: string = err?.name ?? ''
                                if (domName === 'NotAllowedError') {
                                  // user cancelled the browser prompt — stay silent
                                  return
                                }
                                const parsed = parseApiErrorDetailed(err)
                                setError(
                                  parsed.message ||
                                  (err?.message && err.message !== '[object Object]' ? err.message : null) ||
                                  t('error_passkey_failed') || 'Passkey sign-in failed'
                                )
                                setErrorCategory(ErrorCategory.UNKNOWN_ERROR)
                              },
                            })
                          }}
                        >
                          <Fingerprint className="h-4 w-4" />
                          {isPasskeyPending
                            ? (t('passkey_button_loading') || 'Verifying...')
                            : (t('passkey_button') || 'Sign in with passkey')}
                        </Button>
                      </>
                    )}

                    {/* <div className="mt-4 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-xon-surface-outline" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-xon-surface-container px-2 text-xon-text-secondary">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Button variant="outline" type="button" className="h-10 w-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                          >
                            <path
                              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="sr-only">Login with Apple</span>
                        </Button>

                        <Button variant="outline" type="button" className="h-10 w-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                          >
                            <path
                              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="sr-only">Login with Google</span>
                        </Button>

                        <Button variant="outline" type="button" className="h-10 w-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                          >
                            <path
                              d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="sr-only">Login with Meta</span>
                        </Button>
                      </div>
                    </div> */}
                  </form>
                )}
              </div>

              {/* <p className="mt-4 text-xs text-xon-text-secondary text-center">
                {t('no_account_prompt')} {" "}
                <button
                  onClick={handleNavigateToSignup}
                  className="font-medium text-xon-primary underline-offset-4 hover:underline cursor-pointer"
                >
                  {t('signup_link')}
                </button>
              </p> */}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
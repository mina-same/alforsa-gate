import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Button } from '@components/ui/button'
import { Skeleton } from '@components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import { useForgotPassword, useResetPassword } from '@api'
import authImage from '../../assets/auth/image.png'
import logoDark from '../../assets/logos/logoDark.svg'
import logoArDark from '../../assets/logos/logoArDark.svg'
import { ChevronLeft, Mail, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@components/ui/input-otp'

type ForgotPasswordStep = 'email' | 'otp' | 'reset'

interface ForgotPasswordProps {
  onBackToLogin?: () => void
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps = {}) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialStep: ForgotPasswordStep = params.get('step') === 'otp' || location.pathname.endsWith('/otp') ? 'otp' : 'email'
  const [step, setStep] = useState<ForgotPasswordStep>(initialStep)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { t, i18n } = useTranslation('login')
  const isRTL = i18n.language === 'ar'

  const { mutate: forgotPassword, isPending: isForgotLoading } = useForgotPassword()
  const { mutate: resetPassword, isPending: isResetLoading } = useResetPassword()

  const currentYear = new Date().getFullYear()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError(t('error_missing_credentials') || 'Please enter your email')
      return
    }

    forgotPassword(email, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setStep('otp')
        }, 1500)
      },
      onError: (err: Error) => {
        if (err instanceof Error && 'response' in err) {
          const axiosErr = err as AxiosError<any>
          setError(axiosErr.response?.data?.detail || 'Failed to send reset code')
        } else {
          setError(err.message || 'Failed to send reset code')
        }
      },
    })
  }

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // For OTP, we'll use the token from the form
    // In a real app, this would be sent from the API
    setStep('reset')
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError('Please enter both password fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    resetPassword(
      { token: resetToken || email, newPassword: password },
      {
        onSuccess: () => {
          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            handleBackToLogin()
          }, 1500)
        },
        onError: (err: Error) => {
          if (err instanceof Error && 'response' in err) {
            const axiosErr = err as AxiosError<any>
            setError(axiosErr.response?.data?.detail || 'Failed to reset password')
          } else {
            setError(err.message || 'Failed to reset password')
          }
        },
      }
    )
  }

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin()
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-xon-surface text-xon-text-primary flex flex-col">
      <div className="grid lg:grid-cols-2 flex-1">
        {/* Left side / marketing panel (hidden on mobile) */}
        <div className="relative hidden lg:flex flex-col justify-between border-r border-xon-surface-outline px-12 py-10 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            src={authImage}
            alt="Authentication visual"
          />
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
            <p className="text-xs text-zinc-400">
              2025 Telsip. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right side / auth card */}
        <div className="flex flex-col px-12 py-10 bg-xon-surface">
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-1 text-sm text-xon-primary hover:underline w-fit"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('back_button')}
          </button>

          <div className="flex-1 flex items-center">
            <div className="mx-auto w-full max-w-md space-y-6">
              {/* Email Step */}
              {step === 'email' && (
                <>
                  <div className="flex flex-col space-y-3 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 rounded-full bg-xon-container-blue">
                        <Mail className="h-6 w-6 text-xon-primary" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {t('forgot_password_title')}
                    </h2>
                    <p className="text-sm text-xon-text-secondary max-w-sm mx-auto">
                      {t('forgot_password_description')}
                    </p>
                  </div>

                  <div className="bg-xon-surface-container border border-xon-surface-outline rounded-xl p-8 shadow-md backdrop-blur space-y-6">
                    {isForgotLoading ? (
                      <div className="space-y-6" aria-busy="true" aria-live="polite">
                        <div className="space-y-2">
                          <Skeleton variant="text" className="h-4 w-32" />
                          <Skeleton className="h-11 w-full rounded-lg" />
                        </div>
                        <Skeleton className="h-11 w-full rounded-md" />
                      </div>
                    ) : (
                      <form onSubmit={handleEmailSubmit} className="space-y-6">
                      {error && (
                        <div className="p-3 rounded-lg bg-xon-container-red border border-xon-red">
                          <p className="text-sm text-xon-text-red">{error}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-xon-text-primary" htmlFor="email">
                          {t('email_address_label')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder={t('email_placeholder') || 'you@example.com'}
                          className="flex h-11 w-full rounded-lg bg-xon-surface-container-hover border border-xon-surface-outline px-4 py-2 text-sm shadow-sm outline-none transition-all duration-200 text-xon-text-primary placeholder:text-xon-text-secondary placeholder:transition-colors hover:border-xon-primary/60 focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={isForgotLoading}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold"
                        disabled={isForgotLoading}
                      >
                        {showSuccess ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t('code_sent') || 'Code Sent!'}
                          </>
                        ) : (
                          t('send_reset_code_button')
                        )}
                      </Button>
                    </form>
                    )}
                  </div>
                </>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <>
                  <div className="flex flex-col space-y-3 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 rounded-full bg-xon-container-blue">
                        <CheckCircle2 className="h-6 w-6 text-xon-primary" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {t('verify_email_title')}
                    </h2>
                    <p className="text-sm text-xon-text-secondary max-w-sm mx-auto">
                      {t('verify_email_description')} <span className="font-semibold text-xon-text-primary">{email}</span>
                    </p>
                  </div>

                  <div className="bg-xon-surface-container border border-xon-surface-outline rounded-xl p-8 shadow-md backdrop-blur">
                    <form onSubmit={handleOTPSubmit} className="space-y-8">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="otp" className="sr-only">
                            {t('verification_code_label')}
                          </FieldLabel>
                          <div className="flex justify-center">
                            <InputOTP maxLength={6} id="otp" required>
                              <InputOTPGroup className="gap-3 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-lg *:data-[slot=input-otp-slot]:font-semibold *:data-[slot=input-otp-slot]:bg-xon-surface-container-hover *:data-[slot=input-otp-slot]:border-0">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                              </InputOTPGroup>
                              <InputOTPSeparator className="text-xon-text-secondary" />
                              <InputOTPGroup className="gap-3 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-lg *:data-[slot=input-otp-slot]:font-semibold *:data-[slot=input-otp-slot]:bg-xon-surface-container-hover *:data-[slot=input-otp-slot]:border-0">
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                              </InputOTPGroup>
                              <InputOTPSeparator className="text-xon-text-secondary" />
                              <InputOTPGroup className="gap-3 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-lg *:data-[slot=input-otp-slot]:font-semibold *:data-[slot=input-otp-slot]:bg-xon-surface-container-hover *:data-[slot=input-otp-slot]:border-0">
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <FieldDescription className="text-center text-xs">
                            {t('verification_code_description')}
                          </FieldDescription>
                        </Field>
                        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={false}>
                          {t('verify_code_button')}
                        </Button>
                      </FieldGroup>
                    </form>
                  </div>
                  <FieldDescription className="text-center">
                    {t('didnt_receive_code')}{' '}
                    <button type="button" className="text-xon-primary font-semibold hover:underline transition-colors">
                      {t('resend_button')}
                    </button>
                  </FieldDescription>
                </>
              )}

              {/* Reset Password Step */}
              {step === 'reset' && (
                <>
                  <div className="flex flex-col space-y-3 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 rounded-full bg-xon-container-blue">
                        <Lock className="h-6 w-6 text-xon-primary" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {t('reset_password_title')}
                    </h2>
                    <p className="text-sm text-xon-text-secondary max-w-sm mx-auto">
                      {t('reset_password_description')}
                    </p>
                  </div>

                  <div className="bg-xon-surface-container border border-xon-surface-outline rounded-xl p-8 shadow-md backdrop-blur space-y-6">
                    {isResetLoading ? (
                      <div className="space-y-6" aria-busy="true" aria-live="polite">
                        <div className="space-y-2">
                          <Skeleton variant="text" className="h-4 w-40" />
                          <Skeleton className="h-11 w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton variant="text" className="h-4 w-48" />
                          <Skeleton className="h-11 w-full rounded-lg" />
                        </div>
                        <Skeleton variant="text" className="h-3 w-48" />
                        <Skeleton className="h-11 w-full rounded-md" />
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordReset} className="space-y-6">
                      {error && (
                        <div className="p-3 rounded-lg bg-xon-container-red border border-xon-red">
                          <p className="text-sm text-xon-text-red">{error}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-xon-text-primary" htmlFor="password">
                          {t('new_password_label')}
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('new_password_placeholder') || 'Enter new password'}
                            className="flex h-11 w-full rounded-lg bg-xon-surface-container-hover border border-xon-surface-outline px-4 py-2 pr-10 text-sm shadow-sm outline-none transition-all duration-200 text-xon-text-primary placeholder:text-xon-text-secondary placeholder:transition-colors hover:border-xon-primary/60 focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isResetLoading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xon-text-secondary hover:text-xon-text-primary transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-xon-text-primary" htmlFor="confirmPassword">
                          {t('confirm_password_label')}
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('confirm_password_placeholder') || 'Confirm new password'}
                            className="flex h-11 w-full rounded-lg bg-xon-surface-container-hover border border-xon-surface-outline px-4 py-2 pr-10 text-sm shadow-sm outline-none transition-all duration-200 text-xon-text-primary placeholder:text-xon-text-secondary placeholder:transition-colors hover:border-xon-primary/60 focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            disabled={isResetLoading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xon-text-secondary hover:text-xon-text-primary transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-xon-text-secondary">
                        {t('password_requirement')}
                      </p>

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold"
                        disabled={isResetLoading}
                      >
                        {showSuccess ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t('password_reset')}
                          </>
                        ) : (
                          t('reset_password_button')
                        )}
                      </Button>
                    </form>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

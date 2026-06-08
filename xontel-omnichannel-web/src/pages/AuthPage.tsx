import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import LoginForm from '@components/auth/LoginForm'
import SignupForm from '@components/auth/SignupForm'
import ForgotPassword from '@components/auth/ForgotPassword'
import { LanguageSwitcher } from '@components/ui/language-switcher'
import { ThemeToggle } from '@components/ui/theme-toggle'

type AuthMode = 'login' | 
// 'signup' |
 'forgot-password' | 'otp'

interface AuthPageProps {
  onSuccess: (token: string) => void
}

const getModeFromPath = (pathname: string): AuthMode => {
  // if (pathname.includes('/signup')) return 'signup'
  if (pathname.includes('/forgot-password')) return 'forgot-password'
  if (pathname.includes('/otp')) return 'otp'
  return 'login'
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>(() => getModeFromPath(location.pathname))
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Update mode when route changes
  useEffect(() => {
    setMode(getModeFromPath(location.pathname))
  }, [location.pathname])

  return (
    <>
      <div className={`fixed top-5 ${isRTL ? 'left-5' : 'right-5'} z-50 flex items-center gap-2`}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      {mode === 'login' ? (
        <LoginForm 
          onSuccess={onSuccess}
          // onSwitchToSignup={() => setMode('signup')}
          onSwitchToForgotPassword={() => setMode('forgot-password')}
        />
      // ) : mode === 'signup' ? (
      //   <SignupForm 
      //     onSuccess={onSuccess}
      //     onSwitchToLogin={() => setMode('login')}
      //   />
      ) : mode === 'forgot-password' || mode === 'otp' ? (
        <ForgotPassword 
          onBackToLogin={() => setMode('login')}
        />
      ) : null}
    </>
  )
}

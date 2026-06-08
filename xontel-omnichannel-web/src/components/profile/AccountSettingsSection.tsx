import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/api/auth/hooks'
import {
  Bell,
  ChevronRight,
  FileText,
  KeyRound,
  LogOut,
  Pencil,
  Shield,
} from 'lucide-react'

export default function AccountSettingsSection() {
  const { t } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()

  const handleEditProfile = () => {
    navigate('/profile/edit')
  }

  return (
    <section>
      <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
        {t('profile.account_settings', { defaultValue: 'Account Settings' })}
      </h3>
      <div className="bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
        <button
          type="button"
          onClick={handleEditProfile}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gradient-to-r hover:from-xon-container-blue/5 hover:to-transparent transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-xon-container-blue flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <Pencil className="h-5 w-5 text-xon-text-blue" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-xon-text-primary truncate group-hover:text-xon-primary transition-colors">
                {t('profile.edit_profile', { defaultValue: 'Edit Profile' })}
              </p>
              <p className="text-xs text-xon-text-secondary truncate">
                {t('profile.edit_profile_description', {
                  defaultValue: 'Update your personal information.',
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-xon-text-secondary flex-shrink-0 group-hover:translate-x-1 group-hover:text-xon-container-blue transition-all" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile/notifications')}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-transparent transition-all duration-200 border-t border-xon-surface-outline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-xon-text-primary truncate group-hover:text-orange-600 transition-colors">
                {t('profile.notifications', { defaultValue: 'Notifications' })}
              </p>
              <p className="text-xs text-xon-text-secondary truncate">
                {t('profile.notifications_description', {
                  defaultValue: 'Alerts, sounds and push prefs',
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-xon-text-secondary flex-shrink-0 group-hover:translate-x-1 group-hover:text-orange-600 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile/reset-password')}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent transition-all duration-200 border-t border-xon-surface-outline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-xon-text-primary truncate group-hover:text-blue-600 transition-colors">
                {t('profile.reset_password', { defaultValue: 'Reset Password' })}
              </p>
              <p className="text-xs text-xon-text-secondary truncate">
                {t('profile.reset_password_description', {
                  defaultValue: 'Change your password securely.',
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-xon-text-secondary flex-shrink-0 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile/security')}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-transparent transition-all duration-200 border-t border-xon-surface-outline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-xon-text-primary truncate group-hover:text-purple-600 transition-colors">
                {t('profile.security', { defaultValue: 'Security' })}
              </p>
              <p className="text-xs text-xon-text-secondary truncate">
                {t('profile.security_description', {
                  defaultValue: 'Password and 2FA settings',
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-xon-text-secondary flex-shrink-0 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/privacy-policy')}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gradient-to-r hover:from-teal-500/5 hover:to-transparent transition-all duration-200 border-t border-xon-surface-outline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-xon-text-primary truncate group-hover:text-teal-600 transition-colors">
                {t('profile.privacy_policy', { defaultValue: 'Privacy Policy' })}
              </p>
              <p className="text-xs text-xon-text-secondary truncate">
                {t('profile.privacy_policy_description', {
                  defaultValue: 'How we handle your data',
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-xon-text-secondary flex-shrink-0 group-hover:translate-x-1 group-hover:text-teal-600 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gradient-to-r hover:from-xon-container-red/10 hover:to-transparent transition-all duration-200 border-t border-xon-surface-outline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-xon-container-red flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <LogOut className="h-5 w-5 text-xon-text-red" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-xon-text-red truncate group-hover:text-red-500 transition-colors">
                {t('profile.logout')}
              </p>
              <p className="text-xs text-xon-text-secondary truncate">
                {t('profile.logout_description', {
                  defaultValue: 'Sign out of your session.',
                })}
              </p>
            </div>
          </div>
        </button>
      </div>
    </section>
  )
}

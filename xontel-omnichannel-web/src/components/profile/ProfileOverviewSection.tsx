import { useTranslation } from 'react-i18next'
import ProfileAvatarSection from './ProfileAvatarSection'
import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UserData {
  id: number
  name: string
  email: string
  avatar_url: string
  phone: string
  bio: string
}

interface ProfileOverviewSectionProps {
  userData: UserData
  isUploading: boolean
  onAvatarUpdate: (url: string) => void
}

export default function ProfileOverviewSection({ userData, isUploading, onAvatarUpdate }: ProfileOverviewSectionProps) {
  const { t } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()

  return (
    <section className="relative bg-xon-surface-container rounded-3xl p-8 shadow-lg border border-xon-surface-outline/50 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
      <button
        type="button"
        onClick={() => navigate('/profile/edit')}
        className="absolute top-4 right-4 rounded-2xl p-1 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 border-2 border-white/30 hover:border-white/50 bg-xon-surface-container"
      >
        <Pencil className="h-4 w-4 text-xon-text-blue" />
      </button>

      <ProfileAvatarSection userData={userData} isUploading={isUploading} onAvatarUpdate={onAvatarUpdate} />

      <div className="mt-6 space-y-2 w-full">
        <h2 className="text-3xl font-bold text-xon-text-primary">{userData.name}</h2>
        <p className="text-sm text-xon-text-secondary">{userData.email}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 hover:border-emerald-500/50 transition-colors cursor-default">
          <span className="inline-block mr-2">●</span>{t('profile.status', { defaultValue: 'Online' })}
        </span>
        <span className="px-4 py-2 bg-xon-surface-hover text-xon-text-secondary text-xs font-semibold rounded-full border border-xon-surface-outline hover:border-xon-surface-outline transition-colors cursor-default">
          <span className="inline-block mr-2">👤</span>{t('profile.role', { defaultValue: 'Agent' })}
        </span>
      </div>
    </section>
  )
}

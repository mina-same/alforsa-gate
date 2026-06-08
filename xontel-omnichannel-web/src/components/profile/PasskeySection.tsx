import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Fingerprint, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useListPasskeys, useRegisterPasskey, useDeletePasskey } from '@/api/auth/hooks'
import { isPasskeySupported } from '@/utils/passkey'

export default function PasskeySection() {
  const { t } = useTranslation(['chat', 'common'])
  const [isAdding, setIsAdding] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: passkeys, isLoading } = useListPasskeys()
  const { mutate: registerPasskey, isPending: isRegistering } = useRegisterPasskey()
  const { mutate: deletePasskey } = useDeletePasskey()

  if (!isPasskeySupported()) return null

  const handleAdd = () => {
    setError(null)
    registerPasskey(displayName.trim() || undefined, {
      onSuccess: () => {
        setIsAdding(false)
        setDisplayName('')
      },
      onError: (err: any) => {
        console.error('[Passkey register error]', err)
        const name: string = err?.name ?? ''
        if (name === 'NotAllowedError') {
          // user cancelled — stay quiet
          setError(null)
          setIsAdding(false)
        } else if (name === 'InvalidStateError') {
          setError('A passkey for this account already exists on this device.')
        } else if (name === 'NotSupportedError') {
          setError('Your browser or device does not support passkeys.')
        } else {
          setError(
            err?.response?.data?.detail ||
            (err?.message && err.message !== '[object Object]' ? err.message : null) ||
            t('profile.passkey_register_error', { defaultValue: 'Failed to register passkey' })
          )
        }
      },
    })
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    deletePasskey(id, { onSettled: () => setDeletingId(null) })
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return iso
    }
  }

  return (
    <section>
      <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
        {t('profile.passkeys', { defaultValue: 'Passkeys' })}
      </h3>

      <div className="bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-xon-surface-outline">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 shadow-md">
              <Fingerprint className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-xon-text-primary">
                {t('profile.passkeys_title', { defaultValue: 'Passkeys' })}
              </p>
              <p className="text-xs text-xon-text-secondary">
                {t('profile.passkeys_description', { defaultValue: 'Sign in with Face ID, fingerprint, or PIN' })}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 flex-shrink-0"
            disabled={isRegistering}
            onClick={() => { setIsAdding(true); setError(null) }}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('profile.passkey_add', { defaultValue: 'Add' })}
          </Button>
        </div>

        {/* Add form */}
        {isAdding && (
          <div className="p-4 border-b border-xon-surface-outline bg-xon-surface-container-hover space-y-3">
            <p className="text-xs text-xon-text-secondary">
              {t('profile.passkey_name_prompt', { defaultValue: 'Give this passkey a name to identify it later (optional).' })}
            </p>
            <input
              type="text"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('profile.passkey_name_placeholder', { defaultValue: 'e.g. Work laptop, iPhone' })}
              className="flex h-9 w-full rounded-lg border border-xon-surface-outline bg-xon-surface px-3 py-1 text-sm text-xon-text-primary placeholder:text-xon-text-secondary outline-none focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              disabled={isRegistering}
            />
            {error && (
              <div className="flex items-center gap-2 text-xs text-xon-text-red">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={isRegistering} className="gap-1.5">
                {isRegistering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isRegistering
                  ? t('profile.passkey_registering', { defaultValue: 'Waiting for device...' })
                  : t('profile.passkey_confirm', { defaultValue: 'Register passkey' })}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setIsAdding(false); setDisplayName(''); setError(null) }}
                disabled={isRegistering}
              >
                {t('common:cancel', { defaultValue: 'Cancel' })}
              </Button>
            </div>
          </div>
        )}

        {/* Passkey list */}
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-xon-text-secondary" />
          </div>
        ) : passkeys && passkeys.length > 0 ? (
          <ul>
            {passkeys.map((pk, i) => (
              <li
                key={pk.id}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? 'border-t border-xon-surface-outline' : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-xon-text-primary truncate">
                    {pk.display_name || 'Passkey'}
                  </p>
                  <p className="text-xs text-xon-text-secondary">
                    {t('profile.passkey_created', { defaultValue: 'Added' })} {formatDate(pk.created_at)}
                    {pk.last_used_at && (
                      <> · {t('profile.passkey_last_used', { defaultValue: 'Last used' })} {formatDate(pk.last_used_at)}</>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === pk.id}
                  onClick={() => handleDelete(pk.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-xon-text-secondary hover:text-xon-text-red hover:bg-xon-container-red transition-colors disabled:opacity-50"
                  aria-label="Delete passkey"
                >
                  {deletingId === pk.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !isAdding && (
            <div className="p-6 text-center text-sm text-xon-text-secondary">
              {t('profile.passkeys_empty', { defaultValue: 'No passkeys registered yet.' })}
            </div>
          )
        )}
      </div>
    </section>
  )
}

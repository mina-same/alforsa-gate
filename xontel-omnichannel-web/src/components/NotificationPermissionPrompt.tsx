import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from './ui/button'
import { useSystemNotifications } from '../hooks/useSystemNotifications'
import { useTranslation } from 'react-i18next'

export function NotificationPermissionPrompt() {
    const { t } = useTranslation('chat')
    const { permission, requestPermission, isSupported } = useSystemNotifications()
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if user has already been asked or dismissed the prompt
        const hasBeenRequested = localStorage.getItem('notification-permission-requested')
        const hasBeenDismissed = localStorage.getItem('notification-prompt-dismissed')

        // Show prompt if:
        // 1. Notifications are supported
        // 2. Permission is default (not granted or denied)
        // 3. User hasn't been asked before
        // 4. User hasn't dismissed the prompt
        if (
            isSupported &&
            permission === 'default' &&
            !hasBeenRequested &&
            !hasBeenDismissed
        ) {
            // Show prompt after a short delay to not overwhelm the user
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isSupported, permission])

    const handleAllow = async () => {
        const result = await requestPermission()
        if (result === 'granted') {
            setIsVisible(false)
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        localStorage.setItem('notification-prompt-dismissed', 'true')
    }

    if (!isVisible || isDismissed) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">Enable Notifications</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Stay updated with new messages and important updates
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleAllow}
                        size="sm"
                        className="flex-1"
                    >
                        Allow
                    </Button>
                    <Button
                        onClick={handleDismiss}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        Not Now
                    </Button>
                </div>
            </div>
        </div>
    )
}

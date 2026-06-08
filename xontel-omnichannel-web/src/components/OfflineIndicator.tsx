import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react'

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showOfflineMessage, setShowOfflineMessage] = useState(false)
    const [showBackOnlineMessage, setShowBackOnlineMessage] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setShowOfflineMessage(false)
            setShowBackOnlineMessage(true)

            // Hide "back online" message after 4 seconds
            setTimeout(() => {
                setShowBackOnlineMessage(false)
            }, 4000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setShowOfflineMessage(true)
            setShowBackOnlineMessage(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Check initial state
        if (!navigator.onLine) {
            setShowOfflineMessage(true)
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!showOfflineMessage && !showBackOnlineMessage) {
        return null
    }

    return (
        <>
            {/* Offline Banner */}
            {showOfflineMessage && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-3 shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                        <WifiOff className="h-4 w-4" />
                        <span>You're offline. Some features may be limited.</span>
                    </div>
                </div>
            )}

            {/* Back Online Toast - Enhanced Design */}
            {showBackOnlineMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="relative overflow-hidden rounded-xl shadow-2xl backdrop-blur-sm border border-green-500/20">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-90"></div>

                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                        {/* Content */}
                        <div className="relative px-5 py-4 flex items-center gap-3">
                            {/* Icon with pulse animation */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                                <div className="relative bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                    <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-sm">Back Online!</span>
                                <span className="text-white/90 text-xs">Connection restored</span>
                            </div>

                            {/* Wifi icon */}
                            <Wifi className="h-4 w-4 text-white/80 ml-2" />
                        </div>
                    </div>
                </div>
            )}

            {/* Add shimmer animation to global styles */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </>
    )
}

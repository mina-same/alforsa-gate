type NotificationPayload = {
    title: string
    body?: string
    icon?: string
    badge?: string
    tag?: string
    data?: any
    requireInteraction?: boolean
    actions?: any[]
    silent?: boolean
    force?: boolean
    sound?: any
    vibrate?: number[]
}

class NotificationService {
    private static instance: NotificationService
    private isAppFocused: boolean = true
    private audioUnlocked: boolean = false

    private getLanguagePrefixFromPath(pathname: string): string {
        const parts = pathname.split('/').filter(Boolean)
        const fromPath = parts.find((p) => p === 'en' || p === 'ar')
        if (fromPath) return fromPath

        const stored = localStorage.getItem('i18nextLng')
        if (stored === 'en' || stored === 'ar') return stored

        return 'en'
    }

    private constructor() {
        this.init()
    }

    public async unlockAudio() {
        if (this.audioUnlocked) return;
        try {
            const audio = new Audio('/web/sounds/notification.wav');
            audio.volume = 0; 
            await audio.play();
            this.audioUnlocked = true;
            console.log("🔊 Audio unlocked successfully");
            // Clean up listeners
            document.removeEventListener('click', this.unlockAudio);
            document.removeEventListener('keydown', this.unlockAudio);
            document.removeEventListener('touchstart', this.unlockAudio);
        } catch (error) {
            // Still locked, will try again on next interaction
        }
    }

    private async playNotificationSound() {
        try {
            const audio = new Audio('/web/sounds/notification.wav');
            await audio.play();
            console.log("Notification audio played successfully")
            this.audioUnlocked = true;
        } catch (error: any) {
            if (error.name === 'NotAllowedError') {
                console.debug('Autoplay prevented: User hasn\'t interacted with the page yet.');
            } else {
                console.warn('Failed to play notification sound:', error);
            }
        }
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    private init() {
        // Track app focus state
        document.addEventListener("visibilitychange", () => {
            this.isAppFocused = !document.hidden
        })

        // Global listeners to unlock audio on first interaction
        const unlock = () => this.unlockAudio();
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });

        // Listen for notification clicks from service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data && event.data.type === "NOTIFICATION_CLICK") {
                    this.handleNotificationClick(event.data.notification)
                }
            })
        }

        // Listen for notification click events
        window.addEventListener("notification-click", (event: any) => {
            const { type, conversationId, inbox_id } = event.detail
            if ((type === "message" || type === "mention") && conversationId && inbox_id) {
                this.navigateToConversation(inbox_id, conversationId, type)
            }
        })
    }

    public async sendNotification(payload: NotificationPayload): Promise<void> {
        // Debug logs
        console.log("Attempting to send notification:", {
            title: payload.title,
            isAppFocused: this.isAppFocused,
            force: payload.force,
            silent: payload.silent
        });

        // Don"t show notifications if app is focused and not silent (unless forced)
        if (this.isAppFocused && !payload.silent && !payload.force) {
            console.log("Notification skipped: App is already focused");
            return
        }

        // Check if notifications are supported
        if (!("Notification" in window)) {
            console.warn("Notifications are not supported in this browser")
            return
        }

        // Check permission
        if (Notification.permission !== "granted") {
            console.warn("Notification permission state:", Notification.permission)
            return
        }

        const options: NotificationOptions = {
            body: payload.body,
            icon: payload.icon || "/web/icons/icon-telsip.svg",
            badge: payload.badge || "/web/icons/icon-telsip.svg",
            tag: payload.tag,
            data: payload.data,
            actions: payload.actions,
            vibrate: payload.vibrate,
            sound: payload.sound,
            silent: payload.silent,
            requireInteraction: payload.requireInteraction || false,
        } as any; // Cast to any to allow actions property

        try {
            // Use service worker for notifications - REQUIRED for mobile Safari/PWA
            if ("serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(payload.title, options);
                console.log("Notification sent via service worker");
            } else if ("Notification" in window) {
                // Fallback for browsers without service worker support
                new Notification(payload.title, options);
                console.log("Notification sent via fallback");
            } else {
                console.warn("Notifications not supported in this environment");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    }

    // public async sendMessageNotification(
    //     senderName: string,
    //     message: string,
    //     conversationId?: string | number,
    //     inbox_id?: number
    // ): Promise<void> {
    //     const token = localStorage.getItem("authToken")
    //     const qs = new URLSearchParams()
    //     if (inbox_id != null) qs.set('inbox_id', String(inbox_id))
    //     if (conversationId != null) qs.set('conversation', String(conversationId))
    //     const url = qs.toString() ? `/web/?${qs.toString()}` : '/web/'

    //     await this.sendNotification({
    //         title: senderName,
    //         body: message,
    //         tag: `message-${conversationId || "unknown"}`,
    //         data: {
    //             type: "message",
    //             conversationId: conversationId != null ? String(conversationId) : undefined,
    //             conversation_id: conversationId != null ? String(conversationId) : undefined,
    //             token, // Include token for reply functionality
    //             inbox_id,
    //             inboxId: inbox_id,
    //             url,
    //         },
    //         requireInteraction: true, // Keep notification visible for reply
    //         silent: false,
    //     })
    // }



    //     public async sendMessageNotification(title: string, body: string, conversationId: any, inboxId: any) {
    //     const payload = {
    //         title,
    //         body,
    //         data: {
    //             type: 'message',
    //             conversationId,
    //             inbox_id: inboxId,
    //             url: `/web/?inbox_id=${inboxId}&conversation=${conversationId}`
    //         },
    //         tag: `msg-${conversationId}`
    //     };

    //     // FIX: On mobile, we MUST check registration status every time
    //     if ('serviceWorker' in navigator) {
    //         const registration = await navigator.serviceWorker.getRegistration('/web/');
    //         if (registration) {
    //             registration.showNotification(payload.title, {
    //                 body: payload.body,
    //                 data: payload.data,
    //                 tag: payload.tag,
    //                 icon: '/web/icons/icon-192.png'
    //             });
    //             return;
    //         }
    //     }

    //     // Fallback for desktop
    //     this.sendNotification(payload);
    // }


    public async sendMentionNotification(title: string, body: string, conversationId: any, inboxId: any) {
        // Play notification sound
        this.playNotificationSound();

        const payload = {
            title: 'Telsip',
            body: title + ': ' + body,
            data: {
                type: 'mention',
                conversationId: String(conversationId),
                inbox_id: inboxId,
                url: `/web/?inbox_id=${inboxId}&conversation=${conversationId}&open_notes=true`
            },
            tag: `mention-${conversationId}`,
        };

        if (Notification.permission !== "granted") {
            console.warn("Notification permission not granted, skipping mention notification");
            return;
        }

        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const options: NotificationOptions & { vibrate?: number[]; sound?: string } = {
                    body: payload.body,
                    data: payload.data,
                    tag: payload.tag,
                    icon: '/web/icons/icon-telsip.svg',
                    badge: '/web/icons/icon-telsip.svg',
                    requireInteraction: true,
                    vibrate: [200, 100, 200],
                    silent: false,
                    sound: '/web/sounds/notification-sound.mp3'
                };
                registration.showNotification(payload.title, options);
                return;
            }
        }

        this.sendNotification(payload);
    }

    public async sendMessageNotification(title: string, body: string, conversationId: any, inboxId: any) {
        const token = localStorage.getItem("authToken");

        // Play notification sound
        this.playNotificationSound();

        // We define the reply action strictly
        const replyAction = {
            action: 'reply',
            title: 'Reply',
            type: 'text', // Essential for mobile text input
            placeholder: 'Type your message...'
        };

        const payload = {
            title: 'Telsip',
            body: title + ': ' + body,
            data: {
                type: 'message',
                conversationId: String(conversationId),
                inbox_id: inboxId,
                token,
                url: `/web/?inbox_id=${inboxId}&conversation=${conversationId}`
            },
            tag: `msg-${conversationId}`,
            // Mobile browsers prefer the reply action to be the first item
            actions: [replyAction]
        };

        if (Notification.permission !== "granted") {
            console.warn("Notification permission not granted, skipping message notification");
            return;
        }

        if ('serviceWorker' in navigator) {
            // Remove specific scope to be more robust on Android/different deployments
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                // Note: iOS/Android requires the 'actions' inside the options object
                const options: NotificationOptions & { vibrate?: number[]; sound?: string } = {
                    body: payload.body,
                    data: payload.data,
                    tag: payload.tag,
                    icon: '/web/icons/icon-telsip.svg',
                    badge: '/web/icons/icon-telsip.svg',
                    requireInteraction: true,
                    actions: payload.actions,
                    vibrate: [200, 100, 200],
                    silent: false,
                    sound: '/web/sounds/notification-sound.mp3'
                } as any; // Cast to any to allow actions property
                registration.showNotification(payload.title, options);
                return;
            }
        }

        this.sendNotification(payload);
    }

    private navigateToConversation(inbox_id: number, conversationId: string | number, type?: string): void {
        // Update URL without page reload (same as ConversationItem)
        const notesParam = type === 'mention' ? '&open_notes=true' : '';
        const newUrl = `/web/?inbox_id=${inbox_id}&conversation=${conversationId}${notesParam}`
        window.history.pushState({}, '', newUrl)

        // For mobile, we need to ensure the conversation is set after URL update
        // Dispatch custom event to notify React components to set the conversation
        window.dispatchEvent(new CustomEvent('navigate-to-conversation', {
            detail: {
                conversationId: String(conversationId),
                inbox_id,
                type
            }
        }))

        // Also trigger popstate to ensure URL listeners fire
        window.dispatchEvent(new PopStateEvent('popstate'))
    }

    public async sendWelcomeNotification(): Promise<void> {
        this.playNotificationSound();
        await this.sendNotification({
            title: 'Welcome to Telsip Chat! 🎉',
            body: 'You\'ll now receive notifications for new messages',
            tag: 'welcome-notification',
            requireInteraction: false,
        })
    }

    public async sendIncomingCallNotification(
        callerName: string,
        callId: string,
        contactId?: number,
        from?: string
    ): Promise<void> {
        const payload = {
            title: `Telsip - Incoming Call: ${callerName}`,
            body: 'Tap to answer or reject',
            tag: `call-${callId}`,
            icon: '/web/icons/icon-telsip.svg',
            badge: '/web/icons/icon-telsip.svg',
            requireInteraction: true,
            silent: false,
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
            data: {
                type: 'incoming-call',
                callId,
                contactId,
                from,
                url: window.location.pathname + window.location.search
            },
            actions: [
                {
                    action: 'accept-call',
                    title: '✅ Accept',
                },
                {
                    action: 'reject-call',
                    title: '❌ Reject',
                }
            ]
        };

        if (Notification.permission !== "granted") {
            console.warn("Notification permission not granted, skipping call notification");
            return;
        }

        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const options: NotificationOptions & { vibrate?: number[]; sound?: string; renovate?: boolean } = {
                    body: payload.body,
                    data: payload.data,
                    tag: payload.tag,
                    icon: payload.icon,
                    badge: payload.badge,
                    requireInteraction: true,
                    actions: payload.actions,
                    vibrate: payload.vibrate,
                    silent: false,
                    renovate: true,
                    sound: '/web/sounds/ringing.mp3'
                } as any;
                registration.showNotification(payload.title, options);
                return;
            }
        }

        this.sendNotification(payload);
    }

    private handleNotificationClick(notification: any) {
        // Handle notification click based on type
        const type = notification.data?.type;
        const conversationId = notification.data?.conversationId;
        const inbox_id = notification.data?.inbox_id;

        if ((type === 'message' || type === 'mention') && conversationId && inbox_id) {
            // Navigate to conversation
            window.focus()
            // You can dispatch a custom event or use your router here
            window.dispatchEvent(
                new CustomEvent('notification-click', {
                    detail: {
                        type,
                        conversationId,
                        inbox_id,
                    },
                })
            )
        }
    }

    public async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            return 'denied'
        }

        try {
            const permission = await Notification.requestPermission()
            return permission
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return 'denied'
        }
    }

    public getPermission(): NotificationPermission {
        if (!('Notification' in window)) {
            return 'denied'
        }
        return Notification.permission
    }

    public async dismissNotification(tag: string): Promise<void> {
        try {
            if ("serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const notifications = await registration.getNotifications({ tag });
                notifications.forEach(notification => notification.close());
                console.log(`Dismissed notification with tag: ${tag}`);
            }
        } catch (error) {
            console.error("Error dismissing notification:", error);
        }
    }

    public async dismissCallNotification(callId: string): Promise<void> {
        await this.dismissNotification(`call-${callId}`);
    }

    public isSupported(): boolean {
        return 'Notification' in window
    }
}

export const notificationService = NotificationService.getInstance()

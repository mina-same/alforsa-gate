
self.addEventListener('push', (event) => {
  // Mobile requirement: must wrap in waitUntil
  event.waitUntil((async () => {
    if (!event.data) return;
    const data = event.data.json();

    // Check if any window is already open and focused
    const windowClients = await clients.matchAll({ type: 'window' });
    const isAnyFocused = windowClients.some(client => client.focused);

    // On mobile, we usually want to show the notification 
    // UNLESS the app is literally active in their hand.
    if (isAnyFocused) return;

    return self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/web/icons/icon-192.png',
      badge: '/web/icons/icon-telsip.svg',
      tag: data.tag || 'new-message',
      data: data.data,
      // requireInteraction: true is often ignored on mobile, 
      // but 'renovate' helps keep it visible
      renovate: true,
      renotify: true,
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          type: 'text' // Desktop only
        }
      ]
    });
  })());
});

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification
  const data = notification.data || {}
  const action = event.action

  notification.close()

  // Handle call actions
  if (action === 'accept-call' || action === 'reject-call') {
    event.waitUntil((async () => {
      const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      const preferred = windowClients.find(c => c.visibilityState === 'visible') || windowClients[0];

      if (preferred) {
        await preferred.focus();
        preferred.postMessage({
          type: action === 'accept-call' ? 'ACCEPT_CALL' : 'REJECT_CALL',
          data: data
        });
      } else if (clients.openWindow) {
        // Fallback: open window if none exist
        await clients.openWindow(data.url || '/web/');
      }
    })());
    return;
  }

  // Handle reply action
  if (action === 'reply' && event.reply) {
    event.waitUntil(handleReply(notification, event.reply))
    return
  }
  // Handle view action or general click
  const inboxId = data.inbox_id ?? data.inboxId
  const conversationId = data.conversationId ?? data.conversation_id

  const qs = new URLSearchParams()
  if (inboxId != null) qs.set('inbox_id', String(inboxId))
  if (conversationId != null) qs.set('conversation', String(conversationId))
  const targetUrl =
    typeof data.url === 'string' && data.url.length > 0
      ? data.url
      : qs.toString()
        ? `/web/?${qs.toString()}`
        : '/web/'

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true })
      const webClients = windowClients.filter((c) => typeof c.url === 'string' && c.url.includes('/web/'))
      const candidates = webClients.length > 0 ? webClients : windowClients

      const preferred =
        candidates.find((c) => c.focused) ||
        candidates.find((c) => c.visibilityState === 'visible') ||
        candidates[0]

      if (preferred) {
        if ('focus' in preferred) {
          await preferred.focus()
        }
        if ('navigate' in preferred && preferred.url !== targetUrl) {
          try {
            await preferred.navigate(targetUrl)
          } catch {
            // ignore
          }
        }

        try {
          preferred.postMessage({
            type: 'NOTIFICATION_CLICK',
            notification: { data },
          })
        } catch {
          // ignore
        }

        return
      }

      if (clients.openWindow) {
        await clients.openWindow(targetUrl)
      }
    })(),
  )
})

// Function to handle quick reply from notification
async function handleReply(notification, replyText) {
  const data = notification.data || {}
  const token = data.token
  const conversationId = data.conversationId || data.conversation_id || data.conversation_id
  const inboxId = data.inbox_id || data.inboxId

  if (!token || !conversationId) {
    console.error('Missing token or conversationId for reply')
    return
  }

  try {
    // Attempt to send the message via the messages API
    const response = await fetch('/api/v1/messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conversation_id: Number(conversationId),
        inbox_id: inboxId ? Number(inboxId) : undefined,
        content: replyText,
        message_type: 'text'
      })
    })

    if (response.ok) {
      // Show success notification
      await self.registration.showNotification('Reply Sent', {
        body: 'Your message has been sent successfully',
        icon: '/web/icons/icon-192.png',
        tag: 'reply-success',
        silent: true,
        data: data // Pass original data for redirection
      })
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('Failed to send reply:', errorData)
      throw new Error('Failed to send reply')
    }
  } catch (error) {
    console.error('Error sending reply:', error)
    // Show error notification
    await self.registration.showNotification('Reply Failed', {
      body: 'Failed to send your message. Please try again.',
      icon: '/web/icons/icon-192.png',
      tag: 'reply-error',
      data: data // Pass original data for redirection
    })
  }
}

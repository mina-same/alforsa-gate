import { useEffect, useState } from 'react'
import { notificationService } from '@/services/notificationService'

export function useSystemNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    const supported = notificationService.isSupported()
    setIsSupported(supported)
    
    if (supported) {
      setPermission(notificationService.getPermission())
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser')
      return 'denied'
    }

    setIsLoading(true)
    try {
      const result = await notificationService.requestPermission()
      setPermission(result)
      
      // Send welcome notification if permission granted
      if (result === 'granted') {
        await notificationService.sendWelcomeNotification()
      }
      
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setPermission('denied')
      return 'denied'
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      await notificationService.sendNotification({
        title: 'Test Notification',
        body: 'This is a test notification from Telsip Chat!',
        tag: 'test-notification',
        requireInteraction: false,
        force: true,
      })
    }
  }

  return {
    isSupported,
    permission,
    isLoading,
    requestPermission,
    sendTestNotification,
  }
}

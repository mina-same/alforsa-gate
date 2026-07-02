import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Contact } from '../api/contacts';
import { playNotificationSound } from '../utils/notificationSound';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api')
  .replace('/api', '');

export interface NewContactEvent {
  contact: Contact;
  timestamp: number;
}

export function useContactSocket(isAdmin: boolean) {
  const [unreadCount, setUnreadCount]       = useState(0);
  const [latestContact, setLatestContact]   = useState<Contact | null>(null);
  const [notification, setNotification]     = useState<NewContactEvent | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] connected:', socket.id);
    });

    socket.on('new_contact', (contact: Contact) => {
      setUnreadCount(prev => prev + 1);
      setLatestContact(contact);
      setNotification({ contact, timestamp: Date.now() });
      playNotificationSound();
    });

    socket.on('disconnect', () => {
      console.log('[Socket] disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAdmin]);

  const resetCount  = () => setUnreadCount(0);
  const clearNotif  = () => setNotification(null);

  return { unreadCount, latestContact, notification, resetCount, clearNotif };
}

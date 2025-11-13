"use client"
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

// Lightweight stub aligning with esports-rcd-frontend interface to satisfy imports in shared code builds.
export type Notification = {
  id: string
  type: 'info' | 'warning' | 'success' | 'action'
  message: string
  createdAt: string
  actionLabel?: string
  onAction?: () => void
}

type NotificationsContextValue = {
  notifications: Notification[]
  unreadCount: number
  dismiss: (id: string) => void
  refresh: () => Promise<void>
  clearAll: () => void
  addNotification: (notification: { message: string; type?: Notification['type']; id?: string; createdAt?: string | number; actionLabel?: string; onAction?: () => void }) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  const clearAll = useCallback(() => setNotifications([]), [])
  const addNotification: NotificationsContextValue['addNotification'] = useCallback((n) => {
    const id = n.id || uuid()
    const createdAt = n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString()
    setNotifications(prev => [{ id, type: n.type || 'info', message: n.message, createdAt, actionLabel: n.actionLabel, onAction: n.onAction }, ...prev.filter(x => x.id !== id)])
  }, [])
  const refresh = useCallback(async () => { /* no-op stub */ }, [])
  const unreadCount = notifications.length
  const value = useMemo(() => ({ notifications, unreadCount, dismiss, refresh, clearAll, addNotification }), [notifications, unreadCount, dismiss, refresh, clearAll, addNotification])
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (ctx) return ctx;
  // Fallback no-op context to avoid hard crashes if provider isn't mounted yet
  return {
    notifications: [],
    unreadCount: 0,
    dismiss: () => {},
    refresh: async () => {},
    clearAll: () => {},
    addNotification: () => {},
  };
}

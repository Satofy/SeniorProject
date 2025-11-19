"use client"
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api, API_URL, type NotificationResponse } from '@/lib/api'

export type Notification = {
  id: string
  type: 'info' | 'warning' | 'success' | 'action'
  message: string
  createdAt: string
  actionLabel?: string
  onAction?: () => void
  read?: boolean
}

type NotificationsContextValue = {
  notifications: Notification[]
  unreadCount: number
  dismiss: (id: string) => void
  refresh: () => Promise<void>
  clearAll: () => void
  addNotification: (notification: {
    message: string
    type?: Notification['type']
    id?: string
    createdAt?: string | number
    actionLabel?: string
    onAction?: () => void
  }) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

function loadDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem('rcd_dismissed_notifs')
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveDismissed(ids: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('rcd_dismissed_notifs', JSON.stringify(Array.from(ids)))
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [remoteNotifications, setRemoteNotifications] = useState<Notification[]>([])
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([])
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([])
  const dismissed = React.useRef<Set<string>>(loadDismissed())

  const mapRemoteNotification = useCallback((payload: NotificationResponse): Notification => {
    const metadata = payload.metadata ?? {}
    const teamId = typeof metadata === 'object' && metadata !== null ? (metadata as Record<string, any>).teamId : undefined
    return {
      id: payload.id,
      type: payload.type,
      message: payload.message,
      createdAt: payload.createdAt || new Date().toISOString(),
      actionLabel: teamId ? 'View team' : undefined,
      onAction: teamId
        ? () => {
            if (typeof window !== 'undefined') {
              window.location.href = `/teams/${teamId}`
            }
          }
        : undefined,
      read: payload.read,
    }
  }, [])

  const refreshRemote = useCallback(async () => {
    if (!user) {
      setRemoteNotifications([])
      return
    }
    try {
      const data = await api.getNotifications()
      setRemoteNotifications(data.map(mapRemoteNotification))
    } catch (err) {
      console.error('Failed to load notifications', err)
    }
  }, [mapRemoteNotification, user])

  const rebuildSystem = useCallback(() => {
    if (!user) {
      setSystemNotifications([])
      return
    }
    const list: Notification[] = []

    // Player: show confirmation after a recent join request (local only signal)
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('rcd_last_join_req') : null
      if (raw) {
        const parsed = JSON.parse(raw) as { teamId: string; ts: number }
        const fresh = Date.now() - parsed.ts < 1000 * 60 * 60 * 2 // 2 hours
        const id = `join-${parsed.teamId}`
        if (fresh && !dismissed.current.has(id)) {
          list.push({
            id,
            type: 'success',
            message: 'Your join request was sent successfully.',
            createdAt: new Date(parsed.ts).toISOString(),
            actionLabel: 'View team',
            onAction: () => {
              if (typeof window !== 'undefined') {
                window.location.href = `/teams/${parsed.teamId}`
              }
            },
          })
        }
        if (!fresh) {
          localStorage.removeItem('rcd_last_join_req')
        }
      }
    } catch {}

    // Generic announcement placeholder
    const announceId = 'announce-welcome-v1'
    if (!dismissed.current.has(announceId)) {
      list.push({ id: announceId, type: 'info', message: 'Welcome to RCD Esports – manage teams & tournaments seamlessly.', createdAt: new Date().toISOString() })
    }

    setSystemNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [user])

  const dismiss = useCallback((id: string) => {
    if (remoteNotifications.some((n) => n.id === id)) {
      setRemoteNotifications((prev) => prev.filter((n) => n.id !== id))
      api.deleteNotification(id).catch(() => {})
      return
    }
    dismissed.current.add(id)
    saveDismissed(dismissed.current)
    setSystemNotifications((prev) => prev.filter((n) => n.id !== id))
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [remoteNotifications])

  const clearAll = useCallback(() => {
    const all = [...systemNotifications, ...localNotifications]
    all.forEach((n) => dismissed.current.add(n.id))
    setSystemNotifications([])
    setLocalNotifications([])
    setRemoteNotifications([])
    saveDismissed(dismissed.current)
    api.clearNotifications().catch(() => {})
  }, [localNotifications, systemNotifications])

  const refresh = useCallback(async () => {
    if (!user) {
      setSystemNotifications([])
      setLocalNotifications([])
      setRemoteNotifications([])
      return
    }
    await refreshRemote()
    rebuildSystem()
  }, [rebuildSystem, refreshRemote, user])

  useEffect(() => {
    refresh()
    let timer: any = null
    timer = setInterval(() => {
      refresh()
    }, 5 * 60_000) // fallback refresh every 5 minutes
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => {
      refresh()
    }
    window.addEventListener('rcd-notifications-refresh', handler)
    return () => {
      window.removeEventListener('rcd-notifications-refresh', handler)
    }
  }, [refresh])

  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return
    if (!API_URL) return
    const token = localStorage.getItem('rcd_token')
    if (!token) return
    let stopped = false
    let source: EventSource | null = null
    let retryMs = 2000

    const connect = () => {
      if (stopped) return
      source = new EventSource(`${API_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`)
      source.addEventListener('notification', (event) => {
        try {
          const payload = JSON.parse(event.data) as NotificationResponse
          setRemoteNotifications((prev) => {
            const filtered = prev.filter((n) => n.id !== payload.id)
            return [mapRemoteNotification(payload), ...filtered]
          })
        } catch (err) {
          console.error('Failed to parse notification payload', err)
        }
      })
      source.onopen = () => {
        retryMs = 2000
      }
      source.onerror = () => {
        if (source) source.close()
        if (stopped) return
        setTimeout(connect, retryMs)
        retryMs = Math.min(retryMs * 2, 15000)
      }
    }

    connect()
    return () => {
      stopped = true
      if (source) source.close()
    }
  }, [mapRemoteNotification, user])

  const notifications = useMemo(() => {
    return [...remoteNotifications, ...systemNotifications, ...localNotifications]
      .filter((n) => !dismissed.current.has(n.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [localNotifications, remoteNotifications, systemNotifications])

  const unreadCount =
    remoteNotifications.filter((n) => !n.read).length +
    systemNotifications.length +
    localNotifications.length

  const addNotification: NotificationsContextValue['addNotification'] = useCallback((notification) => {
    const id = notification.id ?? generateId()
    const createdAt = notification.createdAt
      ? new Date(notification.createdAt).toISOString()
      : new Date().toISOString()

    dismissed.current.delete(id)
    setLocalNotifications((prev) => [
      {
        id,
        type: notification.type ?? 'info',
        message: notification.message,
        createdAt,
        actionLabel: notification.actionLabel,
        onAction: notification.onAction,
      },
      ...prev.filter((n) => n.id !== id),
    ])
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, dismiss, refresh, clearAll, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import styles from './NotificationsBell.module.css'

export default function NotificationsBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (data) setNotifications(data)
      }
    }
    loadNotifications()
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new
        setNotifications((prev) => [newNotif, ...prev].slice(0, 10)) // Keep last 10
        // Trigger WhatsApp style Toast
        toast(
          (t) => (
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
              <strong style={{fontSize: '16px', color: 'var(--primary-dark)'}}>{newNotif.title}</strong>
              <span style={{fontSize: '14px'}}>{newNotif.message}</span>
            </div>
          ),
          { duration: 5000, position: 'top-center' }
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  // Close dropdown when clicked outside
  useEffect(() => {
    const closeDropdown = () => setIsOpen(false)
    if (isOpen) document.addEventListener('click', closeDropdown)
    return () => document.removeEventListener('click', closeDropdown)
  }, [isOpen])

  if (!userId) return null

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <button className={styles.bellBtn} onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>الإشعارات</div>
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>لا توجد إشعارات</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <div className={styles.title}>{n.title}</div>
                  <div className={styles.message}>{n.message}</div>
                  <div className={styles.time}>{new Date(n.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

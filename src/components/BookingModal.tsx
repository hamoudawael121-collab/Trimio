'use client'

import { useState, useEffect } from 'react'
import { getAvailableSlots, createBooking } from '@/app/actions/customer'
import toast from 'react-hot-toast'
import styles from './BookingModal.module.css'

export default function BookingModal({ shopId, serviceId, serviceName, onClose }: { shopId: string, serviceId: string, serviceName: string, onClose: () => void }) {
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  // Ensure minimum date is today
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (date) {
      setLoadingSlots(true)
      setSelectedTime('')
      getAvailableSlots(shopId, serviceId, date)
        .then(res => {
          if (res.slots) setSlots(res.slots)
          setLoadingSlots(false)
        })
    }
  }, [date, shopId, serviceId])

  async function handleBook() {
    if (!date || !selectedTime) return
    setBookingLoading(true)
    const res = await createBooking(shopId, serviceId, date, selectedTime)
    setBookingLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('تم طلب الحجز بنجاح! في انتظار تأكيد المحل.')
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>حجز: {serviceName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>اختر يوم الحجز:</label>
            <input 
              type="date" 
              className={styles.input} 
              min={today}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {date && (
            <div className={styles.slotsSection}>
              <label className={styles.label}>الأوقات المتاحة:</label>
              {loadingSlots ? (
                <div className={styles.loading}>جاري البحث عن أوقات متاحة...</div>
              ) : slots.length > 0 ? (
                <div className={styles.slotsGrid}>
                  {slots.map(time => (
                    <button 
                      key={time} 
                      className={`${styles.slotBtn} ${selectedTime === time ? styles.selected : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.noSlots}>نعتذر، لا توجد أوقات متاحة في هذا اليوم. اختر يوماً آخر.</div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className="btn-secondary" onClick={onClose}>إلغاء</button>
          <button 
            className="btn-primary" 
            disabled={!selectedTime || bookingLoading}
            onClick={handleBook}
          >
            {bookingLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
          </button>
        </div>
      </div>
    </div>
  )
}

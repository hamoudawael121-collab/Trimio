'use client'

import { useState } from 'react'
import BookingModal from '@/components/BookingModal'
import styles from './page.module.css'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ServicesList({ shopId, services }: { shopId: string, services: any[] }) {
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleBookClick(service: any) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('يجب عليك تسجيل الدخول أولاً لتتمكن من الحجز.')
      router.push('/login')
      return
    }
    setSelectedService(service)
  }

  return (
    <>
      <div className={styles.servicesList}>
        {services.length === 0 ? (
          <div style={{textAlign: 'center', padding: '20px'}}>لا توجد خدمات مضافة حالياً.</div>
        ) : (
          services.map(service => (
            <div key={service.id} className={styles.serviceItem}>
              <div>
                <div className={styles.serviceName}>{service.name}</div>
                <div className={styles.serviceMeta}>المدة المقدرة: {service.duration_minutes} دقيقة</div>
              </div>
              <div className={styles.rightSide}>
                <div className={styles.servicePrice}>{service.price} ج.م</div>
                <button 
                  className="btn-primary" 
                  onClick={() => handleBookClick(service)}
                  style={{padding: '8px 20px'}}
                >
                  احجز الآن
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedService && (
        <BookingModal 
          shopId={shopId} 
          serviceId={selectedService.id} 
          serviceName={selectedService.name}
          onClose={() => setSelectedService(null)} 
        />
      )}
    </>
  )
}

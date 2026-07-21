import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyBookings() {
  const supabase = await createClient()

  // Get user profile
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    redirect('/login')
  }

  // Fetch Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, shops(name, address), services(name, price)')
    .eq('customer_id', authData.user.id)
    .order('booking_time', { ascending: false })

  return (
    <div className="container" style={{paddingTop: '40px', paddingBottom: '60px'}}>
      <h1 style={{marginBottom: '30px', color: 'var(--primary-dark)'}}>حجوزاتي</h1>

      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {bookings && bookings.length > 0 ? bookings.map((booking: any) => (
          <div key={booking.id} style={{
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            padding: '20px', 
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '4px'}}>
                {booking.shops?.name}
              </div>
              <div style={{color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px'}}>📍 {booking.shops?.address}</div>
              <div style={{fontSize: '16px'}}>الخدمة: {booking.services?.name} - {booking.services?.price} ج.م</div>
              
              <div style={{marginTop: '12px'}}>
                موعد الحجز: <strong dir="ltr">{new Date(booking.booking_time).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}</strong>
              </div>
            </div>
            
            <div style={{textAlign: 'center'}}>
              <span style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-block',
                background: booking.status === 'pending' ? '#FEF3C7' : 
                           booking.status === 'confirmed' ? '#E0E7FF' : 
                           booking.status === 'completed' ? '#D1FAE5' : '#FEE2E2',
                color: booking.status === 'pending' ? '#D97706' : 
                       booking.status === 'confirmed' ? '#4338CA' : 
                       booking.status === 'completed' ? '#059669' : '#B91C1C'
              }}>
                {booking.status === 'pending' ? '⏳ قيد الانتظار' : 
                 booking.status === 'confirmed' ? '✅ مؤكد' : 
                 booking.status === 'completed' ? '🎉 تم التنفيذ' : '❌ ملغي'}
              </span>
            </div>
          </div>
        )) : (
          <div style={{
            background: 'var(--surface)', 
            padding: '40px', 
            textAlign: 'center', 
            borderRadius: '12px',
            border: '1px dashed var(--border)'
          }}>
            <p style={{marginBottom: '20px', color: 'var(--text-muted)'}}>ليس لديك أي حجوزات حتى الآن.</p>
            <Link href="/" className="btn-primary">ابحث عن محل للحجز</Link>
          </div>
        )}
      </div>
    </div>
  )
}

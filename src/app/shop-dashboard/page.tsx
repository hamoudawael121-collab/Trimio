import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import { addService, deleteService, updateBookingStatus } from '@/app/actions/shop-owner'

export default async function ShopDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const tab = resolvedParams.tab || 'bookings'

  // Get user profile
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    redirect('/login')
  }

  // Get Shop Info
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', authData.user.id)
    .single()

  if (!shop) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>لوحة تحكم المحل</h1>
        <p className={styles.subtitle}>أنت لا تمتلك أي محل مسجل. يرجى <Link href="/join-shop" style={{color: 'var(--primary)'}}>إضافة محلك من هنا</Link>.</p>
      </div>
    )
  }

  // Fetch Services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  // Fetch Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, profiles(full_name, phone_number), services(name, price)')
    .eq('shop_id', shop.id)
    .order('booking_time', { ascending: true })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>لوحة تحكم: {shop.name}</h1>
        <p className={styles.subtitle}>أهلاً بك في منصة الإدارة الخاصة بمحلك</p>
      </div>

      <div className={styles.tabs}>
        <Link href="?tab=bookings" className={`${styles.tabBtn} ${tab === 'bookings' ? styles.active : ''}`}>
          📅 الحجوزات
        </Link>
        <Link href="?tab=services" className={`${styles.tabBtn} ${tab === 'services' ? styles.active : ''}`}>
          ✂️ الخدمات
        </Link>
        <Link href="?tab=info" className={`${styles.tabBtn} ${tab === 'info' ? styles.active : ''}`}>
          ℹ️ بيانات المحل
        </Link>
      </div>

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div>
          <h2 style={{marginBottom: '20px'}}>الحجوزات القادمة والسابقة</h2>
          <div className={styles.list}>
            {bookings && bookings.length > 0 ? bookings.map((booking: any) => (
              <div key={booking.id} className={styles.listItem}>
                <div>
                  <div className={styles.itemTitle}>{booking.profiles?.full_name}</div>
                  <div className={styles.itemDesc}>الخدمة: {booking.services?.name} | السعر: {booking.services?.price} ج.م</div>
                  <div className={styles.itemDesc} dir="ltr" style={{textAlign: 'right'}}>{booking.profiles?.phone_number}</div>
                  <div className={styles.itemDesc} style={{marginTop: '8px'}}>
                    الوقت: <strong dir="ltr">{new Date(booking.booking_time).toLocaleString('ar-EG')}</strong>
                  </div>
                  <div style={{marginTop: '10px'}}>
                    <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                      {booking.status === 'pending' ? 'قيد الانتظار' : 
                       booking.status === 'confirmed' ? 'مؤكد' : 
                       booking.status === 'completed' ? 'تم التنفيذ' : 'ملغي'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.bookingActions}>
                  {booking.status === 'pending' && (
                    <>
                      <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'confirmed'); }}>
                        <button type="submit" className="btn-primary" style={{padding: '8px 16px', fontSize: '14px'}}>تأكيد</button>
                      </form>
                      <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'cancelled'); }}>
                        <button type="submit" className="btn-secondary" style={{padding: '8px 16px', fontSize: '14px', borderColor: 'var(--danger)', color: 'var(--danger)'}}>إلغاء</button>
                      </form>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'completed'); }}>
                      <button type="submit" className="btn-primary" style={{padding: '8px 16px', fontSize: '14px', background: 'var(--success)'}}>تم التنفيذ (حضر)</button>
                    </form>
                  )}
                </div>
              </div>
            )) : (
              <div className="card">لا توجد حجوزات حالياً.</div>
            )}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <div>
          <div className="card" style={{marginBottom: '30px'}}>
            <h2 style={{marginBottom: '20px'}}>إضافة خدمة جديدة</h2>
            <form action={async (formData) => {
              'use server';
              await addService(formData);
            }} className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>اسم الخدمة</label>
                <input type="text" name="name" className={styles.input} placeholder="مثال: حلاقة شعر" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>السعر (ج.م)</label>
                <input type="number" name="price" className={styles.input} placeholder="100" required min="1" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>المدة الزمنية (بالدقائق)</label>
                <input type="number" name="duration" className={styles.input} placeholder="30" required min="5" step="5" />
              </div>
              <div className={styles.formGroup} style={{justifyContent: 'flex-end'}}>
                <button type="submit" className="btn-primary">إضافة الخدمة</button>
              </div>
            </form>
          </div>

          <h2 style={{marginBottom: '20px'}}>الخدمات الحالية</h2>
          <div className={styles.list}>
            {services && services.length > 0 ? services.map((service: any) => (
              <div key={service.id} className={styles.listItem}>
                <div>
                  <div className={styles.itemTitle}>{service.name}</div>
                  <div className={styles.itemDesc}>المدة: {service.duration_minutes} دقيقة</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div className={styles.itemPrice}>{service.price} ج.م</div>
                  <form action={async () => { 'use server'; await deleteService(service.id); }}>
                    <button type="submit" style={{color: 'var(--danger)', fontSize: '20px'}} title="حذف">🗑️</button>
                  </form>
                </div>
              </div>
            )) : (
              <div className="card">لم تقم بإضافة أي خدمات بعد.</div>
            )}
          </div>
        </div>
      )}

      {/* Info Tab */}
      {tab === 'info' && (
        <div className="card">
          <h2 style={{marginBottom: '20px'}}>بيانات المحل</h2>
          <div className={styles.list}>
            <div className={styles.formGroup}>
              <label className={styles.label}>اسم المحل</label>
              <div className={styles.input} style={{background: 'var(--bg-color)'}}>{shop.name}</div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>النوع</label>
              <div className={styles.input} style={{background: 'var(--bg-color)'}}>
                {shop.shop_type === 'barbershop' ? 'صالون حلاقة رجالي' : 'كوافير حريمي'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>العنوان</label>
              <div className={styles.input} style={{background: 'var(--bg-color)'}}>{shop.address}</div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>حالة المحل على المنصة</label>
              <div className={styles.input} style={{background: 'var(--bg-color)'}}>
                {shop.status === 'pending' ? '⏳ قيد المراجعة (لا يظهر للعملاء بعد)' : 
                 shop.status === 'approved' ? '✅ معتمد (يظهر للعملاء)' : '❌ موقوف'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

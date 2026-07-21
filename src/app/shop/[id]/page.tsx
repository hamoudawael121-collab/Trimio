import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ServicesList from './ServicesList'
import styles from './page.module.css'

export default async function ShopProfile({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Get Shop Info
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('id', id)
    .single()

  if (!shop) {
    notFound()
  }

  // Get Shop Services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('shop_id', id)
    .order('price', { ascending: true })

  // Get Shop Images (if any)
  const { data: images } = await supabase
    .from('shop_images')
    .select('image_url')
    .eq('shop_id', id)
    .eq('is_primary', true)
    .limit(1)
  
  const coverImage = images && images.length > 0 ? images[0].image_url : '/placeholder.jpg'

  return (
    <div className={styles.container}>
      <div className={styles.cover} style={{ backgroundImage: `url(${coverImage})` }}>
        <div className={styles.coverOverlay}>
          <h1 className={styles.shopName}>{shop.name}</h1>
          <p className={styles.shopType}>
            {shop.shop_type === 'barbershop' ? '✂️ صالون حلاقة رجالي' : '💅 كوافير حريمي'}
          </p>
        </div>
      </div>

      <div className={styles.detailsCard}>
        <h2>عن المحل</h2>
        <p className={styles.address}>📍 {shop.address}</p>
        {shop.description && <p className={styles.description}>{shop.description}</p>}
      </div>

      <div className={styles.servicesSection}>
        <h2 style={{marginBottom: '20px', color: 'var(--primary-dark)'}}>الخدمات المتاحة</h2>
        <ServicesList shopId={shop.id} services={services || []} />
      </div>
    </div>
  )
}

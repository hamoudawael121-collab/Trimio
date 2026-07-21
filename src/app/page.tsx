import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient()

  // Fetch real approved shops from database
  const { data: shops } = await supabase
    .from('shops')
    .select('*, shop_images(image_url, is_primary)')
    .eq('status', 'approved')
    .limit(6)

  return (
    <div className={styles.homeWrapper}>
      
      {/* Search / Where to get a haircut section */}
      <section className={`container ${styles.hero}`}>
        <h1>أين تريد أن تحلق؟</h1>
        <div className={styles.searchBox}>
          <select className={styles.selectInput}>
            <option value="">اختر المنطقة...</option>
            <option value="cairo">القاهرة</option>
            <option value="giza">الجيزة</option>
            <option value="alex">الإسكندرية</option>
          </select>
          <select className={styles.selectInput}>
            <option value="">الخدمة المطلوبة...</option>
            <option value="barber">حلاقة رجالي</option>
            <option value="salon">كوافير حريمي</option>
            <option value="skin">تنظيف بشرة</option>
          </select>
          <button className={`btn-primary ${styles.searchBtn}`}>بحث</button>
        </div>
      </section>

      {/* Top Shops */}
      <section className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>⭐ المحلات الموصى بها</h2>
          <Link href="/explore" className={styles.viewAll}>استكشف المزيد</Link>
        </div>

        <div className={styles.shopsGrid}>
          {shops && shops.length > 0 ? shops.map((shop) => (
            <div key={shop.id} className={`card ${styles.shopCard}`}>
              <div className={styles.shopImg}>
                {shop.shop_type === 'barbershop' ? '💈' : '💅'}
              </div>
              <div className={styles.shopInfo}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h3 className={styles.shopName}>{shop.name}</h3>
                    <div className={styles.shopType}>{shop.shop_type === 'barbershop' ? 'صالون رجالي' : 'كوافير حريمي'}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px'}}>📍 {shop.address}</div>
                  </div>
                  <div className={styles.rating}>⭐ 5.0 <span>(جديد)</span></div>
                </div>
                <Link href={`/shop/${shop.id}`} className="btn-secondary" style={{width: '100%', marginTop: '16px', textAlign: 'center'}}>عرض الخدمات والحجز</Link>
              </div>
            </div>
          )) : (
            <div style={{padding: '20px', color: 'var(--text-muted)'}}>لا توجد محلات معتمدة حالياً. يرجى إضافة محلك!</div>
          )}
        </div>
      </section>

    </div>
  );
}

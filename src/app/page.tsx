import styles from "./page.module.css";
import Link from "next/link";
import { createClient } from '@/utils/supabase/server';

export default async function Home({ searchParams }: { searchParams: Promise<{ location?: string; type?: string; sort?: string }> }) {
  const supabase = await createClient();
  const { location, type, sort } = await searchParams;

  // Build Query
  let query = supabase
    .from('shops')
    .select('*, shop_images(image_url, is_primary), services(price)')
    .eq('status', 'approved');

  if (type) {
    query = query.eq('shop_type', type);
  }

  const { data: rawShops } = await query;

  let shops = rawShops || [];

  // Client-side / In-memory Filtering & Sorting
  if (location) {
    shops = shops.filter(s => s.address?.includes(location));
  }

  if (sort === 'price_asc') {
    shops.sort((a, b) => {
      const minA = a.services?.length ? Math.min(...a.services.map((svc: any) => svc.price)) : 9999;
      const minB = b.services?.length ? Math.min(...b.services.map((svc: any) => svc.price)) : 9999;
      return minA - minB;
    });
  } else if (sort === 'price_desc') {
    shops.sort((a, b) => {
      const minA = a.services?.length ? Math.min(...a.services.map((svc: any) => svc.price)) : 0;
      const minB = b.services?.length ? Math.min(...b.services.map((svc: any) => svc.price)) : 0;
      return minB - minA;
    });
  }

  return (
    <div className={styles.homeWrapper}>
      
      {/* 1. Hero Section */}
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroBadge}>
          ⚡ المنصة الأولى لحجز الصالونات في مصر 🇪🇬
        </div>
        <h1 className={styles.heroTitle}>
          احجز دورك في أفضل الصالونات بدون انتظار ✂️🔥
        </h1>
        <p className={styles.heroSubtitle}>
          اختر الصالون المفضل لديك، تصفح الخدمات والأسعار، واحجز ميعادك بضغطة زر واحدة بدون زحمة.
        </p>

        {/* Quick Category Chips */}
        <div className={styles.chipsContainer}>
          <Link href="/" className={`${styles.chip} ${!type ? styles.chipActive : ''}`}>الكل 🌐</Link>
          <Link href="/?type=barbershop" className={`${styles.chip} ${type === 'barbershop' ? styles.chipActive : ''}`}>💈 صالون رجالي</Link>
          <Link href="/?type=salon" className={`${styles.chip} ${type === 'salon' ? styles.chipActive : ''}`}>💅 كوافير حريمي</Link>
        </div>

        {/* Advanced Search & Filter Form */}
        <form action="/" method="GET" className={styles.searchBox}>
          {type && <input type="hidden" name="type" value={type} />}
          
          <select name="location" defaultValue={location || ""} className={styles.selectInput}>
            <option value="">جميع المناطق 📍</option>
            <option value="القاهرة">القاهرة</option>
            <option value="الجيزة">الجيزة</option>
            <option value="الإسكندرية">الإسكندرية</option>
          </select>

          <select name="type" defaultValue={type || ""} className={styles.selectInput}>
            <option value="">نوع الصالون ✂️</option>
            <option value="barbershop">💈 صالون رجالي</option>
            <option value="salon">💅 كوافير حريمي</option>
          </select>

          <select name="sort" defaultValue={sort || ""} className={styles.selectInput}>
            <option value="">الترتيب حسب... 📊</option>
            <option value="price_asc">💰 من الأرخص للأغلى</option>
            <option value="price_desc">💎 من الأغلى للأرخص</option>
            <option value="rating_desc">⭐ الأعلى تقييماً</option>
          </select>

          <button type="submit" className={`btn-primary ${styles.searchBtn}`}>
            تصفية وبحث 🔍
          </button>
        </form>
      </section>

      {/* 2. Stats Section */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          <div>
            <div className={styles.statNumber}>100+</div>
            <div className={styles.statLabel}>صالون معتمد وشريك</div>
          </div>
          <div>
            <div className={styles.statNumber}>+1,500</div>
            <div className={styles.statLabel}>حجز ناجح بدون انتظار</div>
          </div>
          <div>
            <div className={styles.statNumber}>4.9/5</div>
            <div className={styles.statLabel}>تقييم العملاء في الخدمة</div>
          </div>
        </div>
      </section>

      {/* 3. Recommended / Filtered Shops */}
      <section className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>⭐ الصالونات المتاحة للحجز</h2>
          <Link href="/explore" className={styles.viewAll}>عرض جميع المحلات ←</Link>
        </div>

        <div className={styles.shopsGrid}>
          {shops && shops.length > 0 ? shops.map((shop: any) => {
            const minPrice = shop.services?.length 
              ? Math.min(...shop.services.map((svc: any) => svc.price))
              : null;

            return (
              <div key={shop.id} className={styles.shopCard}>
                <div className={styles.shopImg}>
                  {shop.shop_type === 'barbershop' ? '💈' : '💅'}
                </div>
                <div className={styles.shopInfo}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                      <h3 className={styles.shopName}>{shop.name}</h3>
                      <div className={styles.shopType}>
                        {shop.shop_type === 'barbershop' ? '💈 صالون رجالي' : '💅 كوافير حريمي'}
                      </div>
                      <div style={{fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px'}}>
                        📍 {shop.address}
                      </div>
                    </div>
                    <div className={styles.rating}>⭐ 5.0 <span>(جديد)</span></div>
                  </div>

                  {minPrice !== null && (
                    <div style={{marginTop: '12px', fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold'}}>
                      تبدأ الأسعار من: {minPrice} ج.م
                    </div>
                  )}

                  <Link 
                    href={`/shop/${shop.id}`} 
                    className="btn-primary" 
                    style={{width: '100%', marginTop: '16px', borderRadius: '12px'}}
                  >
                    عرض الخدمات والحجز ✂️
                  </Link>
                </div>
              </div>
            );
          }) : (
            <div className="card" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>
              لا توجد صالونات مطابقة للبحث حالياً. 
              <br />
              <Link href="/" style={{color: 'var(--primary)', marginTop: '10px', display: 'inline-block'}}>إعادة ضبط البحث</Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. Features Section (Why Trimio) */}
      <section className="container">
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={{fontSize: '32px', marginBottom: '10px'}}>لماذا اختار منصة Trimio؟ ⚡</h2>
          <p style={{color: 'var(--text-muted)'}}>نوفر لك تجربة حجز متكاملة ومريحة بدون ضياع وقتك</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⏱️</div>
            <h3 className={styles.featureTitle}>بدون انتظار</h3>
            <p className={styles.featureDesc}>احجز دورك وحافظ على وقتك الثمين وادخل الصالون في ميعادك المحدد بالظبط.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔔</div>
            <h3 className={styles.featureTitle}>إشعارات لحظية</h3>
            <p className={styles.featureDesc}>استلم إشعارات فورية بتأكيد الحجز، التعديل، أو التنبيه قبل موعدك.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💎</div>
            <h3 className={styles.featureTitle}>أفضل الأسعار والعروض</h3>
            <p className={styles.featureDesc}>تصفح قائمة أسعار الخدمات واكتشف العروض والخصومات الحصرية أولاً بأول.</p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>Trimio ✂️</div>
            <p className={styles.footerDesc}>
              المنصة الأولى والأنسب لحجز مواعيد صالونات الحلاقة والتجميل في مصر بأعلى جودة وسهولة.
            </p>
          </div>

          <div>
            <h4 className={styles.footerTitle}>روابط سريعة</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/explore">استكشف الصالونات</Link></li>
              <li><Link href="/offers">العروض والخصومات</Link></li>
              <li><Link href="/join-shop">أضف محلك كشريك</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerTitle}>تواصل معنا</h4>
            <ul className={styles.footerLinks}>
              <li>الدعم الفني: support@trimio.com</li>
              <li>مصر، القاهرة 🇪🇬</li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          جميع الحقوق محفوظة © {new Date().getFullYear()} Trimio
        </div>
      </footer>

    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function ExplorePage() {
  const supabase = await createClient();
  
  // Fetch approved shops
  const { data: shops } = await supabase
    .from('shops')
    .select('*, shop_images(image_url, is_primary)')
    .eq('status', 'approved');

  return (
    <div className="container" style={{ padding: '40px 0', minHeight: '80vh' }}>
      <h1 style={{ marginBottom: '10px' }}>استكشف المحلات 🔍</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        تصفح أفضل صالونات الحلاقة ومراكز التجميل المتاحة.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {shops && shops.length > 0 ? shops.map((shop) => (
          <div key={shop.id} className="card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{shop.name}</h3>
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                  {shop.shop_type === 'barbershop' ? '💈 صالون رجالي' : '💅 كوافير حريمي'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                  📍 {shop.address}
                </div>
              </div>
              <div style={{ background: 'rgba(255,165,0,0.1)', color: 'orange', padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem' }}>
                ⭐ 5.0
              </div>
            </div>
            
            <Link 
              href={`/shop/${shop.id}`} 
              className="btn-secondary" 
              style={{ display: 'block', textAlign: 'center', width: '100%' }}
            >
              عرض الخدمات والحجز
            </Link>
          </div>
        )) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            لا توجد محلات مسجلة حالياً.
          </div>
        )}
      </div>
    </div>
  );
}

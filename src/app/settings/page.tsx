import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminShopControls from '@/components/AdminShopControls'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Verify Admin Access
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // 2. Fetch Dashboard Data
  // Total Users
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  
  // Shops
  const { data: allShops } = await supabase.from('shops').select('*, profiles(full_name, phone_number)')
  const pendingShops = allShops?.filter(s => s.status === 'pending') || []
  const approvedShops = allShops?.filter(s => s.status === 'approved') || []

  // Revenue (Calculate total from completed bookings)
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('services(price)')
    .eq('status', 'completed')

  let totalSales = 0
  if (completedBookings) {
    totalSales = completedBookings.reduce((sum, b: any) => sum + (b.services?.price || 0), 0)
  }

  const platformFee = totalSales * 0.10 // 10% demo fee

  return (
    <div className="container" style={{paddingTop: '40px', paddingBottom: '60px'}}>
      <h1 style={{color: 'var(--primary-dark)', marginBottom: '30px'}}>لوحة الإدارة (غرفة العمليات)</h1>

      {/* Overview Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center'}}>
          <div style={{fontSize: '32px', marginBottom: '10px'}}>👥</div>
          <div style={{color: 'var(--text-muted)'}}>إجمالي المستخدمين</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-dark)'}}>{usersCount || 0}</div>
        </div>
        
        <div style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center'}}>
          <div style={{fontSize: '32px', marginBottom: '10px'}}>🏪</div>
          <div style={{color: 'var(--text-muted)'}}>المحلات المعتمدة</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-dark)'}}>{approvedShops.length}</div>
        </div>

        <div style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center'}}>
          <div style={{fontSize: '32px', marginBottom: '10px'}}>💰</div>
          <div style={{color: 'var(--text-muted)'}}>مبيعات المحلات (تمت)</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--success)'}}>{totalSales} ج.م</div>
        </div>

        <div style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center'}}>
          <div style={{fontSize: '32px', marginBottom: '10px'}}>📈</div>
          <div style={{color: 'var(--text-muted)'}}>أرباح المنصة (10%)</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)'}}>{platformFee} ج.م</div>
        </div>
      </div>

      {/* Pending Shops */}
      <div style={{marginBottom: '40px'}}>
        <h2 style={{borderBottom: '2px solid var(--border)', paddingBottom: '10px', marginBottom: '20px'}}>طلبات الانضمام المعلقة ({pendingShops.length})</h2>
        {pendingShops.length === 0 ? (
          <p style={{color: 'var(--text-muted)'}}>لا توجد طلبات جديدة.</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {pendingShops.map((shop) => (
              <div key={shop.id} style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--warning)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap'}}>
                  <div>
                    <h3 style={{color: 'var(--primary-dark)'}}>{shop.name}</h3>
                    <p style={{color: 'var(--text-muted)', fontSize: '14px', margin: '5px 0'}}>📍 {shop.address}</p>
                    <p style={{fontSize: '14px'}}><strong>صاحب المحل:</strong> {shop.profiles?.full_name} | {shop.profiles?.phone_number}</p>
                    <p style={{fontSize: '14px'}}><strong>النوع:</strong> {shop.shop_type === 'barbershop' ? 'صالون رجالي' : 'كوافير حريمي'}</p>
                  </div>
                  <AdminShopControls shopId={shop.id} status={shop.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Shops */}
      <div>
        <h2 style={{borderBottom: '2px solid var(--border)', paddingBottom: '10px', marginBottom: '20px'}}>المحلات الحالية ({approvedShops.length})</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
          {approvedShops.map((shop) => (
            <div key={shop.id} style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)'}}>
              <h3 style={{color: 'var(--primary-dark)'}}>{shop.name}</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '14px', margin: '5px 0'}}>📍 {shop.address}</p>
              <p style={{fontSize: '14px', marginBottom: '10px'}}><strong>صاحب المحل:</strong> {shop.profiles?.full_name}</p>
              <AdminShopControls shopId={shop.id} status={shop.status} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

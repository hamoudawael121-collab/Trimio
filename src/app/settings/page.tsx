import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminShopControls from '@/components/AdminShopControls'
import { deleteShop, deleteUser } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Verify Admin Access
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    redirect('/login')
  }

  const isWaelAdmin = authData.user.email === 'wael@trimio.com'
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
  if (profile?.role !== 'admin' && !isWaelAdmin) {
    redirect('/')
  }

  // 2. Fetch Comprehensive Data
  const { data: allUsers } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  const usersCount = allUsers?.length || 0
  const customersCount = allUsers?.filter(u => u.role === 'customer').length || 0
  const shopOwnersCount = allUsers?.filter(u => u.role === 'shop_owner').length || 0

  // Shops
  const { data: allShops } = await supabase.from('shops').select('*, profiles(full_name, phone_number)')
  const pendingShops = allShops?.filter(s => s.status === 'pending') || []
  const approvedShops = allShops?.filter(s => s.status === 'approved') || []

  // All Bookings
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, shops(id, name, owner_id), profiles(full_name, phone_number), services(name, price)')
    .order('created_at', { ascending: false })

  const bookingsList = allBookings || []
  const totalBookingsCount = bookingsList.length
  const completedBookings = bookingsList.filter(b => b.status === 'completed')
  const confirmedBookingsCount = bookingsList.filter(b => b.status === 'confirmed').length
  const pendingBookingsCount = bookingsList.filter(b => b.status === 'pending').length

  // Calculate Total Sales
  const totalSales = completedBookings.reduce((sum, b: any) => sum + (b.services?.price || 0), 0)

  // Map analytics per shop
  const shopAnalytics = approvedShops.map(shop => {
    const shopBookings = bookingsList.filter(b => b.shop_id === shop.id)
    const shopCompleted = shopBookings.filter(b => b.status === 'completed')
    const shopRevenue = shopCompleted.reduce((sum, b: any) => sum + (b.services?.price || 0), 0)

    return {
      ...shop,
      totalBookings: shopBookings.length,
      completedBookings: shopCompleted.length,
      revenue: shopRevenue,
    }
  })

  // Map analytics per user
  const userAnalytics = (allUsers || []).map(user => {
    const userBookings = bookingsList.filter(b => b.customer_id === user.id)
    const userCompleted = userBookings.filter(b => b.status === 'completed')
    const userSpent = userCompleted.reduce((sum, b: any) => sum + (b.services?.price || 0), 0)

    return {
      ...user,
      totalBookings: userBookings.length,
      totalSpent: userSpent,
    }
  })

  // All Notifications for Admin
  const { data: adminNotifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const notificationsList = adminNotifications || []

  return (
    <div className="container" style={{paddingTop: '40px', paddingBottom: '80px'}}>
      
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px'}}>
        <div>
          <h1 style={{color: 'var(--primary)', fontSize: '32px'}}>📊 غرفة العمليات والتحليلات الشاملة</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px'}}>متابعة حية وإحصائيات دقيقة لجميع المحلات والمستخدمين والحجوزات</p>
        </div>
        <div style={{background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: 'bold'}}>
          🟢 النظام يعمل مباشرة (Live Data)
        </div>
      </div>

      {/* Live Admin Notifications Feed */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '35px',
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)',
        backdropFilter: 'blur(15px)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0}}>
            🔔 مركز الإشعارات والتنبيهات الفورية
          </h2>
          <span style={{fontSize: '12px', background: 'var(--primary)', color: '#000', padding: '3px 10px', borderRadius: '50px', fontWeight: 'bold'}}>
            {notificationsList.length} إشعار حديث
          </span>
        </div>

        {notificationsList.length === 0 ? (
          <div style={{color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '15px 0'}}>
            لا توجد إشعارات جديدة حالياً. سيوصلك تنبيه فوري هنا فور تسجيل أي مستخدم جديد أو حجز! ✨
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {notificationsList.map(notif => (
              <div key={notif.id} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '14px', color: '#F8FAFC', marginBottom: '4px'}}>
                    {notif.title}
                  </div>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>
                    {notif.message}
                  </div>
                </div>
                <div style={{fontSize: '11px', color: 'var(--primary)', fontWeight: '600'}} dir="ltr">
                  {notif.created_at ? new Date(notif.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Global Metrics Overview */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div style={{background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <span style={{fontSize: '28px'}}>👥</span>
            <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>إجمالي الحسابات</span>
          </div>
          <div style={{fontSize: '28px', fontWeight: '900', color: 'var(--text-main)'}}>{usersCount}</div>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px'}}>
            👤 {customersCount} زبون | 💈 {shopOwnersCount} صاحب محل
          </div>
        </div>

        <div style={{background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <span style={{fontSize: '28px'}}>🏪</span>
            <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>إجمالي المحلات</span>
          </div>
          <div style={{fontSize: '28px', fontWeight: '900', color: 'var(--primary)'}}>{allShops?.length || 0}</div>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px'}}>
            ✅ {approvedShops.length} معتمد | ⏳ {pendingShops.length} معلق
          </div>
        </div>

        <div style={{background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <span style={{fontSize: '28px'}}>📅</span>
            <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>إجمالي الحجوزات</span>
          </div>
          <div style={{fontSize: '28px', fontWeight: '900', color: 'var(--text-main)'}}>{totalBookingsCount}</div>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px'}}>
            ✔️ {completedBookings.length} تم | ⏳ {pendingBookingsCount} انتظر | 👍 {confirmedBookingsCount} مؤكد
          </div>
        </div>

        <div style={{background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <span style={{fontSize: '28px'}}>💰</span>
            <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>مبيعات المحلات</span>
          </div>
          <div style={{fontSize: '28px', fontWeight: '900', color: 'var(--success)'}}>{totalSales} ج.م</div>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px'}}>إجمالي الدخل المحقق</div>
        </div>

        </div>

      {/* 2. Pending Shop Approvals */}
      {pendingShops.length > 0 && (
        <div style={{marginBottom: '40px', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid #EAB308', padding: '24px', borderRadius: '16px'}}>
          <h2 style={{color: '#EAB308', fontSize: '20px', marginBottom: '16px'}}>⚠️ طلبات انضمام محلات جديدة بانتظار موافقتك ({pendingShops.length})</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {pendingShops.map((shop) => (
              <div key={shop.id} style={{background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
                <div>
                  <h3 style={{fontSize: '18px', fontWeight: 'bold'}}>{shop.name}</h3>
                  <p style={{fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0'}}>📍 {shop.address}</p>
                  <p style={{fontSize: '13px'}}><strong>صاحب المحل:</strong> {shop.profiles?.full_name} ({shop.profiles?.phone_number})</p>
                </div>
                <AdminShopControls shopId={shop.id} status={shop.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Detailed Per-Shop Analytics Table */}
      <div style={{marginBottom: '40px'}}>
        <h2 style={{fontSize: '22px', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '10px'}}>
          🏬 إحصائيات وحجوزات كل محل بالتفصيل ({approvedShops.length})
        </h2>

        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right', background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)'}}>
            <thead style={{background: '#1F2937', color: 'var(--text-main)', fontSize: '14px'}}>
              <tr>
                <th style={{padding: '16px'}}>اسم المحل</th>
                <th style={{padding: '16px'}}>صاحب المحل (الهاتف)</th>
                <th style={{padding: '16px'}}>نوع المحل</th>
                <th style={{padding: '16px'}}>إجمالي الحجوزات</th>
                <th style={{padding: '16px'}}>الحجوزات الناجحة</th>
                <th style={{padding: '16px'}}>دخول المحل (مبيعات)</th>
                <th style={{padding: '16px'}}>الإجراءات</th>
              </tr>
            </thead>
            <tbody style={{fontSize: '14px'}}>
              {shopAnalytics.length > 0 ? shopAnalytics.map((shop) => (
                <tr key={shop.id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td style={{padding: '16px', fontWeight: 'bold'}}>{shop.name}</td>
                  <td style={{padding: '16px'}}>{shop.profiles?.full_name || 'غير معروف'} <br/><span style={{fontSize: '12px', color: 'var(--text-muted)'}}>{shop.profiles?.phone_number}</span></td>
                  <td style={{padding: '16px'}}>{shop.shop_type === 'barbershop' ? '💈 رجالي' : '💅 حريمي'}</td>
                  <td style={{padding: '16px', fontWeight: 'bold'}}>{shop.totalBookings} حجز</td>
                  <td style={{padding: '16px', color: 'var(--success)', fontWeight: 'bold'}}>{shop.completedBookings} مكتمل</td>
                  <td style={{padding: '16px', fontWeight: 'bold'}}>{shop.revenue} ج.م</td>
                  <td style={{padding: '16px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <AdminShopControls shopId={shop.id} status={shop.status} />
                    <form action={async () => { 'use server'; await deleteShop(shop.id); }}>
                      <button type="submit" style={{padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}} title="حذف المحل">
                        🗑️ حذف
                      </button>
                    </form>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} style={{padding: '30px', textAlign: 'center', color: 'var(--text-muted)'}}>لا توجد محلات معتمدة حتى الآن.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Detailed User Activity Analytics */}
      <div style={{marginBottom: '40px'}}>
        <h2 style={{fontSize: '22px', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '10px'}}>
          👥 قائمة وحسابات جميع المستخدمين والحجوزات ({userAnalytics.length})
        </h2>

        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right', background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)'}}>
            <thead style={{background: '#1F2937', color: 'var(--text-main)', fontSize: '14px'}}>
              <tr>
                <th style={{padding: '16px'}}>اسم المستخدم</th>
                <th style={{padding: '16px'}}>رقم الهاتف</th>
                <th style={{padding: '16px'}}>نوع الحساب</th>
                <th style={{padding: '16px'}}>تاريخ التسجيل</th>
                <th style={{padding: '16px'}}>عدد الحجوزات</th>
                <th style={{padding: '16px'}}>إجمالي ما أنفقه (ج.م)</th>
                <th style={{padding: '16px'}}>الإجراءات</th>
              </tr>
            </thead>
            <tbody style={{fontSize: '14px'}}>
              {userAnalytics.map((user) => (
                <tr key={user.id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td style={{padding: '16px', fontWeight: 'bold'}}>{user.full_name || 'غير محدد'}</td>
                  <td dir="ltr" style={{padding: '16px', textAlign: 'right'}}>{user.phone_number}</td>
                  <td style={{padding: '16px'}}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 'bold',
                      background: user.role === 'admin' ? 'rgba(56, 189, 248, 0.2)' : user.role === 'shop_owner' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: user.role === 'admin' ? 'var(--primary)' : user.role === 'shop_owner' ? 'var(--secondary)' : 'var(--text-main)',
                      border: '1px solid var(--border)'
                    }}>
                      {user.role === 'admin' ? '👮 مدير' : user.role === 'shop_owner' ? '💈 صاحب محل' : '👤 زبون'}
                    </span>
                  </td>
                  <td style={{padding: '16px', fontSize: '13px', color: 'var(--text-muted)'}} dir="ltr">
                    {user.created_at ? new Date(user.created_at).toLocaleString('ar-EG') : 'سابق'}
                  </td>
                  <td style={{padding: '16px', fontWeight: 'bold'}}>{user.totalBookings} حجز</td>
                  <td style={{padding: '16px', color: 'var(--success)', fontWeight: 'bold'}}>{user.totalSpent} ج.م</td>
                  <td style={{padding: '16px'}}>
                    {user.role !== 'admin' && (
                      <form action={async () => { 'use server'; await deleteUser(user.id); }}>
                        <button type="submit" style={{padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}} title="حذف المستخدم">
                          🗑️ حذف
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Feed of Latest Bookings Across Platform */}
      <div>
        <h2 style={{fontSize: '22px', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '10px'}}>
          ⚡ سجل أحدث الحجوزات على مستوى جميع المحلات
        </h2>

        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right', background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)'}}>
            <thead style={{background: '#1F2937', color: 'var(--text-main)', fontSize: '14px'}}>
              <tr>
                <th style={{padding: '16px'}}>العميل</th>
                <th style={{padding: '16px'}}>المحل</th>
                <th style={{padding: '16px'}}>الخدمة والسعر</th>
                <th style={{padding: '16px'}}>تاريخ الحجز</th>
                <th style={{padding: '16px'}}>الحالة الحالية</th>
              </tr>
            </thead>
            <tbody style={{fontSize: '14px'}}>
              {bookingsList.length > 0 ? bookingsList.slice(0, 10).map((booking: any) => (
                <tr key={booking.id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td style={{padding: '16px'}}>
                    <div style={{fontWeight: 'bold'}}>{booking.profiles?.full_name || 'غير معروف'}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{booking.profiles?.phone_number}</div>
                  </td>
                  <td style={{padding: '16px', fontWeight: 'bold', color: 'var(--primary)'}}>{booking.shops?.name || 'محل deleted'}</td>
                  <td style={{padding: '16px'}}>
                    <div>{booking.services?.name || 'خدمة'}</div>
                    <div style={{fontWeight: 'bold', color: 'var(--success)'}}>{booking.services?.price || 0} ج.م</div>
                  </td>
                  <td dir="ltr" style={{padding: '16px', textAlign: 'right'}}>
                    {new Date(booking.booking_time).toLocaleString('ar-EG')}
                  </td>
                  <td style={{padding: '16px'}}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 'bold',
                      background: booking.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : booking.status === 'confirmed' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: booking.status === 'completed' ? 'var(--success)' : booking.status === 'confirmed' ? 'var(--primary)' : '#FCD34D'
                    }}>
                      {booking.status === 'completed' ? '✔️ مكتمل' : booking.status === 'confirmed' ? '👍 مؤكد' : '⏳ قيد الانتظار'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{padding: '30px', textAlign: 'center', color: 'var(--text-muted)'}}>لا توجد حجوزات مسجلة على المنصة بعد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

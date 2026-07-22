import Link from 'next/link';
import styles from './Navbar.module.css';
import NotificationsBell from './NotificationsBell';
import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/actions/auth';

export default async function Navbar() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  
  let role = null;
  if (authData?.user) {
    if (authData.user.email === 'wael@trimio.com') {
      role = 'admin'
    } else {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
      role = profile?.role
    }
  }

  const isLoggedIn = !!authData?.user;

  return (
    <nav className="container">
      <div className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          Trimio
        </Link>
        
        <div className={styles.links}>
          <Link href="/explore" className={styles.link}>استكشف</Link>
          <Link href="/offers" className={styles.link}>العروض</Link>
          
          {/* Show "My Bookings" only for logged in customers (or anyone logged in) */}
          {isLoggedIn && <Link href="/my-bookings" className={styles.link}>حجوزاتي</Link>}
          
          {/* Show "Join Shop" for guests or normal customers who want to become shop owners */}
          {(!isLoggedIn || role === 'customer') && <Link href="/join-shop" className={styles.link}>أضف محلك</Link>}
          
          {/* Show "Shop Dashboard" only for shop owners */}
          {role === 'shop_owner' && <Link href="/shop-dashboard" className={styles.link}>لوحة تحكم محلي</Link>}
          
          {/* Show "Admin Settings" only for admins */}
          {role === 'admin' && <Link href="/settings" className={styles.link}>الإدارة</Link>}
        </div>

        <div className={styles.actions} style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          {isLoggedIn && <NotificationsBell />}
          
          {!isLoggedIn ? (
            <>
              <Link href="/login" className={styles.loginBtn}>تسجيل الدخول</Link>
              <Link href="/signup" className="btn-primary">حساب جديد</Link>
            </>
          ) : (
            <form action={logout}>
              <button type="submit" className={styles.loginBtn} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)'}}>تسجيل الخروج</button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}

import Link from 'next/link';
import styles from './Navbar.module.css';
import NotificationsBell from './NotificationsBell';

export default function Navbar() {
  return (
    <nav className="container">
      <div className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          Trimio
        </Link>
        
        <div className={styles.links}>
          <Link href="/explore" className={styles.link}>استكشف</Link>
          <Link href="/offers" className={styles.link}>العروض</Link>
          <Link href="/my-bookings" className={styles.link}>حجوزاتي</Link>
          <Link href="/join-shop" className={styles.link}>أضف محلك</Link>
          <Link href="/shop-dashboard" className={styles.link}>لوحة تحكم محلي</Link>
          <Link href="/settings" className={styles.link}>الإدارة</Link>
        </div>

        <div className={styles.actions} style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <NotificationsBell />
          <Link href="/login" className={styles.loginBtn}>تسجيل الدخول</Link>
          <Link href="/signup" className="btn-primary">حساب جديد</Link>
        </div>
      </div>
    </nav>
  );
}

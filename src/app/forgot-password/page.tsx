import styles from '../login/page.module.css';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/auth';

export const dynamic = 'force-dynamic'

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const { message, error } = await searchParams;

  return (
    <div className={styles.container}>
      <div className={`card ${styles.authCard}`}>
        <h1 className={styles.title}>إعادة تعيين كلمة المرور 🔐</h1>
        <p className={styles.subtitle}>أدخل رقم تليفونك المسجل وكلمة المرور الجديدة</p>
        
        {message && <div style={{color: 'var(--success)', marginBottom: '16px', fontWeight: 'bold'}}>{message}</div>}
        {error && <div style={{color: 'var(--danger)', marginBottom: '16px', fontWeight: 'bold'}}>{error}</div>}

        <form className={styles.form} action={resetPassword}>
          <div className={styles.formGroup}>
            <label className={styles.label}>رقم التليفون المسجل</label>
            <input type="tel" name="phone" className={styles.input} placeholder="010XXXXXXXX" required />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور الجديدة</label>
            <input type="password" name="newPassword" className={styles.input} placeholder="أدخل كلمة المرور الجديدة" required minLength={6} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>تأكيد كلمة المرور الجديدة</label>
            <input type="password" name="confirmPassword" className={styles.input} placeholder="أعد كتابة كلمة المرور" required minLength={6} />
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>تحديث كلمة المرور</button>
        </form>
        
        <div className={styles.footer}>
          تذكرت كلمة المرور؟ <Link href="/login" className={styles.link}>تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

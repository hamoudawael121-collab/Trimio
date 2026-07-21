import styles from './page.module.css';
import Link from 'next/link';
import { login } from '@/app/actions/auth';

export default async function Login({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const { message } = await searchParams;

  return (
    <div className={styles.container}>
      <div className={`card ${styles.authCard}`}>
        <h1 className={styles.title}>تسجيل الدخول</h1>
        <p className={styles.subtitle}>أهلاً بك مجدداً في Trimio</p>
        
        {message && <div style={{color: 'var(--danger)', marginBottom: '16px'}}>{message}</div>}

        <form className={styles.form} action={login}>
          <div className={styles.formGroup}>
            <label className={styles.label}>رقم التليفون (أو اسم المستخدم للإدارة)</label>
            <input type="text" name="phone" className={styles.input} placeholder="أدخل رقم التليفون" required />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور</label>
            <input type="password" name="password" className={styles.input} placeholder="أدخل كلمة المرور" required />
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>دخول</button>
        </form>
        
        <div className={styles.footer}>
          ليس لديك حساب؟ <Link href="/signup" className={styles.link}>سجل الآن</Link>
        </div>
      </div>
    </div>
  );
}

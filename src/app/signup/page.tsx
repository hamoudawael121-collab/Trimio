import styles from '../login/page.module.css';
import Link from 'next/link';
import { signup } from '@/app/actions/auth';

export default async function Signup({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const { message } = await searchParams;

  return (
    <div className={styles.container}>
      <div className={`card ${styles.authCard}`}>
        <h1 className={styles.title}>حساب جديد</h1>
        <p className={styles.subtitle}>انضم إلى Trimio واحجز بسهولة</p>
        
        {message && <div style={{color: 'var(--danger)', marginBottom: '16px'}}>{message}</div>}

        <form className={styles.form} action={signup}>
          <div className={styles.formGroup}>
            <label className={styles.label}>الاسم بالكامل</label>
            <input type="text" name="fullName" className={styles.input} placeholder="مثال: أحمد محمد" required />
          </div>

          <div className="form-group">
            <label className="form-label">رقم الهاتف (للدخول لاحقاً)</label>
            <input 
              type="tel" 
              name="phone" 
              className="form-input" 
              placeholder="01012345678" 
              required 
              maxLength={11}
              pattern="^(010|011|012|015)[0-9]{8}$"
              title="رقم مصري صحيح يتكون من 11 رقم"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور</label>
            <input type="password" name="password" className={styles.input} placeholder="أدخل كلمة مرور قوية" required />
          </div>
          
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>إنشاء حساب</button>
        </form>
        
        <div className={styles.footer}>
          لديك حساب بالفعل؟ <Link href="/login" className={styles.link}>تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

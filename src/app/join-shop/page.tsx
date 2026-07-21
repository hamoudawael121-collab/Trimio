import styles from './page.module.css';
import { registerShop } from '@/app/actions/shop';

export default async function JoinShop({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;

  return (
    <div className={styles.container}>
      <div className={`card ${styles.card}`}>
        <h1 className={styles.title}>انضم كشريك (صاحب محل)</h1>
        <p className={styles.subtitle}>أضف صالونك إلى منصتنا وابدأ في استقبال الحجوزات</p>
        
        {message && <div style={{color: 'var(--success)', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold'}}>{message}</div>}

        <form className={styles.form} action={registerShop}>
          
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم بالكامل (صاحب المحل)</label>
              <input type="text" name="ownerName" className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>رقم التليفون للتواصل (ويستخدم لتسجيل الدخول)</label>
              <input type="tel" name="phone" className={styles.input} required />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>كلمة المرور</label>
              <input type="password" name="password" className={styles.input} required />
            </div>
          </div>

          <hr style={{borderTop: '1px solid var(--border)', margin: '10px 0'}} />

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>اسم المحل</label>
              <input type="text" name="shopName" className={styles.input} required />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>نوع المحل</label>
              <select name="shopType" className={styles.select} required>
                <option value="barbershop">صالون حلاقة رجالي</option>
                <option value="salon">كوافير حريمي</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>رابط الموقع من خرائط جوجل (Google Maps Link)</label>
            <input type="url" name="googleMapsLink" className={styles.input} placeholder="https://maps.google.com/..." required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>العنوان بالتفصيل</label>
            <input type="text" name="address" className={styles.input} required />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>صورة للمحل (اختياري حالياً)</label>
              <input type="file" name="shopImage" accept="image/*" className={styles.fileInput} />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>إثبات الملكية (بطاقة أو سجل تجاري - اختياري حالياً)</label>
              <input type="file" name="proofOfOwnership" accept="image/*,.pdf" className={styles.fileInput} />
            </div>
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>تسجيل المحل كشريك</button>
        </form>
      </div>
    </div>
  );
}

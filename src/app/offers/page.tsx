import Link from 'next/link';

export default function OffersPage() {
  return (
    <div className="container" style={{ padding: '60px 0', minHeight: '80vh', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎁</div>
      <h1 style={{ marginBottom: '15px' }}>العروض والخصومات</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
        نعمل حالياً على تجهيز أقوى العروض والخصومات من شركائنا في مختلف الصالونات ومراكز التجميل.
        ترقبوا مفاجآت كبيرة قريباً!
      </p>
      
      <Link href="/explore" className="btn-primary" style={{ display: 'inline-block' }}>
        تصفح المحلات المتاحة
      </Link>
    </div>
  );
}

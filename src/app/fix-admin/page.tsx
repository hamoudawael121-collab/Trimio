import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function FixAdmin() {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return <div>يرجى تسجيل الدخول أولاً باسم wael</div>
  }

  // Upsert profile for the logged in user to make them admin
  const { error } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    full_name: 'Wael (Admin)',
    phone_number: 'wael',
    role: 'admin'
  })

  if (error) {
    return <div>Error making admin: {error.message}</div>
  }

  return (
    <div style={{padding: '50px', textAlign: 'center'}}>
      <h1>تم تفعيل صلاحيات الإدارة بنجاح! ✅</h1>
      <p>يمكنك الآن الذهاب للصفحة الرئيسية وستجد تبويب "الإدارة".</p>
      <a href="/" style={{color: 'blue'}}>العودة للرئيسية</a>
    </div>
  )
}

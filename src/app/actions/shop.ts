'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerShop(formData: FormData) {
  let phone = formData.get('phone') as string
  phone = phone.replace(/[^0-9]/g, '')

  // Egyptian phone validation
  if (!/^(010|011|012|015)[0-9]{8}$/.test(phone)) {
    return redirect('/join-shop?message=' + encodeURIComponent('رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010, 011, 012 أو 015'))
  }

  const email = `${phone}@trimio.com`
  
  const password = formData.get('password') as string
  const ownerName = formData.get('ownerName') as string
  const shopName = formData.get('shopName') as string
  const shopType = formData.get('shopType') as string
  const googleMapsLink = formData.get('googleMapsLink') as string
  const address = formData.get('address') as string

  // Handle files later via Supabase storage
  // const shopImage = formData.get('shopImage') as File
  // const proofOfOwnership = formData.get('proofOfOwnership') as File

  const supabase = await createClient()

  // 1. Create User Account for Shop Owner
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return redirect('/join-shop?message=' + encodeURIComponent('حدث خطأ في التسجيل: ' + authError.message))
  }

  if (authData.user) {
    // 2. Create Profile as 'shop_owner'
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: ownerName,
      phone_number: phone,
      role: 'shop_owner'
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // 3. Create Shop Entry (Status defaults to 'pending')
    const { error: shopError } = await supabase.from('shops').insert({
      owner_id: authData.user.id,
      name: shopName,
      address: address,
      shop_type: shopType,
      google_maps_link: googleMapsLink,
      status: 'pending' // Admin must approve
    });

    if (shopError) {
      console.error("Shop creation error:", shopError);
      return redirect('/join-shop?message=' + encodeURIComponent('تم إنشاء الحساب لكن حدث خطأ في إضافة بيانات المحل'))
    } else {
      const { notifyAdmin } = await import('@/utils/notifications')
      await notifyAdmin('طلب انضمام محل جديد 🏬', `قام ${ownerName} بتقديم طلب لضم محل "${shopName}". يرجى مراجعة لوحة الإدارة للموافقة.`)
    }
  }

  return redirect('/join-shop?message=' + encodeURIComponent('تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة وتفعيله قريباً.'))
}

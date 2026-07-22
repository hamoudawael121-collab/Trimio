'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  let phone = formData.get('phone') as string
  
  let email = '';
  if (phone.toLowerCase() === 'wael') {
    email = 'wael@trimio.com';
  } else {
    // Remove spaces or special chars to make a standard email
    phone = phone.replace(/[^0-9]/g, '')
    
    // Egyptian phone validation
    if (!/^(010|011|012|015)[0-9]{8}$/.test(phone)) {
      return redirect('/login?message=' + encodeURIComponent('رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010, 011, 012 أو 015'))
    }
    
    email = `${phone}@trimio.com`
  }

  const password = formData.get('password') as string
  const supabase = await createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=' + encodeURIComponent('خطأ في تسجيل الدخول، يرجى التأكد من البيانات'))
  }

  // Guarantee Admin Role for wael
  if (signInData.user && email === 'wael@trimio.com') {
    await supabase.from('profiles').upsert({
      id: signInData.user.id,
      full_name: 'Wael (Admin)',
      phone_number: 'wael',
      role: 'admin'
    })
  }

  return redirect('/')
}

export async function signup(formData: FormData) {
  let phone = formData.get('phone') as string
  phone = phone.replace(/[^0-9]/g, '')

  // Egyptian phone validation
  if (!/^(010|011|012|015)[0-9]{8}$/.test(phone)) {
    return redirect('/signup?message=' + encodeURIComponent('رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010, 011, 012 أو 015'))
  }

  const email = `${phone}@trimio.com`
  
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string || 'customer'
  
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect('/signup?message=' + encodeURIComponent(error.message))
  }

  // Insert profile data into our profiles table
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      phone_number: phone,
      role: role
    });
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
    } else {
      const { notifyAdmin } = await import('@/utils/notifications')
      await notifyAdmin('مستخدم جديد 🎉', `تم تسجيل مستخدم جديد باسم: ${fullName}`)
    }
  }

  return redirect('/login?message=' + encodeURIComponent('تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن بقم هاتفك'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}

export async function resetPassword(formData: FormData) {
  let phone = formData.get('phone') as string
  phone = phone.replace(/[^0-9]/g, '')

  // Egyptian phone validation
  if (!/^(010|011|012|015)[0-9]{8}$/.test(phone)) {
    return redirect('/forgot-password?error=' + encodeURIComponent('رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010, 011, 012 أو 015'))
  }

  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    return redirect('/forgot-password?error=' + encodeURIComponent('كلمات المرور غير متطابقة'))
  }

  const email = `${phone}@trimio.com`
  const supabase = await createClient()

  // Update/Register password with Supabase Auth
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: newPassword,
  })

  if (authData?.user) {
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: 'مستخدم',
      phone_number: phone,
      role: 'customer'
    })
  }

  return redirect('/login?message=' + encodeURIComponent('تم تحديث وتعيين كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن بكلمة المرور الجديدة'))
}

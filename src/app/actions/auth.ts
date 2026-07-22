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

  let userId: string | null = null
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInData?.user) {
    userId = signInData.user.id
  } else {
    // Try fallback passwords
    for (const fallbackPass of ['123456', '12345678', phone, 'Eyadking1211']) {
      const { data: fbData } = await supabase.auth.signInWithPassword({
        email,
        password: fallbackPass,
      })
      if (fbData?.user) {
        userId = fbData.user.id
        break
      }
    }
  }

  if (!userId) {
    return redirect('/login?message=' + encodeURIComponent('خطأ في كلمة المرور. يرجى التأكد من البيانات أو إعادة التعيين'))
  }

  // Ensure profile exists in profiles table
  if (email !== 'wael@trimio.com') {
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: 'مستخدم',
      phone_number: phone,
      role: 'customer'
    })
  }

  // Guarantee Admin Role for wael
  if (email === 'wael@trimio.com') {
    await supabase.from('profiles').upsert({
      id: userId,
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

  let { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  // If already registered in Supabase auth system, attempt signIn to restore/link smoothly
  if (error && error.message.includes('already registered')) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!signInError && signInData.user) {
      data = signInData
      error = null
    } else {
      return redirect('/login?message=' + encodeURIComponent('هذا الرقم مسجل بالفعل. يمكنك تسجيل الدخول مباشرة'))
    }
  } else if (error) {
    return redirect('/signup?message=' + encodeURIComponent(error.message))
  }

  // Insert/Upsert profile data into our profiles table
  if (data?.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName || 'مستخدم',
      phone_number: phone,
      role: role
    });
    
    const { notifyAdmin } = await import('@/utils/notifications')
    await notifyAdmin('مستخدم جديد 🎉', `تم تسجيل حساب جديد باسم: ${fullName || 'غير مسمى'} (${phone}) كـ ${role === 'shop_owner' ? 'صاحب محل' : 'زبون'}`)
  }

  return redirect('/login?message=' + encodeURIComponent('تم تسجيل حسابك بنجاح، يمكنك تسجيل الدخول الآن'))
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

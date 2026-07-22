import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    // 1. Delete all bookings
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. Delete all shop images & services
    await supabase.from('shop_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 3. Delete all shops
    await supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 4. Delete all notifications
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 5. Delete all profiles EXCEPT admin 'wael'
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .neq('role', 'admin')
      .neq('phone_number', 'wael')

    return NextResponse.json({
      success: true,
      message: 'تم مسح جميع الحسابات والمحلات والحجوزات التجريبية بنجاح، مع الإبقاء على حساب المدير wael فقط! 🧹'
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

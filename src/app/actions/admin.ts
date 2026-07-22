'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/utils/notifications'

async function checkAdminAccess(supabase: any) {
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return false
  
  if (authData.user.email === 'wael@trimio.com') return true

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
  return profile?.role === 'admin'
}

export async function approveShop(shopId: string) {
  const supabase = await createClient()
  if (!(await checkAdminAccess(supabase))) return { error: 'Unauthorized' }

  const { data: shop, error: fetchError } = await supabase
    .from('shops')
    .select('owner_id, name')
    .eq('id', shopId)
    .single()

  if (fetchError || !shop) return { error: 'Shop not found' }

  const { error } = await supabase
    .from('shops')
    .update({ status: 'approved' })
    .eq('id', shopId)

  if (error) {
    console.error('Error approving shop:', error)
    return { error: 'Failed to approve shop' }
  }

  // Notify Shop Owner
  await sendNotification(
    shop.owner_id, 
    'تم تفعيل محلك! 🎉', 
    `تهانينا، تم مراجعة والموافقة على محل "${shop.name}". يمكنك الآن البدء في استقبال الحجوزات وإضافة خدماتك.`
  )

  revalidatePath('/settings')
  return { success: true }
}

export async function rejectShop(shopId: string) {
  const supabase = await createClient()
  if (!(await checkAdminAccess(supabase))) return { error: 'Unauthorized' }

  // Fetch before deleting to get owner info
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id, name')
    .eq('id', shopId)
    .single()

  if (!shop) return { error: 'Shop not found' }

  // User requested complete deletion
  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', shopId)

  if (error) {
    console.error('Error rejecting/deleting shop:', error)
    return { error: 'Failed to delete shop' }
  }

  // Notify Shop Owner
  await sendNotification(
    shop.owner_id, 
    'تم رفض طلب المحل ❌', 
    `نعتذر، لم يتم قبول طلب إضافة محل "${shop.name}" بعد مراجعته من الإدارة لمخالفته الشروط.`
  )

  revalidatePath('/settings')
  return { success: true }
}

export async function deleteShop(shopId: string) {
  const supabase = await createClient()
  if (!(await checkAdminAccess(supabase))) return { error: 'Unauthorized' }

  try {
    // Cascade delete child records manually to prevent Foreign Key constraints
    await supabase.from('bookings').delete().eq('shop_id', shopId)
    await supabase.from('services').delete().eq('shop_id', shopId)
    await supabase.from('shop_images').delete().eq('shop_id', shopId)

    const { error } = await supabase.from('shops').delete().eq('id', shopId)
    if (error) {
      console.error('Error deleting shop:', error)
      return { error: 'Failed to delete shop: ' + error.message }
    }
  } catch (err: any) {
    console.error('Exception during shop deletion:', err)
  }

  revalidatePath('/settings')
  revalidatePath('/')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  if (!(await checkAdminAccess(supabase))) return { error: 'Unauthorized' }

  try {
    // 1. Delete any shops owned by this user
    const { data: userShops } = await supabase.from('shops').select('id').eq('owner_id', userId)
    if (userShops && userShops.length > 0) {
      for (const shop of userShops) {
        await supabase.from('bookings').delete().eq('shop_id', shop.id)
        await supabase.from('services').delete().eq('shop_id', shop.id)
        await supabase.from('shop_images').delete().eq('shop_id', shop.id)
        await supabase.from('shops').delete().eq('id', shop.id)
      }
    }

    // 2. Delete bookings made by this user as a customer
    await supabase.from('bookings').delete().eq('customer_id', userId)

    // 3. Delete notifications for this user
    await supabase.from('notifications').delete().eq('user_id', userId)

    // 4. Delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) {
      console.error('Error deleting user profile:', error)
      return { error: 'Failed to delete user: ' + error.message }
    }
  } catch (err: any) {
    console.error('Exception during user deletion:', err)
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function wipeAllTestUsers() {
  const supabase = await createClient()
  if (!(await checkAdminAccess(supabase))) return

  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shop_images').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shops').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('profiles').delete().neq('role', 'admin').neq('phone_number', 'wael')

  revalidatePath('/settings')
  revalidatePath('/')
}

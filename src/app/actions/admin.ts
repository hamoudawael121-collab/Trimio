'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/utils/notifications'

async function checkAdminAccess(supabase: any) {
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return false
  
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

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addService(formData: FormData) {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'Unauthorized' }

  // Get the shop_id for this owner
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', authData.user.id)
    .single()

  if (!shop) return { error: 'Shop not found' }

  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const duration = parseInt(formData.get('duration') as string)

  const { error } = await supabase.from('services').insert({
    shop_id: shop.id,
    name,
    price,
    duration_minutes: duration,
  })

  if (error) {
    console.error("Error adding service", error)
    return { error: 'Failed to add service' }
  }

  revalidatePath('/shop-dashboard')
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient()
  
  // RLS will ensure they can only delete their own service
  const { error } = await supabase.from('services').delete().eq('id', serviceId)

  if (error) {
    console.error("Error deleting service", error)
    return { error: 'Failed to delete service' }
  }

  revalidatePath('/shop-dashboard')
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()
  
  // First, fetch booking details to know who the customer is
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id, shops(name)')
    .eq('id', bookingId)
    .single()

  // RLS ensures only the shop owner can update bookings for their shop
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) {
    console.error("Error updating booking", error)
    return { error: 'Failed to update booking status' }
  }

  if (booking && booking.customer_id) {
    const { sendNotification } = await import('@/utils/notifications')
    let title = 'تحديث حالة الحجز'
    let message = `تم تحديث حالة حجزك في ${booking.shops?.name}`
    
    if (status === 'confirmed') {
      title = 'تم تأكيد الحجز ✅'
      message = `تم تأكيد حجزك في ${booking.shops?.name}. في انتظارك!`
    } else if (status === 'cancelled') {
      title = 'تم إلغاء الحجز ❌'
      message = `نعتذر، تم إلغاء حجزك في ${booking.shops?.name}.`
    } else if (status === 'completed') {
      title = 'نعيماً! ✂️'
      message = `نأمل أن تكون قد استمتعت بخدمتك في ${booking.shops?.name}. لا تنسَ التقييم!`
    }
    
    await sendNotification(booking.customer_id, title, message)
  }

  revalidatePath('/shop-dashboard')
}

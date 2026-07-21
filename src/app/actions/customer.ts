'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/utils/notifications'

export async function getAvailableSlots(shopId: string, serviceId: string, dateStr: string) {
  const supabase = await createClient()

  // 1. Get the requested service duration
  const { data: requestedService } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!requestedService) return { error: 'Service not found' }
  const durationMinutes = requestedService.duration_minutes

  // 2. Get all bookings for this shop on the selected date (pending or confirmed)
  // We need the start time and the duration of each booking to calculate overlap
  const startOfDay = new Date(dateStr)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(dateStr)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('booking_time, services(duration_minutes)')
    .eq('shop_id', shopId)
    .in('status', ['pending', 'confirmed'])
    .gte('booking_time', startOfDay.toISOString())
    .lte('booking_time', endOfDay.toISOString())

  // 3. Generate all possible slots (e.g. 10 AM to 10 PM in 30 min increments)
  const availableSlots: string[] = []
  
  // Create base date for slot generation
  const baseDate = new Date(dateStr)
  
  // Working hours: 10:00 to 22:00
  const openHour = 10
  const closeHour = 22

  for (let h = openHour; h < closeHour; h++) {
    for (let m of [0, 30]) {
      const slotStart = new Date(baseDate)
      slotStart.setHours(h, m, 0, 0)
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)
      
      // If the slot ends after closing time, skip it
      if (slotEnd.getHours() > closeHour || (slotEnd.getHours() === closeHour && slotEnd.getMinutes() > 0)) {
        continue
      }
      
      // Check if this slot is in the past (if today)
      if (slotStart < new Date()) {
        continue
      }

      // Check for overlap with any existing booking
      let isOverlapping = false
      if (existingBookings) {
        for (const b of existingBookings) {
          const bStart = new Date(b.booking_time)
          const bDuration = b.services?.duration_minutes || 30 // default 30 if missing
          const bEnd = new Date(bStart.getTime() + bDuration * 60000)

          // Overlap condition: StartA < EndB AND EndA > StartB
          if (slotStart < bEnd && slotEnd > bStart) {
            isOverlapping = true
            break
          }
        }
      }

      if (!isOverlapping) {
        // Format as HH:MM
        const hh = h.toString().padStart(2, '0')
        const mm = m.toString().padStart(2, '0')
        availableSlots.push(`${hh}:${mm}`)
      }
    }
  }

  return { slots: availableSlots }
}

export async function createBooking(shopId: string, serviceId: string, dateStr: string, timeStr: string) {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'Unauthorized' }

  // Combine date and time into a single Date object
  const bookingTime = new Date(`${dateStr}T${timeStr}:00`)

  const { data: booking, error } = await supabase.from('bookings').insert({
    customer_id: authData.user.id,
    shop_id: shopId,
    service_id: serviceId,
    booking_time: bookingTime.toISOString(),
    status: 'pending' // default status
  }).select('id, shops(owner_id, name), services(name), profiles(full_name)').single()

  if (error) {
    console.error("Booking error:", error)
    return { error: 'Failed to create booking' }
  }

  // Send Notification to Shop Owner
  if (booking && booking.shops?.owner_id) {
    const customerName = booking.profiles?.full_name || 'زبون جديد'
    const serviceName = booking.services?.name || 'خدمة'
    const formattedTime = bookingTime.toLocaleString('ar-EG')
    
    await sendNotification(
      booking.shops.owner_id,
      'طلب حجز جديد! 📅',
      `يرغب ${customerName} في حجز ${serviceName} في الوقت: ${formattedTime}. يرجى مراجعة الحجز لتأكيده.`
    )
  }

  revalidatePath('/my-bookings')
  revalidatePath('/shop-dashboard')
  
  return { success: true }
}

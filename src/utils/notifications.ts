import { createClient } from '@/utils/supabase/server'

export async function sendNotification(userId: string, title: string, message: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message
  })

  if (error) {
    console.error('Error sending notification:', error)
  }
}

export async function notifyAdmin(title: string, message: string) {
  const supabase = await createClient()
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
  
  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await sendNotification(admin.id, title, message)
    }
  }
}

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // create user
  const { data, error } = await supabase.auth.signUp({
    email: 'wael@trimio.com',
    password: 'Eyadking1211',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: 'Wael (Admin)',
      phone_number: 'wael',
      role: 'admin'
    })
  }

  return NextResponse.json({ message: 'Admin wael seeded successfully' })
}

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { userId, email, fullName, schoolName, city } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({ name: schoolName, admin_email: email, city })
      .select()
      .single()

    if (schoolError) {
      return NextResponse.json({ error: schoolError.message }, { status: 500 })
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, full_name: fullName, school_id: school.id })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}

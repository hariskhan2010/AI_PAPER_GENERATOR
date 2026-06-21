'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      const supabase = createClient()
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.location.replace('/dashboard')
      })
    } else {
      window.location.replace('/login')
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent" />
    </div>
  )
}

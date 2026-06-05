'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.replace('/')
      })
    } else {
      router.replace('/')
    }
  }, [router])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f0f13', color: '#9090a8',
      fontFamily: 'DM Sans, sans-serif', fontSize: 13,
      flexDirection: 'column', gap: 12
    }}>
      <div style={{ fontSize: 28 }}>💳</div>
      <div>Signing you in…</div>
    </div>
  )
}

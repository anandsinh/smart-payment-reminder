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

    supabase.auth.exchangeCodeForSession(window.location.href).then(() => {
      router.push('/')
    }).catch(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) router.push('/')
        else router.push('/?error=auth_failed')
      })
    })
  }, [router])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f0f13', color: '#9090a8',
      fontFamily: 'DM Sans, sans-serif', fontSize: 13, flexDirection: 'column', gap: 12
    }}>
      <div style={{ fontSize: 28 }}>💳</div>
      <div>Signing you in…</div>
    </div>
  )
}

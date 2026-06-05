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
    const hash = new URLSearchParams(window.location.hash.substring(1))
    const search = new URLSearchParams(window.location.search)
    const code = search.get('code')
    const token = hash.get('access_token')

    if (token) {
      router.replace('/')
    } else if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .finally(() => router.replace('/'))
    } else {
      router.replace('/')
    }
  }, [router])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f0f13', color:'#9090a8',
      fontFamily:'sans-serif', fontSize:13, flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:28 }}>💳</div>
      <div>Signing you in…</div>
    </div>
  )
}

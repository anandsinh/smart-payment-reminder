'use client'
import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).finally(() => {
        window.location.href = '/'
      })
    } else {
      window.location.href = '/'
    }
  }, [])

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f0f13', color:'#9090a8',
      fontFamily:'sans-serif', fontSize:14, flexDirection:'column', gap:12
    }}>
      <div style={{ fontSize:28 }}>💳</div>
      <div>Signing you in…</div>
    </div>
  )
}

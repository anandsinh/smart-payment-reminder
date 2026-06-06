'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    // Session is handled by detectSessionInUrl in supabase client
    // Just go home and let App.js pick up the session
    router.replace('/')
  }, [router])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f0f13', color:'#9090a8', fontFamily:'sans-serif' }}>
      Signing you in…
    </div>
  )
}

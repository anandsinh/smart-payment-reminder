'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const timer = setTimeout(() => router.replace('/'), 1500)
    return () => clearTimeout(timer)
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

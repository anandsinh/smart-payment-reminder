'use client'
import { useEffect } from 'react'

export default function AuthCallback() {
  useEffect(() => {
    window.location.href = `/api/auth/callback${window.location.search}`
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f0f13', color:'#9090a8',
      fontFamily:'sans-serif', fontSize:14, flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:28 }}>💳</div>
      <div>Signing you in…</div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import LoginPage from './LoginPage'
import AppShell from './AppShell'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f0f13', color:'#9090a8', fontFamily:'sans-serif', fontSize:13 }}>
      Loading…
    </div>
  )

  if (!user) return <LoginPage supabase={supabase} />
  return <AppShell user={user} supabase={supabase} />
}

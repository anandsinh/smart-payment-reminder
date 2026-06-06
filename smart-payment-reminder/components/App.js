'use client'
import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase'
import LoginPage from './LoginPage'
import AppShell from './AppShell'

export default function App() {
  const [user, setUser] = useState(undefined)
  const supabase = getSupabase()

  useEffect(() => {
    // detectSessionInUrl:true means supabase auto-handles the OAuth callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f0f13', color:'#9090a8',
      fontFamily:'sans-serif', fontSize:14 }}>
      Loading…
    </div>
  )

  if (!user) return <LoginPage supabase={supabase} />
  return <AppShell user={user} supabase={supabase} />
}

'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import LoginPage from '../components/LoginPage'
import AppShell from '../components/AppShell'

export default function Home() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text3)', fontFamily: 'var(--font)', fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  if (!user) return <LoginPage />
  return <AppShell user={user} />
}

'use client'
import { useState } from 'react'

export default function Settings({ user, toast, supabase }) {
  const [notifEnabled, setNotifEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  )

  async function toggleNotif(on) {
    if (on && 'Notification' in window) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        setNotifEnabled(true)
        toast('Notifications enabled', 'You will receive browser reminders', 'green')
      } else {
        setNotifEnabled(false)
        toast('Permission denied', 'Enable notifications in browser settings', 'amber')
      }
    } else {
      setNotifEnabled(false)
    }
  }

  async function exportData() {
    const { data: billers } = await supabase.from('billers').select('*')
    const { data: cycles } = await supabase.from('payment_cycles').select('*')
    const blob = new Blob([JSON.stringify({ billers, cycles }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'payremind_export.json'
    a.click()
    toast('Exported', 'payremind_export.json downloaded', 'green')
  }

  return (
    <>
      <div className="section-header">
        <div className="section-title">Settings</div>
      </div>

      {/* Account */}
      <div className="settings-card">
        <div className="settings-card-title">Account</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Signed in as</div>
            <div className="settings-sub">{user.email}</div>
          </div>
          <img src={user.user_metadata?.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="settings-card-title">Notifications</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Browser push notifications</div>
            <div className="settings-sub">Receive reminders when a payment is due</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={notifEnabled} onChange={e => toggleNotif(e.target.checked)} />
            <div className="toggle-track" />
            <div className="toggle-thumb" />
          </label>
        </div>
      </div>

      {/* Data */}
      <div className="settings-card">
        <div className="settings-card-title">Data</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Export all data</div>
            <div className="settings-sub">Download billers and payment history as JSON</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={exportData}>↓ Export</button>
        </div>
      </div>

      {/* Cost info */}
      <div className="settings-card">
        <div className="settings-card-title">Deployment cost breakdown</div>
        {[
          ['Frontend hosting (Vercel)', '$0 / mo'],
          ['Database (Supabase free tier)', '$0 / mo'],
          ['Auth (Supabase Google OAuth)', '$0 / mo'],
          ['Browser push notifications', '$0 / mo'],
          ['Total monthly cost', '$0 / mo'],
        ].map(([label, val], i) => (
          <div key={i} className="settings-row" style={i === 4 ? { borderTop: '2px solid var(--border)' } : {}}>
            <div className="settings-label" style={i === 4 ? { fontWeight: 700 } : {}}>{label}</div>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: i === 4 ? 700 : 400 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Notification strategy */}
      <div className="settings-card">
        <div className="settings-card-title">Notification strategy</div>
        {[
          { label: '✅ Browser Push (active)', sub: 'Free. Works on desktop & mobile. Needs HTTPS + user permission. Zero server required.', color: 'var(--green)' },
          { label: '📱 Mobile Push (FCM)', sub: '~$0–5/mo. Reliable on mobile. Needs PWA or native app wrapper. Slightly more complex.', color: 'var(--text2)' },
          { label: '📧 Email (Resend / Brevo)', sub: '~$0–10/mo. Reliable fallback. Free tier: 100 emails/day. Requires backend scheduler.', color: 'var(--text2)' },
        ].map((item, i) => (
          <div key={i} className="settings-row">
            <div>
              <div className="settings-label" style={{ color: item.color }}>{item.label}</div>
              <div className="settings-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

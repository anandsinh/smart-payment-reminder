'use client'
import { useEffect, useState } from 'react'

function monthLabel(ym) {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function History({ supabase, user, billers }) {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('payment_cycles')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => { setCycles(data || []); setLoading(false) })
  }, [supabase, user.id])

  if (loading) return <div className="empty"><div className="empty-icon">⏳</div><div className="empty-title">Loading history…</div></div>

  // Group by year_month
  const byMonth = {}
  cycles.forEach(c => {
    if (!byMonth[c.year_month]) byMonth[c.year_month] = []
    byMonth[c.year_month].push(c)
  })

  const months = Object.keys(byMonth).sort().reverse()
  const active = billers.filter(b => b.active)

  if (months.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🗂</div>
        <div className="empty-title">No history yet</div>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Mark payments as paid to build your history</p>
      </div>
    )
  }

  return (
    <>
      <div className="section-header">
        <div className="section-title">Payment history ({months.length} months)</div>
      </div>

      {months.map(ym => {
        const monthCycles = byMonth[ym]
        const paidCount = monthCycles.filter(c => c.paid).length
        const total = active.length || monthCycles.length
        const pct = total > 0 ? Math.round((paidCount / total) * 100) : 0
        const color = pct === 100 ? 'var(--green)' : pct > 50 ? 'var(--amber)' : 'var(--red)'
        const isCurrentMonth = ym === `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
        const paidBillers = billers.filter(b => monthCycles.find(c => c.biller_id === b.id && c.paid))

        return (
          <div key={ym} className="history-item" style={isCurrentMonth ? { borderColor: 'var(--accent)' } : {}}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {monthLabel(ym)}
                {isCurrentMonth && <span style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 400, marginLeft: 8 }}>current</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {paidCount}/{total} paid · {pct}% complete
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
              {paidBillers.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {paidBillers.map(b => (
                    <span key={b.id} className="badge badge-paid" style={{ fontSize: 10 }}>{b.name}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: pct === 100 ? 'var(--green)' : 'var(--text)' }}>
                {pct}%
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../lib/supabase'
import { currentYearMonth, getBillerStatus, getBillersToRemind } from '../lib/scheduler'
import Dashboard from './Dashboard'
import Billers from './Billers'
import History from './History'
import Settings from './Settings'
import BillerModal from './BillerModal'
import Toast from './Toast'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'billers',   label: 'Billers',   icon: '📋' },
  { id: 'history',   label: 'History',   icon: '🗂'  },
  { id: 'settings',  label: 'Settings',  icon: '⚙️'  },
]

function monthLabel(ym) {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function AppShell({ user }) {
  const supabase = createClient()
  const [page, setPage] = useState('dashboard')
  const [billers, setBillers] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalBiller, setModalBiller] = useState(undefined) // undefined=closed, null=new, obj=edit
  const [toasts, setToasts] = useState([])
  const ym = currentYearMonth()

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchBillers = useCallback(async () => {
    const { data } = await supabase
      .from('billers')
      .select('*')
      .order('reminder_day', { ascending: true })
    setBillers(data || [])
  }, [supabase])

  const fetchCycles = useCallback(async () => {
    const { data } = await supabase
      .from('payment_cycles')
      .select('*')
      .eq('year_month', ym)
    setCycles(data || [])
  }, [supabase, ym])

  useEffect(() => {
    Promise.all([fetchBillers(), fetchCycles()]).then(() => setLoading(false))
  }, [fetchBillers, fetchCycles])

  // ── Scheduler: ensure cycles exist for this month ──────────────────────────
  useEffect(() => {
    if (!billers.length) return
    billers.forEach(async (b) => {
      const exists = cycles.find(c => c.biller_id === b.id)
      if (!exists) {
        await supabase.from('payment_cycles').upsert({
          biller_id: b.id,
          user_id: user.id,
          year_month: ym,
          paid: false,
        }, { onConflict: 'biller_id,year_month' })
      }
    })
  }, [billers, cycles, ym, supabase, user.id])

  // ── Reminder check ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!billers.length) return
    const toRemind = getBillersToRemind(billers, cycles)
    if (toRemind.length && 'Notification' in window && Notification.permission === 'granted') {
      toRemind.forEach(({ biller }) => {
        new Notification(`💳 Payment due: ${biller.name}`, {
          body: `Tap to open Smart Payment Reminder.`,
        })
      })
    }
  }, [billers, cycles])

  // ── Toast helper ──────────────────────────────────────────────────────────
  function toast(title, sub, type = 'green') {
    const id = Date.now()
    setToasts(t => [...t, { id, title, sub, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  // ── Mark paid / unpaid ────────────────────────────────────────────────────
  async function markPaid(billerId) {
    await supabase.from('payment_cycles').upsert({
      biller_id: billerId,
      user_id: user.id,
      year_month: ym,
      paid: true,
      paid_at: new Date().toISOString(),
    }, { onConflict: 'biller_id,year_month' })
    const biller = billers.find(b => b.id === billerId)
    await fetchCycles()
    toast(`${biller?.name} marked as paid ✓`, monthLabel(ym))
  }

  async function markUnpaid(billerId) {
    await supabase.from('payment_cycles')
      .update({ paid: false, paid_at: null })
      .eq('biller_id', billerId).eq('year_month', ym)
    await fetchCycles()
    toast('Payment undone', 'Marked as unpaid', 'amber')
  }

  // ── Save biller ───────────────────────────────────────────────────────────
  async function saveBiller(data) {
    if (data.id) {
      await supabase.from('billers').update({
        name: data.name, category: data.category, notes: data.notes,
        reminder_day: data.reminder_day, due_date: data.due_date, active: data.active,
      }).eq('id', data.id)
      toast('Biller updated', data.name)
    } else {
      const { data: nb } = await supabase.from('billers').insert({
        user_id: user.id, name: data.name, category: data.category,
        notes: data.notes, reminder_day: data.reminder_day,
        due_date: data.due_date, active: data.active,
      }).select().single()
      if (nb) {
        await supabase.from('payment_cycles').insert({
          biller_id: nb.id, user_id: user.id, year_month: ym, paid: false,
        })
      }
      toast('Biller added', data.name)
    }
    setModalBiller(undefined)
    await Promise.all([fetchBillers(), fetchCycles()])
  }

  async function deleteBiller(id) {
    await supabase.from('billers').delete().eq('id', id)
    setModalBiller(undefined)
    await Promise.all([fetchBillers(), fetchCycles()])
    toast('Biller deleted', '', 'amber')
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const active = billers.filter(b => b.active)
  const paid = active.filter(b => cycles.find(c => c.biller_id === b.id)?.paid).length
  const overdue = active.filter(b => getBillerStatus(b, cycles.find(c => c.biller_id === b.id)) === 'overdue').length
  const pending = active.length - paid - overdue

  const pageProps = { billers, cycles, ym, onMarkPaid: markPaid, onMarkUnpaid: markUnpaid, onAddBiller: () => setModalBiller(null), onEditBiller: (b) => setModalBiller(b), stats: { total: active.length, paid, pending, overdue }, user, toast }

  return (
    <div className="app">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">💳</div>
          <div className="logo-text">PayRemind</div>
          <div className="logo-sub">Smart bill tracker</div>
        </div>

        <div className="nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'dashboard' && overdue > 0 && <span className="nav-badge">{overdue}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="month-chip">
            <div className="label">Current cycle</div>
            <div className="value">{monthLabel(ym)}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={signOut}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-info">
            <div className="title">
              {NAV.find(n => n.id === page)?.label}
            </div>
            <div className="sub">
              {page === 'dashboard' && `${monthLabel(ym)} · ${paid} of ${active.length} paid`}
              {page === 'billers' && `${billers.length} billers configured`}
              {page === 'history' && 'Monthly payment records'}
              {page === 'settings' && user.email}
            </div>
          </div>
          {page !== 'settings' && (
            <button className="btn btn-primary btn-sm" onClick={() => setModalBiller(null)}>
              + Add biller
            </button>
          )}
        </div>

        <div className="content">
          {loading ? (
            <div className="empty"><div className="empty-icon">⏳</div><div className="empty-title">Loading your billers…</div></div>
          ) : (
            <>
              {page === 'dashboard' && <Dashboard {...pageProps} />}
              {page === 'billers'   && <Billers   {...pageProps} />}
              {page === 'history'   && <History   supabase={createClient()} user={user} billers={billers} />}
              {page === 'settings'  && <Settings  user={user} toast={toast} supabase={createClient()} />}
            </>
          )}
        </div>
      </div>

      {/* Biller modal */}
      {modalBiller !== undefined && (
        <BillerModal
          biller={modalBiller}
          onSave={saveBiller}
          onDelete={deleteBiller}
          onClose={() => setModalBiller(undefined)}
        />
      )}

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => <Toast key={t.id} {...t} />)}
      </div>
    </div>
  )
}

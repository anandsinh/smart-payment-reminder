/**
 * Smart Payment Reminder — Scheduler Logic
 *
 * Algorithm:
 *   IF today == biller.reminder_day  → send reminder
 *   IF not paid AND today > reminder_day AND (today - reminder_day) % interval == 0 → send reminder
 *   IF paid → stop
 *   On 1st of month → reset all cycles
 */

/**
 * Returns billers that should be reminded today
 * @param {Array} billers
 * @param {Array} cycles  - payment_cycles for current month
 * @param {number} interval - days between repeat reminders (default 3)
 * @returns {Array} billers to remind
 */
export function getBillersToRemind(billers, cycles, interval = 3) {
  const today = new Date().getDate()
  const toRemind = []

  for (const biller of billers) {
    if (!biller.active) continue

    const cycle = cycles.find(c => c.biller_id === biller.id)
    if (cycle?.paid) continue // already paid this month

    const diff = today - biller.reminder_day

    // First reminder: exactly on reminder day
    if (diff === 0) {
      toRemind.push({ biller, reason: 'due_today' })
      continue
    }

    // Repeat reminders: every N days after reminder day
    if (diff > 0 && diff % interval === 0) {
      toRemind.push({ biller, reason: `overdue_${diff}d` })
    }
  }

  return toRemind
}

/**
 * Returns the status of a biller for a given month
 * @param {Object} biller
 * @param {Object|null} cycle
 * @returns {'paid'|'overdue'|'pending'|'upcoming'}
 */
export function getBillerStatus(biller, cycle) {
  if (cycle?.paid) return 'paid'
  const today = new Date().getDate()
  if (today > biller.reminder_day) return 'overdue'
  if (today === biller.reminder_day) return 'due_today'
  return 'pending'
}

/**
 * Returns current year-month string e.g. "2025-06"
 */
export function currentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Returns days until reminder day (negative = overdue)
 */
export function daysUntilReminder(reminderDay) {
  return reminderDay - new Date().getDate()
}

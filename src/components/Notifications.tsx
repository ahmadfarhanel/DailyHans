import { useState } from 'react'
import type { BillAlert } from '../lib/notifications'
import { Badge } from './ui'

type Props = { alerts: BillAlert[] }

export default function Notifications({ alerts }: Props) {
  const [open, setOpen] = useState(false)

  if (alerts.length === 0) return null

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-cream border border-forest/10 text-base transition hover:border-forest/20">
        🔔
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {alerts.length}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-forest/10 bg-white shadow-2xl shadow-forest/10 overflow-hidden">
            <div className="border-b border-forest/10 px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50">
              <p className="text-sm font-semibold text-forest">Notifikasi Tagihan</p>
              <p className="text-xs text-forest/60">{alerts.length} perlu perhatian</p>
            </div>
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {alerts.map((a, i) => (
                <div key={i}
                  className={`rounded-lg px-3 py-2.5 text-sm ${a.type === 'overdue' ? 'bg-red-50' : a.type === 'due_today' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                  <div className="flex items-start gap-2">
                    <span>{a.type === 'overdue' ? '🚨' : a.type === 'due_today' ? '⏰' : '📌'}</span>
                    <div>
                      <p className={`font-medium ${a.type === 'overdue' ? 'text-red-600' : a.type === 'due_today' ? 'text-amber-700' : 'text-sky-700'}`}>{a.message}</p>
                      <Badge variant={a.type === 'overdue' ? 'danger' : a.type === 'due_today' ? 'warning' : 'info'}>
                        {a.type === 'overdue' ? 'Terlambat' : a.type === 'due_today' ? 'Hari Ini' : `${a.bill.due_date}`}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function AlertBanner({ alerts }: Props) {
  if (alerts.length === 0) return null
  const overdue = alerts.filter(a => a.type === 'overdue')
  const dueToday = alerts.filter(a => a.type === 'due_today')

  return (
    <div className="mb-6 space-y-2">
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 animate-pulse">
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">{overdue.length} tagihan terlambat!</p>
            <p className="text-xs text-red-400">{overdue.map(a => a.bill.name).join(', ')}</p>
          </div>
        </div>
      )}
      {dueToday.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <span className="text-xl">⏰</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">{dueToday.length} tagihan jatuh tempo hari ini</p>
            <p className="text-xs text-amber-500">{dueToday.map(a => a.bill.name).join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

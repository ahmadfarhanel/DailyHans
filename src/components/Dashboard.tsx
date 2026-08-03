import { useEffect, useState } from 'react'
import { getExpenses, getChores, getShopping, getBills } from '../lib/db'
import type { Expense, Chore, ShoppingItem, Bill } from '../lib/db'
import { Card } from './ui'

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

type Props = { onNavigate: (tab: string) => void }

export default function Dashboard({ onNavigate }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  useEffect(() => {
    getExpenses().then(setExpenses)
    getChores().then(setChores)
    getShopping().then(setShopping)
    getBills().then(setBills)
  }, [])

  const expenseTotal = expenses.reduce((s, i) => s + i.amount, 0)
  const choresDone = chores.filter(i => i.done).length
  const shoppingBought = shopping.filter(i => i.bought).length
  const unpaidBills = bills.filter(i => !i.paid)
  const overdueBills = unpaidBills.filter(i => new Date(i.due_date) < new Date())
  const unpaidTotal = unpaidBills.reduce((s, i) => s + i.amount, 0)

  const stats = [
    { label: 'Pengeluaran Bulan Ini', value: fmt(expenseTotal), icon: '💰', color: 'from-gold/20 to-gold/10', textColor: 'text-amber-700', action: 'expenses' },
    { label: 'Tugas Selesai', value: `${choresDone}/${chores.length}`, icon: '✅', color: 'from-forest/15 to-forest/5', textColor: 'text-forest', action: 'chores' },
    { label: 'Belanja Dibeli', value: `${shoppingBought}/${shopping.length}`, icon: '🛒', color: 'from-sky-100 to-sky-50', textColor: 'text-sky-600', action: 'shopping' },
    { label: 'Tagihan Tertunda', value: fmt(unpaidTotal), icon: '📋', color: 'from-red-100 to-red-50', textColor: 'text-red-500', action: 'bills', badge: overdueBills.length > 0 ? `${overdueBills.length} terlambat` : undefined },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-forest to-forest-light p-6 text-cream shadow-lg shadow-forest/20">
        <h1 className="text-2xl font-bold">Selamat Datang! 👋</h1>
        <p className="mt-1 text-sm text-cream/80">Pantau keuangan dan tugas rumah tangga dengan mudah.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => onNavigate(s.action)}
            className={`rounded-2xl bg-gradient-to-br ${s.color} border border-forest/5 p-4 text-left transition hover:shadow-md hover:scale-[1.02]`}>
            <div className="flex items-start justify-between">
              <span className="text-2xl">{s.icon}</span>
              {s.badge && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">{s.badge}</span>
              )}
            </div>
            <p className={`mt-2 text-xl font-bold ${s.textColor}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-forest/50">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Aksi Cepat" icon="⚡">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Tambah Pengeluaran', icon: '💰', tab: 'expenses' },
            { label: 'Tambah Tugas', icon: '✅', tab: 'chores' },
            { label: 'Tambah Belanja', icon: '🛒', tab: 'shopping' },
            { label: 'Tambah Tagihan', icon: '📋', tab: 'bills' },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.tab)}
              className="flex items-center gap-2 rounded-xl border border-forest/10 bg-cream px-4 py-3 text-sm font-medium text-forest transition hover:border-forest/20 hover:bg-cream-dark">
              <span className="text-base">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Aktivitas Terbaru" icon="🕐">
        <div className="space-y-3">
          {expenses.slice(0, 3).map(e => (
            <div key={e.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">💰</span>
                <span className="text-forest">{e.description || e.category}</span>
              </div>
              <span className="font-medium text-forest">{fmt(e.amount)}</span>
            </div>
          ))}
          {chores.filter(i => i.done).slice(0, 2).map(c => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">✅</span>
                <span className="text-forest/60 line-through">{c.title}</span>
              </div>
              <span className="text-xs text-forest/40">selesai</span>
            </div>
          ))}
          {expenses.length === 0 && chores.length === 0 && (
            <p className="py-4 text-center text-sm text-forest/40">Belum ada aktivitas</p>
          )}
        </div>
      </Card>

      {/* Tips */}
      <div className="rounded-2xl bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Tips Keuangan</p>
            <p className="mt-1 text-xs text-forest/60">Alokasikan minimal 20% penghasilan untuk tabungan dan dana darurat.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { getExpenses, getChores, getShopping, getBills, getPlans } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { Expense, Chore, ShoppingItem, Bill, Plan } from '../lib/db'
import { Card } from './ui'

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

type Props = { onNavigate: (tab: string) => void }

export default function Dashboard({ onNavigate }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [income, setIncome] = useState<any[]>([])

  useEffect(() => {
    getExpenses().then(setExpenses)
    getChores().then(setChores)
    getShopping().then(setShopping)
    getBills().then(setBills)
    getPlans().then(setPlans)
    supabase.from('income').select('*').then(({ data }) => setIncome(data || []))
  }, [])

  const expenseTotal = expenses.reduce((s, i) => s + i.amount, 0)
  const incomeTotal = income.reduce((s, i) => s + i.amount, 0)
  const billUnpaid = bills.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)
  const sisa = incomeTotal - expenseTotal - billUnpaid
  const choresDone = chores.filter(i => i.done).length
  const shoppingBought = shopping.filter(i => i.bought).length
  const upcomingPlans = plans.filter(i => i.status === 'rencana').length

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-forest to-forest-light p-6 text-cream shadow-lg shadow-forest/20 overflow-hidden">
        <h1 className="text-xl font-bold truncate">Selamat Datang! 👋</h1>
        <p className="mt-1 text-xs text-cream/80 break-words">Pantau keuangan dan tugas rumah tangga dengan mudah.</p>
      </div>

      {/* Ringkasan Keuangan */}
      <Card title="Ringkasan Keuangan" icon="📊">
        <div className="grid grid-cols-2 gap-3">
          {/* Pemasukan */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">📈</span>
              <span className="text-[10px] font-medium text-emerald-700 truncate">Pemasukan</span>
            </div>
            <p className="mt-2 font-bold text-emerald-600 break-words leading-tight" style={{ fontSize: 'clamp(10px, 3.5vw, 17px)' }}>{fmt(incomeTotal)}</p>
          </div>
          {/* Pengeluaran */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">💸</span>
              <span className="text-[10px] font-medium text-red-600 truncate">Pengeluaran</span>
            </div>
            <p className="mt-2 font-bold text-red-500 break-words leading-tight" style={{ fontSize: 'clamp(10px, 3.5vw, 17px)' }}>{fmt(expenseTotal)}</p>
          </div>
          {/* Tagihan Tertunda */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">📋</span>
              <span className="text-[10px] font-medium text-amber-700 truncate">Tagihan</span>
            </div>
            <p className="mt-2 font-bold text-amber-600 break-words leading-tight" style={{ fontSize: 'clamp(10px, 3.5vw, 17px)' }}>{fmt(billUnpaid)}</p>
          </div>
          {/* Sisa / Saldo */}
          <div className={`rounded-xl border p-3 overflow-hidden ${sisa >= 0 ? 'bg-forest/5 border-forest/20' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">💰</span>
              <span className={`text-[10px] font-medium truncate ${sisa >= 0 ? 'text-forest' : 'text-red-600'}`}>Sisa Saldo</span>
            </div>
            <p className={`mt-2 font-bold break-words leading-tight ${sisa >= 0 ? 'text-forest' : 'text-red-500'}`} style={{ fontSize: 'clamp(10px, 3.5vw, 17px)' }}>{fmt(sisa)}</p>
          </div>
        </div>
        {/* Progress bar */}
        {incomeTotal > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-forest/40 mb-1">
              <span className="truncate">Keluar: {Math.round(expenseTotal / incomeTotal * 100)}%</span>
              <span className="truncate">Tagihan: {Math.round(billUnpaid / incomeTotal * 100)}%</span>
              <span className="truncate">Sisa: {Math.round(sisa / incomeTotal * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-cream overflow-hidden flex">
              <div className="bg-red-400" style={{ width: `${Math.round(expenseTotal / incomeTotal * 100)}%` }} />
              <div className="bg-amber-400" style={{ width: `${Math.round(billUnpaid / incomeTotal * 100)}%` }} />
              <div className="bg-emerald-500" style={{ width: `${Math.max(0, Math.round(sisa / incomeTotal * 100))}%` }} />
            </div>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => onNavigate('chores')}
          className="rounded-2xl bg-gradient-to-br from-forest/15 to-forest/5 border border-forest/5 p-3.5 text-left transition hover:shadow-md hover:scale-[1.02] overflow-hidden">
          <span className="text-xl">✅</span>
          <p className="mt-1.5 text-lg font-bold text-forest truncate">{choresDone}/{chores.length}</p>
          <p className="text-[10px] text-forest/50 truncate">Tugas Selesai</p>
        </button>
        <button onClick={() => onNavigate('shopping')}
          className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 border border-forest/5 p-3.5 text-left transition hover:shadow-md hover:scale-[1.02] overflow-hidden">
          <span className="text-xl">🛒</span>
          <p className="mt-1.5 text-lg font-bold text-sky-600 truncate">{shoppingBought}/{shopping.length}</p>
          <p className="text-[10px] text-forest/50 truncate">Belanja Dibeli</p>
        </button>
        <button onClick={() => onNavigate('plans')}
          className="rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-forest/5 p-3.5 text-left transition hover:shadow-md hover:scale-[1.02] overflow-hidden">
          <span className="text-xl">🗺️</span>
          <p className="mt-1.5 text-lg font-bold text-indigo-600 truncate">{upcomingPlans}</p>
          <p className="text-[10px] text-forest/50 truncate">Rencana Acara</p>
        </button>
      </div>

      {/* Quick Actions */}
      <Card title="Aksi Cepat" icon="⚡">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Tambah Pengeluaran', icon: '💸', tab: 'expenses' },
            { label: 'Tambah Pemasukan', icon: '📈', tab: 'income' },
            { label: 'Tambah Tugas', icon: '✅', tab: 'chores' },
            { label: 'Tambah Belanja', icon: '🛒', tab: 'shopping' },
            { label: 'Tambah Tagihan', icon: '📋', tab: 'bills' },
            { label: 'Tambah Rencana', icon: '🗺️', tab: 'plans' },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.tab)}
              className="flex items-center gap-2 rounded-xl border border-forest/10 bg-cream px-3 py-3 text-xs font-medium text-forest transition hover:border-forest/20 hover:bg-cream-dark overflow-hidden">
              <span className="text-base shrink-0">{a.icon}</span>
              <span className="truncate">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Aktivitas Terbaru" icon="🕐">
        <div className="space-y-3">
          {expenses.slice(0, 3).map(e => (
            <div key={e.id} className="flex items-center justify-between text-sm gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base shrink-0">💸</span>
                <span className="text-forest truncate">{e.description || e.category}</span>
              </div>
              <span className="font-medium text-forest shrink-0 text-xs">{fmt(e.amount)}</span>
            </div>
          ))}
          {income.slice(0, 2).map((inc: any) => (
            <div key={inc.id} className="flex items-center justify-between text-sm gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base shrink-0">📈</span>
                <span className="text-forest truncate">{inc.description || inc.source}</span>
              </div>
              <span className="font-medium text-emerald-600 shrink-0 text-xs">+{fmt(inc.amount)}</span>
            </div>
          ))}
          {chores.filter(i => i.done).slice(0, 2).map(c => (
            <div key={c.id} className="flex items-center justify-between text-sm gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-base shrink-0">✅</span>
                <span className="text-forest/60 line-through truncate">{c.title}</span>
              </div>
              <span className="text-xs text-forest/40 shrink-0">selesai</span>
            </div>
          ))}
          {expenses.length === 0 && income.length === 0 && chores.length === 0 && (
            <p className="py-4 text-center text-sm text-forest/40">Belum ada aktivitas</p>
          )}
        </div>
      </Card>

      {/* Tips */}
      <div className="rounded-2xl bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/20 p-4 overflow-hidden">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-800 truncate">Tips Keuangan</p>
            <p className="mt-1 text-xs text-forest/60 break-words">Alokasikan minimal 20% penghasilan untuk tabungan dan dana darurat.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getExpenses, getChores, getShopping, getBills } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { Expense, Chore, ShoppingItem, Bill } from '../lib/db'
import { Card } from './ui'

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

type Props = { onNavigate: (tab: string) => void }

export default function Dashboard({ onNavigate }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [income, setIncome] = useState<any[]>([])

  useEffect(() => {
    getExpenses().then(setExpenses)
    getChores().then(setChores)
    getShopping().then(setShopping)
    getBills().then(setBills)
    supabase.from('income').select('*').then(({ data }) => setIncome(data || []))
  }, [])

  const expenseTotal = expenses.reduce((s, i) => s + i.amount, 0)
  const incomeTotal = income.reduce((s, i) => s + i.amount, 0)
  const billUnpaid = bills.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)
  const sisa = incomeTotal - expenseTotal - billUnpaid
  const choresDone = chores.filter(i => i.done).length
  const shoppingBought = shopping.filter(i => i.bought).length

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-forest to-forest-light p-6 text-cream shadow-lg shadow-forest/20">
        <h1 className="text-2xl font-bold">Selamat Datang! 👋</h1>
        <p className="mt-1 text-sm text-cream/80">Pantau keuangan dan tugas rumah tangga dengan mudah.</p>
      </div>

      {/* Ringkasan Keuangan */}
      <Card title="Ringkasan Keuangan" icon="📊">
        <div className="grid grid-cols-2 gap-3">
          {/* Pemasukan */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <span className="text-xs font-medium text-emerald-700">Pemasukan</span>
            </div>
            <p className="mt-2 text-lg font-bold text-emerald-600">{fmt(incomeTotal)}</p>
          </div>
          {/* Pengeluaran */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💸</span>
              <span className="text-xs font-medium text-red-600">Pengeluaran</span>
            </div>
            <p className="mt-2 text-lg font-bold text-red-500">{fmt(expenseTotal)}</p>
          </div>
          {/* Tagihan Tertunda */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="text-xs font-medium text-amber-700">Tagihan Tertunda</span>
            </div>
            <p className="mt-2 text-lg font-bold text-amber-600">{fmt(billUnpaid)}</p>
          </div>
          {/* Sisa / Saldo */}
          <div className={`rounded-xl border p-4 ${sisa >= 0 ? 'bg-forest/5 border-forest/20' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className={`text-xs font-medium ${sisa >= 0 ? 'text-forest' : 'text-red-600'}`}>Sisa Saldo</span>
            </div>
            <p className={`mt-2 text-lg font-bold ${sisa >= 0 ? 'text-forest' : 'text-red-500'}`}>{fmt(sisa)}</p>
          </div>
        </div>
        {/* Progress bar */}
        {incomeTotal > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-forest/40 mb-1">
              <span>Pengeluaran: {Math.round(expenseTotal / incomeTotal * 100)}%</span>
              <span>Tagihan: {Math.round(billUnpaid / incomeTotal * 100)}%</span>
              <span>Sisa: {Math.round(sisa / incomeTotal * 100)}%</span>
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
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate('chores')}
          className="rounded-2xl bg-gradient-to-br from-forest/15 to-forest/5 border border-forest/5 p-4 text-left transition hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <span className="text-2xl">✅</span>
          </div>
          <p className="mt-2 text-xl font-bold text-forest">{choresDone}/{chores.length}</p>
          <p className="mt-0.5 text-xs text-forest/50">Tugas Selesai</p>
        </button>
        <button onClick={() => onNavigate('shopping')}
          className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 border border-forest/5 p-4 text-left transition hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <span className="text-2xl">🛒</span>
          </div>
          <p className="mt-2 text-xl font-bold text-sky-600">{shoppingBought}/{shopping.length}</p>
          <p className="mt-0.5 text-xs text-forest/50">Belanja Dibeli</p>
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
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">💸</span>
                <span className="text-forest truncate">{e.description || e.category}</span>
              </div>
              <span className="font-medium text-forest shrink-0 ml-2">{fmt(e.amount)}</span>
            </div>
          ))}
          {income.slice(0, 2).map((inc: any) => (
            <div key={inc.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">📈</span>
                <span className="text-forest truncate">{inc.description || inc.source}</span>
              </div>
              <span className="font-medium text-emerald-600 shrink-0 ml-2">+{fmt(inc.amount)}</span>
            </div>
          ))}
          {chores.filter(i => i.done).slice(0, 2).map(c => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">✅</span>
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

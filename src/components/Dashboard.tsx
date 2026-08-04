import { useEffect, useState } from 'react'
import { getExpenses, getChores, getShopping, getBills, getPlans } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { Expense, Chore, ShoppingItem, Bill, Plan } from '../lib/db'
import { Card } from './ui'

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const pct = (value: number, total: number) => total > 0 ? Math.max(0, Math.min(100, Math.round(value / total * 100))) : 0

type Props = { onNavigate: (tab: string) => void }

export default function Dashboard({ onNavigate }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [shopping, setShopping] = useState<ShoppingItem[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [income, setIncome] = useState<any[]>([])
  const [savings, setSavings] = useState<{ amount: number }[]>([])
  const [savingsGoals, setSavingsGoals] = useState<{ target_amount: number }[]>([])

  useEffect(() => {
    getExpenses().then(setExpenses)
    getChores().then(setChores)
    getShopping().then(setShopping)
    getBills().then(setBills)
    getPlans().then(setPlans)
    supabase.from('income').select('*').then(({ data }) => setIncome(data || []))
    supabase.from('savings_deposits').select('amount').then(({ data }) => setSavings(data || []))
    supabase.from('savings_goals').select('target_amount').then(({ data }) => setSavingsGoals(data || []))
  }, [])

  const expenseTotal = expenses.reduce((s, i) => s + Number(i.amount), 0)
  const incomeTotal = income.reduce((s, i) => s + Number(i.amount), 0)
  const savingsTotal = savings.reduce((s, i) => s + Number(i.amount), 0)
  const savingsTarget = savingsGoals.reduce((s, i) => s + Number(i.target_amount), 0)
  const availableIncome = incomeTotal - savingsTotal
  const billUnpaid = bills.filter(i => !i.paid).reduce((s, i) => s + Number(i.amount), 0)
  const balance = availableIncome - expenseTotal - billUnpaid
  const choresDone = chores.filter(i => i.done).length
  const shoppingBought = shopping.filter(i => i.bought).length
  const upcomingPlans = plans.filter(i => i.status === 'rencana').length
  const used = expenseTotal + billUnpaid
  const usedPercent = pct(used, incomeTotal)
  const safeBalance = Math.max(0, balance)

  const actions = [
    { label: 'Pengeluaran', sub: 'Scan struk / tambah biaya', icon: '💸', tab: 'expenses' },
    { label: 'Pemasukan', sub: 'Catat tabungan & income', icon: '📈', tab: 'income' },
    { label: 'Wedding', sub: 'Planner & daftar tamu', icon: '💍', tab: 'wedding' },
    { label: 'Tagihan', sub: 'Cek yang belum lunas', icon: '📋', tab: 'bills' },
  ]

  const activity = [
    ...expenses.slice(0, 3).map(item => ({ id: `e-${item.id}`, icon: '💸', title: item.description || item.category, meta: 'Pengeluaran', value: fmt(item.amount), tone: 'text-red-500' })),
    ...income.slice(0, 2).map((item: any) => ({ id: `i-${item.id}`, icon: '📈', title: item.description || item.source, meta: 'Pemasukan', value: `+${fmt(item.amount)}`, tone: 'text-emerald-500' })),
    ...chores.filter(item => item.done).slice(0, 2).map(item => ({ id: `c-${item.id}`, icon: '✅', title: item.title, meta: 'Tugas selesai', value: 'Done', tone: 'text-forest/45' })),
  ].slice(0, 6)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-forest/15 bg-gradient-to-br from-[#31182a] via-[#1c1221] to-[#0b0910] p-5 shadow-2xl shadow-forest/10 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-forest/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-6 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-forest/60">DailyKaoAyy Home</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-forest sm:text-3xl">Ringkasan Rumah Hari Ini</h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-forest/58">Keuangan, tugas, belanja, dan wedding planner tetap rapi dalam satu dashboard.</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-forest/12 bg-cream/55 p-4 backdrop-blur sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-forest/50">Sisa saldo aman</p>
                <p className={`mt-1 max-w-full break-words text-[clamp(1.45rem,8vw,2.25rem)] font-black leading-tight tracking-tight ${balance >= 0 ? 'text-forest' : 'text-red-500'}`}>{fmt(balance)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${balance >= 0 ? 'bg-forest/12 text-forest' : 'bg-red-50 text-red-500'}`}>{balance >= 0 ? 'Aman' : 'Minus'}</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-forest/10">
              <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-gold to-forest" style={{ width: `${usedPercent}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-forest/42">
              <span>Terpakai {usedPercent}%</span>
              <span>Sisa {fmt(safeBalance)}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-forest/50">Keuangan</p><h2 className="mt-0.5 text-lg font-black text-forest">Ringkasan saldo</h2></div>
          <span className="rounded-full bg-forest/8 px-3 py-1 text-[11px] font-semibold text-forest/65">Total saat ini</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric icon="📈" label="Total pemasukan" value={fmt(incomeTotal)} tone="text-emerald-500" surface="bg-emerald-50 border-emerald-200" />
          <Metric icon="💸" label="Pengeluaran" value={fmt(expenseTotal)} tone="text-red-500" surface="bg-red-50 border-red-200" />
          <Metric icon="📋" label="Tagihan belum bayar" value={fmt(billUnpaid)} tone="text-gold" surface="bg-amber-50 border-amber-200" />
          <Metric icon="💰" label="Sisa saldo" value={fmt(balance)} tone={balance >= 0 ? 'text-forest' : 'text-red-500'} surface={balance >= 0 ? 'bg-forest/8 border-forest/20' : 'bg-red-50 border-red-200'} />
        </div>
        <button onClick={() => onNavigate('savings')} className="relative mt-3 w-full overflow-hidden rounded-3xl border border-[#c4b5fd]/30 bg-[#15101d] p-4 text-left shadow-xl shadow-[#8b5cf6]/15 transition hover:border-[#c4b5fd]/55 active:scale-[0.99]">
          <span className="pointer-events-none absolute -right-3 -top-5 text-7xl opacity-10">💎</span><span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(196,181,253,.16),transparent_40%)]" />
          <span className="relative flex items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#c4b5fd]/25 bg-[#8b5cf6]/20 text-2xl">💎</span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-[#f5f3ff]">Target Tabungan</span><span className="mt-0.5 block text-xs text-[#ddd6fe]/70">Dana aman, terpisah dari sisa saldo</span></span><span className="shrink-0 text-right"><span className="block text-base font-black text-[#e9d5ff]">{fmt(savingsTotal)}</span><span className="text-[10px] font-semibold text-[#ddd6fe]/55">Buka target ›</span></span></span>
          <span className="relative mt-3 block h-1.5 overflow-hidden rounded-full bg-black/25"><span className="block h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#e9d5ff]" style={{ width: `${savingsTarget ? Math.min(100, Math.round(savingsTotal / savingsTarget * 100)) : 0}%` }} /></span>
          <span className="relative mt-1.5 flex justify-between text-[10px] text-[#ddd6fe]/55"><span>{savingsTarget ? `Target ${fmt(savingsTarget)}` : 'Buat target pertamamu'}</span><span>{savingsTarget ? `${Math.min(100, Math.round(savingsTotal / savingsTarget * 100))}%` : ''}</span></span>
        </button>
        <p className="mt-2 text-[11px] text-forest/45">Total pemasukan tetap utuh. Tabungan hanya mengurangi sisa saldo yang bisa dipakai.</p>
      </section>

      <Card title="Aksi Cepat" icon="⚡">
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map(action => (
            <button key={action.tab} onClick={() => onNavigate(action.tab)} className="group flex items-center gap-3 rounded-2xl border border-forest/10 bg-cream/70 p-3 text-left transition hover:border-forest/25 hover:bg-cream-dark active:scale-[0.99]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest/10 text-xl transition group-hover:bg-forest/15">{action.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-forest">{action.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-forest/45">{action.sub}</span>
              </span>
              <span className="text-forest/35">›</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat icon="✅" value={`${choresDone}/${chores.length}`} label="Tugas" onClick={() => onNavigate('chores')} />
        <MiniStat icon="🛒" value={`${shoppingBought}/${shopping.length}`} label="Belanja" onClick={() => onNavigate('shopping')} />
        <MiniStat icon="🗺️" value={String(upcomingPlans)} label="Rencana" onClick={() => onNavigate('plans')} />
      </div>

      <Card title="Aktivitas Terbaru" icon="🕐">
        <div className="max-h-[24rem] space-y-2.5 overflow-y-auto pr-1">
          {activity.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-forest/8 bg-cream/55 px-3 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest/8 text-base">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest">{item.title}</p>
                <p className="text-[10px] text-forest/40">{item.meta}</p>
              </div>
              <span className={`shrink-0 text-xs font-bold ${item.tone}`}>{item.value}</span>
            </div>
          ))}
          {!activity.length && <p className="py-8 text-center text-sm text-forest/40">Belum ada aktivitas. Mulai dari scan struk atau tambah pemasukan.</p>}
        </div>
      </Card>

      <section className="rounded-[1.75rem] border border-gold/20 bg-gradient-to-br from-gold/15 via-forest/8 to-forest-light/10 p-4 shadow-lg shadow-gold/5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/15 text-2xl">💡</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-forest">Tips hari ini</p>
            <p className="mt-1 text-xs leading-relaxed text-forest/58">Pisahkan pengeluaran rumah dan wedding. Budget tetap kebaca jernih, keputusan jadi lebih tenang.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ icon, label, value, tone, surface }: { icon: string; label: string; value: string; tone: string; surface: string }) {
  return <div className={`min-w-0 rounded-3xl border p-3 shadow-lg shadow-forest/5 sm:p-4 ${surface}`}>
    <div className="flex items-start gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-black/10 text-base">{icon}</span><span className="pt-0.5 text-[11px] font-bold leading-tight text-forest/70 sm:text-xs">{label}</span></div>
    <p className={`mt-3 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(.8rem,3.5vw,1.125rem)] font-black tracking-tight ${tone}`} title={value}>{value}</p>
  </div>
}

function MiniStat({ icon, value, label, onClick }: { icon: string; value: string; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="min-w-0 rounded-3xl border border-forest/10 bg-white/80 p-3 text-left shadow-lg shadow-forest/5 transition active:scale-[0.98]">
    <span className="text-xl">{icon}</span>
    <p className="mt-2 truncate text-lg font-black text-forest">{value}</p>
    <p className="truncate text-[10px] text-forest/45">{label}</p>
  </button>
}

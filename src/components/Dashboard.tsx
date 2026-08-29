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
    ...chores.filter(item => item.done).slice(0, 2).map(item => ({ id: `c-${item.id}`, icon: '✅', title: item.title, meta: 'Tugas selesai', value: 'Done', tone: 'text-forest/75' })),
  ].slice(0, 6)

  return (
    <div className="space-y-6">
      <section className="animate-fade-up grid gap-3 sm:gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-forest-light/30 bg-gradient-to-br from-white/95 via-[#fff0f6] to-[#660033]/30 p-4 shadow-[0_24px_60px_rgba(102,0,51,0.22)] sm:p-7 animate-lift">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-forest-light/25 blur-2xl animate-float-slow" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/55 blur-2xl animate-float-slow" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-sheen" />
          <div className="mb-4 h-1 w-20 rounded-full bg-forest-light" />
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-forest/75">DailyKaoAyy Home</p>
          <div className="mt-3 max-w-xl">
            <h1 className="text-[1.7rem] font-black leading-tight tracking-tight text-forest sm:text-4xl">Ringkasan Rumah Hari Ini</h1>
            <p className="mt-2 text-sm leading-relaxed text-forest/75">Keuangan, tugas, belanja, dan wedding planner tetap rapi dalam satu tampilan yang tenang dan premium.</p>
          </div>
          <div className="mt-6 rounded-[1.75rem] border border-forest/15 bg-[#fff8fb]/95 p-4 shadow-inner shadow-black/30 backdrop-blur-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-forest/75">Sisa saldo aman</p>
                <p className={`mt-2 max-w-full break-words text-[clamp(1.6rem,8vw,2.7rem)] font-black leading-none tracking-tight ${balance >= 0 ? 'text-forest' : 'text-red-500'}`}>{fmt(balance)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${balance >= 0 ? 'bg-forest-light/15 text-forest-light' : 'bg-red-50 text-red-500'}`}>{balance >= 0 ? 'Aman' : 'Minus'}</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-forest/10">
              <div className="h-full rounded-full bg-gradient-to-r from-gold via-forest to-forest-light" style={{ width: `${usedPercent}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-forest/75">
              <span>Terpakai {usedPercent}%</span>
              <span>Sisa {fmt(safeBalance)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <button onClick={() => onNavigate('savings')} className="relative overflow-hidden rounded-[2rem] border border-[#c4b5fd]/30 bg-white/90 p-5 text-left shadow-[0_24px_60px_rgba(79,70,229,0.14)] transition active:scale-[0.99]">
            <span className="pointer-events-none absolute -right-4 -top-6 text-7xl opacity-10">💎</span>
            <span className="relative flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#c4b5fd]/25 bg-forest-light/12 text-2xl">💎</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-forest">Target Tabungan</span>
                <span className="mt-0.5 block text-xs text-forest/75">Dana aman, terpisah dari sisa saldo</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-base font-black text-forest">{fmt(savingsTotal)}</span>
                <span className="text-[10px] font-semibold text-forest/75">Buka target ›</span>
              </span>
            </span>
            <span className="relative mt-4 block h-1.5 overflow-hidden rounded-full bg-black/25"><span className="block h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#e9d5ff]" style={{ width: `${savingsTarget ? Math.min(100, Math.round(savingsTotal / savingsTarget * 100)) : 0}%` }} /></span>
            <span className="relative mt-2 flex justify-between text-[10px] text-forest/75"><span>{savingsTarget ? `Target ${fmt(savingsTarget)}` : 'Buat target pertamamu'}</span><span>{savingsTarget ? `${Math.min(100, Math.round(savingsTotal / savingsTarget * 100))}%` : ''}</span></span>
          </button>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon="✅" value={`${choresDone}/${chores.length}`} label="Tugas" onClick={() => onNavigate('chores')} />
            <MiniStat icon="🛒" value={`${shoppingBought}/${shopping.length}`} label="Belanja" onClick={() => onNavigate('shopping')} />
            <MiniStat icon="🗺️" value={String(upcomingPlans)} label="Rencana" onClick={() => onNavigate('plans')} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-forest/75">Keuangan</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-forest">Snapshot saldo</h2>
          </div>
          <span className="rounded-full border border-forest/10 bg-white/90 px-3 py-1 text-[11px] font-semibold text-forest/75">Total saat ini</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric icon="📈" label="Total pemasukan" value={fmt(incomeTotal)} tone="text-emerald-500" surface="bg-gradient-to-br from-white to-emerald-50 border-emerald-200" />
          <Metric icon="💸" label="Pengeluaran" value={fmt(expenseTotal)} tone="text-red-500" surface="bg-gradient-to-br from-white to-red-50 border-red-200" />
          <Metric icon="📋" label="Tagihan belum bayar" value={fmt(billUnpaid)} tone="text-gold" surface="bg-gradient-to-br from-white to-pink-50 border-amber-200" />
          <Metric icon="💰" label="Sisa saldo" value={fmt(balance)} tone={balance >= 0 ? 'text-forest' : 'text-red-500'} surface={balance >= 0 ? 'bg-gradient-to-br from-white to-pink-50 border-forest/20' : 'bg-gradient-to-br from-white to-red-50 border-red-200'} />
        </div>
      </section>

      <Card title="Aksi Cepat" icon="⚡" className="border-forest-light/25 bg-gradient-to-br from-white/95 to-[#7a153f]/10 shadow-[0_18px_50px_rgba(122,21,63,0.10)]">
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map(action => (
            <button key={action.tab} onClick={() => onNavigate(action.tab)} className="group flex items-center gap-3 rounded-2xl border border-forest/10 bg-cream/70 p-3 text-left transition hover:border-gold/30 hover:bg-cream-dark active:scale-[0.99]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest/10 text-xl transition group-hover:bg-forest-light/12">{action.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-forest">{action.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-forest/75">{action.sub}</span>
              </span>
              <span className="text-forest/60">›</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Aktivitas Terbaru" icon="🕐" className="border-forest-light/25 bg-gradient-to-br from-white/95 to-[#7a153f]/8">
        <div className="max-h-[24rem] space-y-2.5 overflow-y-auto pr-1">
          {activity.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-forest/8 bg-gradient-to-r from-white to-pink-50 px-3 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-light/8 text-base">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest">{item.title}</p>
                <p className="text-[10px] text-forest/75">{item.meta}</p>
              </div>
              <span className={`shrink-0 text-xs font-bold ${item.tone}`}>{item.value}</span>
            </div>
          ))}
          {!activity.length && <p className="py-8 text-center text-sm text-forest/75">Belum ada aktivitas. Mulai dari scan struk atau tambah pemasukan.</p>}
        </div>
      </Card>

      <section className="animate-lift rounded-[1.75rem] border border-forest-light/35 bg-gradient-to-r from-[#660033] via-[#7a0f46] to-[#a12861] p-4 shadow-lg shadow-[#660033]/22">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl">💡</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Tips hari ini</p>
            <p className="mt-1 text-xs leading-relaxed text-white/80">Pisahkan pengeluaran rumah dan wedding. Budget tetap kebaca jernih, keputusan jadi lebih tenang.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string; tone: string; surface: string }) {
  return <div className="min-w-0 rounded-[1.5rem] border border-[#8f3b68] bg-[#660033] p-3.5 shadow-[0_14px_30px_rgba(102,0,51,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#78003d]">
    <div className="flex items-start gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15 text-base">{icon}</span>
      <span className="pt-0.5 text-[11px] font-bold leading-tight text-white/85 sm:text-xs">{label}</span>
    </div>
    <p className="mt-3 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(.8rem,3.5vw,1.125rem)] font-black tracking-tight text-white" title={value}>{value}</p>
  </div>
}

function MiniStat({ icon, value, label, onClick }: { icon: string; value: string; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="min-w-0 rounded-[1.5rem] border border-forest/10 bg-white/80 p-3 text-left shadow-sm transition active:scale-[0.98]">
    <span className="text-xl">{icon}</span>
    <p className="mt-2 truncate text-lg font-black text-forest">{value}</p>
    <p className="truncate text-[10px] text-forest/75">{label}</p>
  </button>
}

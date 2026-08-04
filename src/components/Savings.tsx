import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, CurrencyInput, Input } from './ui'
import WeddingEditDialog from './WeddingEditDialog'

type Goal = { id: string; name: string; target_amount: number; target_date: string | null }
type Deposit = { id: string; goal_id: string; amount: number; note: string; deposited_at: string }
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Savings() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [goal, setGoal] = useState({ name: '', amount: '', date: '' })
  const [deposit, setDeposit] = useState({ goalId: '', amount: '', note: '' })
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Goal | null>(null)
  const load = async () => {
    const [{ data: goalsData, error: goalsError }, { data: depositsData, error: depositsError }] = await Promise.all([
      supabase.from('savings_goals').select('*').order('created_at'),
      supabase.from('savings_deposits').select('*').order('deposited_at', { ascending: false }),
    ])
    if (goalsError || depositsError) setError(goalsError?.message || depositsError?.message || '')
    setGoals((goalsData || []) as Goal[]); setDeposits((depositsData || []) as Deposit[])
  }
  useEffect(() => { void load() }, [])
  const addGoal = async () => {
    if (!goal.name.trim() || !Number(goal.amount)) return setError('Isi nama target dan nominal target.')
    setError('')
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return setError('Silakan login kembali.')
    const { error: insertError } = await supabase.from('savings_goals').insert({ user_id: user.id, name: goal.name.trim(), target_amount: Number(goal.amount), target_date: goal.date || null })
    if (insertError) return setError(insertError.message)
    setGoal({ name: '', amount: '', date: '' }); await load()
  }
  const saveGoal = async (values: Record<string, string>) => {
    if (!editing || !values.name.trim() || !Number(values.target_amount)) return
    const { error: updateError } = await supabase.from('savings_goals').update({ name: values.name.trim(), target_amount: Number(values.target_amount), target_date: values.target_date || null }).eq('id', editing.id)
    if (updateError) return setError(updateError.message)
    setEditing(null); await load()
  }
  const addDeposit = async () => {
    if (!deposit.goalId || !Number(deposit.amount)) return setError('Pilih target dan isi nominal setoran.')
    setError('')
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return setError('Silakan login kembali.')
    const { error: insertError } = await supabase.from('savings_deposits').insert({ user_id: user.id, goal_id: deposit.goalId, amount: Number(deposit.amount), note: deposit.note })
    if (insertError) return setError(insertError.message)
    setDeposit({ goalId: '', amount: '', note: '' }); await load()
  }
  const total = useMemo(() => deposits.reduce((sum, item) => sum + Number(item.amount), 0), [deposits])
  const targetTotal = useMemo(() => goals.reduce((sum, item) => sum + Number(item.target_amount), 0), [goals])
  const savedFor = (id: string) => deposits.filter(item => item.goal_id === id).reduce((sum, item) => sum + Number(item.amount), 0)

  return <div className="space-y-5">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#c4b5fd]/35 bg-[#120d1a] p-5 shadow-2xl shadow-[#8b5cf6]/20 sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(196,181,253,.25),transparent_36%),radial-gradient(circle_at_10%_100%,rgba(139,92,246,.2),transparent_42%)]" />
      <div className="pointer-events-none absolute -right-7 -top-8 text-8xl opacity-20">🎯</div>
      <div className="relative"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#d8b4fe]">Financial Goal</p><h1 className="mt-1 text-2xl font-black text-[#f5f3ff] sm:text-3xl">Target Budget</h1></div><span className="rounded-2xl border border-[#c4b5fd]/25 bg-[#8b5cf6]/15 px-3 py-2 text-right"><b className="block text-lg text-[#f5f3ff]">{goals.length}</b><small className="text-[10px] font-bold text-[#ddd6fe]/65">TARGET</small></span></div><p className="mt-2 max-w-lg text-sm leading-relaxed text-[#ddd6fe]/80">Sisihkan dana untuk tujuan penting. Setoran mengurangi sisa saldo, bukan total pemasukan.</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-2xl border border-[#c4b5fd]/20 bg-[#0f0c18]/55 p-3.5 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-wider text-[#ddd6fe]/60">Terkumpul</p><p className="mt-1 truncate text-lg font-black text-[#f5f3ff]">{fmt(total)}</p></div><div className="rounded-2xl border border-[#c4b5fd]/20 bg-[#0f0c18]/55 p-3.5 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-wider text-[#ddd6fe]/60">Total target</p><p className="mt-1 truncate text-lg font-black text-[#e9d5ff]">{fmt(targetTotal)}</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#e9d5ff]" style={{ width: `${targetTotal ? Math.min(100, Math.round(total / targetTotal * 100)) : 0}%` }} /></div></div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-[#a78bfa]/25 bg-[#171421] p-4 shadow-lg shadow-black/20 sm:p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#8b5cf6]/20 text-xl">🎯</span><div><h2 className="font-black text-[#f5f3ff]">Buat Target</h2><p className="text-xs text-[#ddd6fe]/65">Contoh: dana darurat atau liburan</p></div></div><div className="mt-4 grid gap-3"><Input label="Nama target" value={goal.name} onChange={e => setGoal({ ...goal, name: e.target.value })} placeholder="Contoh: Dana darurat" /><CurrencyInput label="Nominal target" value={goal.amount} onValueChange={amount => setGoal({ ...goal, amount })} placeholder="0" /><label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#ddd6fe]/65">Target selesai (opsional)</span><input type="date" value={goal.date} onChange={e => setGoal({ ...goal, date: e.target.value })} className="w-full rounded-xl border border-[#a78bfa]/25 bg-[#100d18] px-3 py-2.5 text-sm text-[#f5f3ff]" /></label></div><Button type="button" className="mt-4 w-full" onClick={() => void addGoal()}>+ Buat Target</Button></div>
      <div className="rounded-3xl border border-[#a78bfa]/25 bg-[#171421] p-4 shadow-lg shadow-black/20 sm:p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#8b5cf6]/20 text-xl">➕</span><div><h2 className="font-black text-[#f5f3ff]">Tambah Setoran</h2><p className="text-xs text-[#ddd6fe]/65">Dana ini mengurangi sisa saldo</p></div></div><div className="mt-4 grid gap-3"><label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#ddd6fe]/65">Pilih target</span><select value={deposit.goalId} onChange={e => setDeposit({ ...deposit, goalId: e.target.value })} className="w-full rounded-xl border border-[#a78bfa]/25 bg-[#100d18] px-3 py-2.5 text-sm text-[#f5f3ff]"><option value="">Pilih target tabungan</option>{goals.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><CurrencyInput label="Nominal setoran" value={deposit.amount} onValueChange={amount => setDeposit({ ...deposit, amount })} placeholder="0" /><Input label="Catatan (opsional)" value={deposit.note} onChange={e => setDeposit({ ...deposit, note: e.target.value })} placeholder="Contoh: setoran bulan ini" /></div><Button type="button" className="mt-4 w-full" onClick={() => void addDeposit()}>+ Simpan Setoran</Button></div>
    </section>
    {error && <p className="rounded-xl border border-red-400/30 bg-[#2a121d] p-3 text-sm text-[#fda4af]">{error}</p>}

    <section><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-forest/50">Progress</p><h2 className="mt-1 text-xl font-black text-forest">Target aktif</h2></div><span className="text-xs text-forest/55">{goals.length} target</span></div><div className="space-y-3">{goals.map(item => { const saved = savedFor(item.id); const progress = Math.min(100, Math.round(saved / Number(item.target_amount) * 100)); return <article key={item.id} className="rounded-3xl border border-[#a78bfa]/20 bg-[#171421] p-4 shadow-lg shadow-black/15 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-black text-[#f5f3ff]">🎯 {item.name}</h3><p className="mt-1 text-xs text-[#ddd6fe]/70">Terkumpul <b className="text-[#f5f3ff]">{fmt(saved)}</b> dari {fmt(item.target_amount)}</p>{item.target_date && <p className="mt-1 text-[11px] text-[#ddd6fe]/55">Target selesai: {item.target_date}</p>}</div><div className="shrink-0 text-right"><span className="block rounded-full bg-[#8b5cf6]/25 px-3 py-1.5 text-sm font-black text-[#e9d5ff]">{progress}%</span><button type="button" onClick={() => setEditing(item)} className="mt-2 rounded-lg px-2 py-1 text-xs font-semibold text-[#d8b4fe] hover:bg-white/5">Edit</button></div></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-[#0f0c18]"><div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d8b4fe]" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-[#ddd6fe]/60"><span>Sisa {fmt(Math.max(0, Number(item.target_amount) - saved))}</span><span>{progress === 100 ? 'Target tercapai ✓' : 'Lanjut menabung'}</span></div></article> })}{!goals.length && <p className="rounded-3xl border border-dashed border-[#a78bfa]/25 bg-[#171421]/60 py-12 text-center text-sm text-[#ddd6fe]/60">Belum ada target budget. Buat target pertama di atas.</p>}</div></section>
    {editing && <WeddingEditDialog title="Edit Target Budget" fields={[{ key: 'name', label: 'Nama target', value: editing.name }, { key: 'target_amount', label: 'Nominal target', value: String(editing.target_amount), type: 'number' }, { key: 'target_date', label: 'Target selesai', value: editing.target_date || '', type: 'date' }]} onClose={() => setEditing(null)} onSave={saveGoal} />}
  </div>
}

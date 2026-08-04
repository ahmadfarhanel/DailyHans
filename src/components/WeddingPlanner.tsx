import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, CurrencyInput, Input } from './ui'

type Settings = { couple_name: string; wedding_date: string | null; total_budget: number }
type Task = { id: string; title: string; due_date: string | null; done: boolean }
type Vendor = { id: string; name: string; service: string; contact: string; total_amount: number; paid_amount: number; due_date: string | null }
type Budget = { id: string; category: string; planned_amount: number; actual_amount: number }
type Timeline = { id: string; title: string; event_date: string; note: string; done: boolean }
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const daysUntil = (date: string | null) => date ? Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) : null

export default function WeddingPlanner() {
  const [settings, setSettings] = useState<Settings>({ couple_name: '', wedding_date: null, total_budget: 0 })
  const [tasks, setTasks] = useState<Task[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [budget, setBudget] = useState<Budget[]>([])
  const [timeline, setTimeline] = useState<Timeline[]>([])
  const [error, setError] = useState('')
  const [task, setTask] = useState('')
  const [vendor, setVendor] = useState({ name: '', service: '', contact: '', total: '', paid: '', due: '' })
  const [budgetForm, setBudgetForm] = useState({ category: '', planned: '', actual: '' })
  const [event, setEvent] = useState({ title: '', date: '', note: '' })

  const load = async () => {
    const [{ data: setting }, { data: taskRows }, { data: vendorRows }, { data: budgetRows }, { data: timelineRows }] = await Promise.all([
      supabase.from('wedding_settings').select('*').maybeSingle(),
      supabase.from('wedding_tasks').select('*').order('created_at'),
      supabase.from('wedding_vendors').select('*').order('created_at'),
      supabase.from('wedding_budget_items').select('*').order('created_at'),
      supabase.from('wedding_timeline').select('*').order('event_date'),
    ])
    if (setting) setSettings(setting as Settings)
    setTasks((taskRows || []) as Task[]); setVendors((vendorRows || []) as Vendor[])
    setBudget((budgetRows || []) as Budget[]); setTimeline((timelineRows || []) as Timeline[])
  }
  useEffect(() => { void load() }, [])
  const saveSettings = async () => {
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setError('Silakan login kembali.')
    const { error: saveError } = await supabase.from('wedding_settings').upsert({ user_id: user.id, ...settings })
    if (saveError) setError(saveError.message)
  }
  const add = async (table: string, payload: object, reset: () => void) => {
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setError('Silakan login kembali.')
    const { error: insertError } = await supabase.from(table).insert({ user_id: user.id, ...payload })
    if (insertError) return setError(insertError.message)
    reset(); await load()
  }
  const remove = async (table: string, id: string) => { await supabase.from(table).delete().eq('id', id); await load() }
  const toggle = async (table: string, id: string, done: boolean) => { await supabase.from(table).update({ done: !done }).eq('id', id); await load() }
  const paid = vendors.reduce((sum, item) => sum + Number(item.paid_amount), 0)
  const planned = budget.reduce((sum, item) => sum + Number(item.planned_amount), 0)
  const actual = budget.reduce((sum, item) => sum + Number(item.actual_amount), 0)
  const countdown = daysUntil(settings.wedding_date)
  const progress = tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0

  return <div className="space-y-6">
    <Card title="Wedding Planner" icon="💍">
      <div className="rounded-2xl bg-gradient-to-br from-forest/15 via-gold/10 to-forest-light/10 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input label="Nama pasangan" value={settings.couple_name} onChange={e => setSettings({ ...settings, couple_name: e.target.value })} placeholder="Nama mempelai" />
          <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Tanggal acara</span><input type="date" value={settings.wedding_date || ''} onChange={e => setSettings({ ...settings, wedding_date: e.target.value || null })} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest outline-none" /></label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><CurrencyInput label="Total budget wedding" value={String(settings.total_budget || '')} onValueChange={value => setSettings({ ...settings, total_budget: Number(value) || 0 })} placeholder="0" /><Button type="button" onClick={saveSettings}>Simpan Wedding</Button></div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat value={countdown === null ? '—' : countdown < 0 ? 'Selesai' : `${countdown} hari`} label="Menuju hari-H" />
          <Stat value={`${progress}%`} label="Checklist selesai" />
          <Stat value={fmt(paid)} label="Vendor dibayar" small />
          <Stat value={fmt(Math.max(0, settings.total_budget - actual))} label="Sisa budget" small />
        </div>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-500">{error}</p>}
    </Card>

    <Card title="Checklist Persiapan" icon="✅">
      <div className="flex gap-2"><Input value={task} onChange={e => setTask(e.target.value)} placeholder="Contoh: Survey gedung" aria-label="Checklist" /><Button type="button" onClick={() => task.trim() && add('wedding_tasks', { title: task.trim() }, () => setTask(''))}>Tambah</Button></div>
      <div className="mt-4 space-y-2">{tasks.map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-forest/10 bg-white px-3 py-3"><input type="checkbox" checked={item.done} onChange={() => toggle('wedding_tasks', item.id, item.done)} className="h-5 w-5 shrink-0 accent-pink-400" /><span className={`min-w-0 flex-1 text-sm ${item.done ? 'text-forest/40 line-through' : 'text-forest'}`}>{item.title}</span><button type="button" onClick={() => remove('wedding_tasks', item.id)} className="shrink-0 text-xs text-red-500">Hapus</button></div>)}{!tasks.length && <Empty text="Belum ada checklist." />}</div>
    </Card>

    <Card title="Vendor" icon="🤝">
      <div className="grid gap-3 sm:grid-cols-2"><Input value={vendor.name} onChange={e => setVendor({ ...vendor, name: e.target.value })} placeholder="Nama vendor" /><Input value={vendor.service} onChange={e => setVendor({ ...vendor, service: e.target.value })} placeholder="Layanan" /><Input value={vendor.contact} onChange={e => setVendor({ ...vendor, contact: e.target.value })} placeholder="Kontak" /><label><input type="date" value={vendor.due} onChange={e => setVendor({ ...vendor, due: e.target.value })} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest" /></label><CurrencyInput label="Total harga" value={vendor.total} onValueChange={total => setVendor({ ...vendor, total })} placeholder="0" /><CurrencyInput label="Sudah dibayar" value={vendor.paid} onValueChange={paid => setVendor({ ...vendor, paid })} placeholder="0" /></div>
      <Button type="button" className="mt-3 w-full" onClick={() => vendor.name.trim() && add('wedding_vendors', { name: vendor.name.trim(), service: vendor.service, contact: vendor.contact, total_amount: Number(vendor.total) || 0, paid_amount: Number(vendor.paid) || 0, due_date: vendor.due || null }, () => setVendor({ name: '', service: '', contact: '', total: '', paid: '', due: '' }))}>+ Tambah Vendor</Button>
      <div className="mt-4 space-y-2">{vendors.map(item => <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-forest/10 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="truncate text-xs text-forest/55">{item.service || 'Vendor'} {item.contact && `• ${item.contact}`}</p></div><div className="flex items-center justify-between gap-3"><span className="text-xs">{fmt(item.paid_amount)} / {fmt(item.total_amount)}</span><button type="button" onClick={() => remove('wedding_vendors', item.id)} className="text-xs text-red-500">Hapus</button></div></div>)}{!vendors.length && <Empty text="Belum ada vendor." />}</div>
    </Card>

    <Card title="Budget Wedding" icon="💗">
      <div className="grid gap-3 sm:grid-cols-3"><Input value={budgetForm.category} onChange={e => setBudgetForm({ ...budgetForm, category: e.target.value })} placeholder="Kategori, contoh: Katering" /><CurrencyInput label="Rencana" value={budgetForm.planned} onValueChange={planned => setBudgetForm({ ...budgetForm, planned })} placeholder="0" /><CurrencyInput label="Aktual" value={budgetForm.actual} onValueChange={actual => setBudgetForm({ ...budgetForm, actual })} placeholder="0" /></div>
      <Button type="button" className="mt-3 w-full" onClick={() => budgetForm.category.trim() && add('wedding_budget_items', { category: budgetForm.category.trim(), planned_amount: Number(budgetForm.planned) || 0, actual_amount: Number(budgetForm.actual) || 0 }, () => setBudgetForm({ category: '', planned: '', actual: '' }))}>+ Tambah Budget</Button>
      <div className="mt-4 space-y-2">{budget.map(item => <div key={item.id} className="flex flex-col gap-1 rounded-xl border border-forest/10 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"><b className="text-sm">{item.category}</b><span className="text-xs text-forest/60">Rencana {fmt(item.planned_amount)} • Aktual {fmt(item.actual_amount)}</span><button type="button" onClick={() => remove('wedding_budget_items', item.id)} className="text-xs text-red-500">Hapus</button></div>)}{!budget.length && <Empty text={`Belum ada budget. Total rencana: ${fmt(planned)}`} />}</div>
    </Card>


    <Card title="Timeline" icon="🗓️">
      <div className="grid gap-3 sm:grid-cols-2"><Input value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })} placeholder="Contoh: Fitting baju" /><label><input type="date" value={event.date} onChange={e => setEvent({ ...event, date: e.target.value })} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest" /></label><Input value={event.note} onChange={e => setEvent({ ...event, note: e.target.value })} placeholder="Catatan" className="sm:col-span-2" /></div>
      <Button type="button" className="mt-3 w-full" onClick={() => event.title.trim() && event.date && add('wedding_timeline', { title: event.title.trim(), event_date: event.date, note: event.note }, () => setEvent({ title: '', date: '', note: '' }))}>+ Tambah Timeline</Button>
      <div className="mt-4 space-y-2">{timeline.map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-forest/10 bg-white px-3 py-3"><input type="checkbox" checked={item.done} onChange={() => toggle('wedding_timeline', item.id, item.done)} className="h-5 w-5 shrink-0 accent-pink-400" /><div className="min-w-0 flex-1"><p className={`truncate text-sm font-semibold ${item.done ? 'line-through text-forest/40' : ''}`}>{item.title}</p><p className="truncate text-xs text-forest/55">{item.event_date}{item.note && ` • ${item.note}`}</p></div><button type="button" onClick={() => remove('wedding_timeline', item.id)} className="shrink-0 text-xs text-red-500">Hapus</button></div>)}{!timeline.length && <Empty text="Belum ada timeline." />}</div>
    </Card>
  </div>
}
function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) { return <div className="min-w-0 rounded-xl bg-cream/70 p-3"><p className={`${small ? 'text-sm' : 'text-lg'} truncate font-bold text-forest`}>{value}</p><p className="text-[10px] text-forest/55">{label}</p></div> }
function Empty({ text }: { text: string }) { return <p className="py-5 text-center text-sm text-forest/45">{text}</p> }

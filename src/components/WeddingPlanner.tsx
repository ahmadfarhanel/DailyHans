import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, CurrencyInput, Input } from './ui'
import WeddingEditDialog, { type EditField } from './WeddingEditDialog'

type Settings = { couple_name: string; wedding_date: string | null; total_budget: number }
type Task = { id: string; title: string; due_date: string | null; done: boolean }
type Vendor = { id: string; name: string; service: string; contact: string; total_amount: number; paid_amount: number; due_date: string | null }
type Budget = { id: string; category: string; planned_amount: number; actual_amount: number }
type Timeline = { id: string; title: string; event_date: string; note: string; done: boolean }
type Need = { id: string; title: string; amount: number; note: string }
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const daysUntil = (date: string | null) => date ? Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) : null
const relativeDay = (date: string) => { const days = daysUntil(date); return days === 0 ? 'Hari ini' : days === 1 ? 'Besok' : days !== null && days > 1 ? `${days} hari lagi` : `${Math.abs(days || 0)} hari lalu` }

export default function WeddingPlanner() {
  const [settings, setSettings] = useState<Settings>({ couple_name: '', wedding_date: null, total_budget: 0 })
  const [tasks, setTasks] = useState<Task[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [budget, setBudget] = useState<Budget[]>([])
  const [timeline, setTimeline] = useState<Timeline[]>([])
  const [needs, setNeeds] = useState<Need[]>([])
  const [need, setNeed] = useState({ title: '', amount: '', note: '' })
  const [error, setError] = useState('')
  const [task, setTask] = useState('')
  const [vendor, setVendor] = useState({ name: '', service: '', contact: '', total: '', paid: '', due: '' })
  const [budgetForm, setBudgetForm] = useState({ category: '', planned: '', actual: '' })
  const [event, setEvent] = useState({ title: '', date: '', note: '' })
  const [editing, setEditing] = useState<{ title: string; table: string; id: string; fields: EditField[]; map: (values: Record<string, string>) => object } | null>(null)

  const load = async () => {
    const [{ data: setting }, { data: taskRows }, { data: vendorRows }, { data: budgetRows }, { data: timelineRows }, { data: needRows }] = await Promise.all([
      supabase.from('wedding_settings').select('*').maybeSingle(),
      supabase.from('wedding_tasks').select('*').order('created_at'),
      supabase.from('wedding_vendors').select('*').order('created_at'),
      supabase.from('wedding_budget_items').select('*').order('created_at'),
      supabase.from('wedding_timeline').select('*').order('event_date'),
      supabase.from('wedding_needs').select('*').order('created_at'),
    ])
    if (setting) setSettings(setting as Settings)
    setTasks((taskRows || []) as Task[]); setVendors((vendorRows || []) as Vendor[])
    setBudget((budgetRows || []) as Budget[]); setTimeline((timelineRows || []) as Timeline[]); setNeeds((needRows || []) as Need[])
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
  const edit = async (table: string, id: string, values: object) => { await supabase.from(table).update(values).eq('id', id); await load() }
  const openEdit = (title: string, table: string, id: string, fields: EditField[], map: (values: Record<string, string>) => object) => setEditing({ title, table, id, fields, map })
  const toggle = async (table: string, id: string, done: boolean) => { await supabase.from(table).update({ done: !done }).eq('id', id); await load() }
  const paid = vendors.reduce((sum, item) => sum + Number(item.paid_amount), 0)
  const planned = budget.reduce((sum, item) => sum + Number(item.planned_amount), 0)
  const actual = budget.reduce((sum, item) => sum + Number(item.actual_amount), 0)
  const needTotal = needs.reduce((sum, item) => sum + Number(item.amount), 0)
  const countdown = daysUntil(settings.wedding_date)
  const progress = tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0

  return <div className="space-y-6">
    <Card title="Wedding Planner" icon="💍">
      <div className="relative overflow-hidden rounded-3xl border border-forest/15 bg-gradient-to-br from-[#31182a] via-[#1c1221] to-[#0c0910] p-4 shadow-xl shadow-forest/10 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 text-8xl opacity-10">💍</div>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-forest/55">Wedding Dashboard</p>
          <p className="mt-1 text-xl font-black text-forest sm:text-2xl">{settings.couple_name || 'Hari bahagia dimulai di sini'}</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input label="Nama pasangan" value={settings.couple_name} onChange={e => setSettings({ ...settings, couple_name: e.target.value })} placeholder="Nama mempelai" />
          <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Tanggal acara</span><input type="date" value={settings.wedding_date || ''} onChange={e => setSettings({ ...settings, wedding_date: e.target.value || null })} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest outline-none" /></label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><CurrencyInput label="Total budget wedding" value={String(settings.total_budget || '')} onValueChange={value => setSettings({ ...settings, total_budget: Number(value) || 0 })} placeholder="0" /><Button type="button" onClick={saveSettings}>Simpan Wedding</Button></div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat value={countdown === null ? '—' : countdown < 0 ? 'Selesai' : `${countdown} hari`} label="Menuju hari-H" />
          <Stat value={`${progress}%`} label="Checklist selesai" />
          <Stat value={fmt(paid)} label="Vendor dibayar" small />
          <Stat value={fmt(Math.max(0, settings.total_budget - actual - needTotal))} label="Sisa budget" small />
        </div>
        </div>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-500">{error}</p>}
    </Card>

    <Card title="Checklist Persiapan" icon="✅">
      <div className="flex gap-2"><Input value={task} onChange={e => setTask(e.target.value)} placeholder="Contoh: Survey gedung" aria-label="Checklist" /><Button type="button" onClick={() => task.trim() && add('wedding_tasks', { title: task.trim() }, () => setTask(''))}>Tambah</Button></div>
      <div className="mt-4 max-h-[20rem] space-y-2 overflow-y-auto pr-1">{tasks.map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-forest/10 bg-white px-3 py-3"><input type="checkbox" checked={item.done} onChange={() => toggle('wedding_tasks', item.id, item.done)} className="h-5 w-5 shrink-0 accent-pink-400" /><span className={`min-w-0 flex-1 text-sm ${item.done ? 'text-forest/40 line-through' : 'text-forest'}`}>{item.title}</span><button type="button" onClick={() => openEdit('Edit Checklist', 'wedding_tasks', item.id, [{ key: 'title', label: 'Checklist', value: item.title }], values => ({ title: values.title.trim() }))} className="shrink-0 text-xs text-forest">Edit</button><button type="button" onClick={() => remove('wedding_tasks', item.id)} className="shrink-0 text-xs text-red-500">Hapus</button></div>)}{!tasks.length && <Empty text="Belum ada checklist." />}</div>
    </Card>

    <Card title="Vendor" icon="🤝">
      <div className="grid gap-3 sm:grid-cols-2"><Input value={vendor.name} onChange={e => setVendor({ ...vendor, name: e.target.value })} placeholder="Nama vendor" /><Input value={vendor.service} onChange={e => setVendor({ ...vendor, service: e.target.value })} placeholder="Layanan" /><Input value={vendor.contact} onChange={e => setVendor({ ...vendor, contact: e.target.value })} placeholder="Kontak" /><label><input type="date" value={vendor.due} onChange={e => setVendor({ ...vendor, due: e.target.value })} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest" /></label><CurrencyInput label="Total harga" value={vendor.total} onValueChange={total => setVendor({ ...vendor, total })} placeholder="0" /><CurrencyInput label="Sudah dibayar" value={vendor.paid} onValueChange={paid => setVendor({ ...vendor, paid })} placeholder="0" /></div>
      <Button type="button" className="mt-3 w-full" onClick={() => vendor.name.trim() && add('wedding_vendors', { name: vendor.name.trim(), service: vendor.service, contact: vendor.contact, total_amount: Number(vendor.total) || 0, paid_amount: Number(vendor.paid) || 0, due_date: vendor.due || null }, () => setVendor({ name: '', service: '', contact: '', total: '', paid: '', due: '' }))}>+ Tambah Vendor</Button>
      <div className="mt-4 max-h-[22rem] space-y-2 overflow-y-auto pr-1">{vendors.map(item => <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-forest/10 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="truncate text-xs text-forest/55">{item.service || 'Vendor'} {item.contact && `• ${item.contact}`}</p></div><div className="flex items-center justify-between gap-3"><span className="text-xs">{fmt(item.paid_amount)} / {fmt(item.total_amount)}</span><button type="button" onClick={() => openEdit('Edit Vendor', 'wedding_vendors', item.id, [{ key: 'name', label: 'Nama vendor', value: item.name }, { key: 'service', label: 'Layanan', value: item.service }, { key: 'contact', label: 'Kontak', value: item.contact }, { key: 'total_amount', label: 'Total harga', value: String(item.total_amount), type: 'number' }, { key: 'paid_amount', label: 'Sudah dibayar', value: String(item.paid_amount), type: 'number' }], values => ({ name: values.name.trim(), service: values.service, contact: values.contact, total_amount: Number(values.total_amount) || 0, paid_amount: Number(values.paid_amount) || 0 }))} className="text-xs text-forest">Edit</button><button type="button" onClick={() => remove('wedding_vendors', item.id)} className="text-xs text-red-500">Hapus</button></div></div>)}{!vendors.length && <Empty text="Belum ada vendor." />}</div>
    </Card>

    <Card title="Budget Wedding" icon="💗">
      <div className="rounded-2xl border border-forest/10 bg-[#151019] p-4 sm:p-5"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-sm font-black text-forest">Tambah anggaran</p><p className="mt-0.5 text-xs text-forest/55">Rencana dan biaya aktual per kategori.</p></div><div className="shrink-0 rounded-xl border border-forest/15 bg-[#211a25] px-3 py-2 text-right"><p className="text-[10px] font-semibold text-forest/55">Total rencana</p><p className="mt-0.5 text-sm font-black text-forest">{fmt(planned)}</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Kategori budget" value={budgetForm.category} onChange={e => setBudgetForm({ ...budgetForm, category: e.target.value })} placeholder="Contoh: Katering" className="sm:col-span-2" /><CurrencyInput label="Rencana biaya" value={budgetForm.planned} onValueChange={planned => setBudgetForm({ ...budgetForm, planned })} placeholder="0" /><CurrencyInput label="Biaya aktual" value={budgetForm.actual} onValueChange={actual => setBudgetForm({ ...budgetForm, actual })} placeholder="0" /></div><Button type="button" className="mt-4 w-full sm:w-auto sm:px-7" onClick={() => budgetForm.category.trim() && add('wedding_budget_items', { category: budgetForm.category.trim(), planned_amount: Number(budgetForm.planned) || 0, actual_amount: Number(budgetForm.actual) || 0 }, () => setBudgetForm({ category: '', planned: '', actual: '' }))}>+ Tambah Kategori</Button></div>
      <div className="mt-3 max-h-[22rem] divide-y divide-white/5 overflow-y-auto rounded-2xl border border-forest/10 bg-[#17131a] px-3">{budget.map(item => <div key={item.id} className="flex items-center gap-2 py-3"><div className="min-w-0 flex-1"><b className="block truncate text-sm text-[#edd7e4]">{item.category}</b><span className="mt-0.5 block text-[11px] text-[#ad99a5]">Rencana {fmt(item.planned_amount)} · Aktual {fmt(item.actual_amount)}</span></div><button type="button" onClick={() => openEdit('Edit Budget', 'wedding_budget_items', item.id, [{ key: 'category', label: 'Kategori', value: item.category }, { key: 'planned_amount', label: 'Rencana', value: String(item.planned_amount), type: 'number' }, { key: 'actual_amount', label: 'Aktual', value: String(item.actual_amount), type: 'number' }], values => ({ category: values.category.trim(), planned_amount: Number(values.planned_amount) || 0, actual_amount: Number(values.actual_amount) || 0 }))} className="shrink-0 rounded-lg px-2 py-2 text-xs text-[#cdbbc6] hover:bg-white/5">Edit</button><button type="button" onClick={() => remove('wedding_budget_items', item.id)} className="shrink-0 rounded-lg px-2 py-2 text-xs text-[#c38fa8] hover:bg-[#2a1c24]">Hapus</button></div>)}{!budget.length && <Empty text={`Belum ada budget. Total rencana: ${fmt(planned)}`} />}</div>
    </Card>


    <Card title="Kebutuhan Lainnya" icon="🛍️">
      <div className="rounded-2xl border border-forest/10 bg-[#151019] p-4 sm:p-5">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#241a2b] text-xl">🛍️</span><div className="min-w-0"><h3 className="text-base font-black text-forest">Biaya di luar vendor</h3><p className="mt-1 text-xs leading-relaxed text-forest/60">Souvenir, transport, konsumsi tambahan, dan kebutuhan kecil lain otomatis mengurangi sisa budget wedding.</p></div></div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-forest/15 bg-[#211a25] px-3 py-3"><span className="text-xs font-semibold text-forest/65">Total kebutuhan lain</span><span className="text-base font-black text-forest">-{fmt(needTotal)}</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><Input label="Nama kebutuhan" value={need.title} onChange={e => setNeed({ ...need, title: e.target.value })} placeholder="Contoh: Souvenir" /><CurrencyInput label="Nominal" value={need.amount} onValueChange={amount => setNeed({ ...need, amount })} placeholder="0" /><Input label="Catatan (opsional)" value={need.note} onChange={e => setNeed({ ...need, note: e.target.value })} placeholder="Contoh: 100 pcs" className="sm:col-span-2" /></div>
        <Button type="button" className="mt-3 w-full" onClick={() => need.title.trim() && add('wedding_needs', { title: need.title.trim(), amount: Number(need.amount) || 0, note: need.note }, () => setNeed({ title: '', amount: '', note: '' }))}>+ Tambah Kebutuhan</Button>
      </div>
      <div className="mt-3 grid max-h-[22rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{needs.map(item => <article key={item.id} className="rounded-xl border border-[#362b39] bg-[#17131a] p-3"><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#edd7e4]">{item.title}</p><p className="mt-0.5 truncate text-[11px] text-[#ad99a5]">{item.note || 'Tanpa catatan'}</p></div><span className="shrink-0 text-sm font-bold text-[#dcb6cc]">{fmt(item.amount)}</span></div><div className="mt-2 flex justify-end gap-1"><button type="button" onClick={() => openEdit('Edit Kebutuhan', 'wedding_needs', item.id, [{ key: 'title', label: 'Nama kebutuhan', value: item.title }, { key: 'amount', label: 'Nominal', value: String(item.amount), type: 'number' }, { key: 'note', label: 'Catatan', value: item.note }], values => ({ title: values.title.trim(), amount: Number(values.amount) || 0, note: values.note }))} className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#cdbbc6] hover:bg-white/5">Edit</button><button type="button" onClick={() => remove('wedding_needs', item.id)} className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#c38fa8] hover:bg-[#2a1c24]">Hapus</button></div></article>)}{!needs.length && <div className="sm:col-span-2"><Empty text="Belum ada kebutuhan lain." /></div>}</div>
    </Card>

    <Card title="Timeline" icon="🗓️">
      <div className="grid gap-3 sm:grid-cols-2"><Input value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })} placeholder="Contoh: Fitting baju" /><label><input type="date" value={event.date} onChange={e => setEvent({ ...event, date: e.target.value })} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest" /></label><Input value={event.note} onChange={e => setEvent({ ...event, note: e.target.value })} placeholder="Catatan" className="sm:col-span-2" /></div>
      <Button type="button" className="mt-3 w-full" onClick={() => event.title.trim() && event.date && add('wedding_timeline', { title: event.title.trim(), event_date: event.date, note: event.note }, () => setEvent({ title: '', date: '', note: '' }))}>+ Tambah Timeline</Button>
      <div className="mt-4 max-h-[25rem] space-y-0 overflow-y-auto pr-1">{timeline.map((item, index) => <div key={item.id} className="relative flex gap-3 pb-3 last:pb-0"><div className="flex w-10 shrink-0 flex-col items-center"><span className={`grid h-10 w-10 place-items-center rounded-xl border text-center leading-none ${item.done ? 'border-emerald-300/30 bg-emerald-50 text-emerald-500' : 'border-forest/25 bg-[#241d27] text-forest'}`}><b className="text-sm">{new Date(`${item.event_date}T00:00:00`).getDate()}</b><small className="-mt-1 text-[8px] font-bold uppercase">{new Date(`${item.event_date}T00:00:00`).toLocaleDateString('id-ID', { month: 'short' })}</small><small className="text-[7px] font-medium opacity-70">{new Date(`${item.event_date}T00:00:00`).getFullYear()}</small></span>{index < timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-forest/15" />}</div><article className={`min-w-0 flex-1 rounded-2xl border p-3 ${item.done ? 'border-forest/10 bg-white/50' : 'border-forest/15 bg-[#17131a]'}`}><div className="flex items-start gap-2"><input type="checkbox" checked={item.done} onChange={() => toggle('wedding_timeline', item.id, item.done)} className="mt-0.5 h-4 w-4 shrink-0 accent-pink-400" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className={`truncate text-sm font-bold ${item.done ? 'text-forest/45 line-through' : 'text-[#edd7e4]'}`}>{item.title}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.done ? 'bg-forest/10 text-forest/60' : 'bg-forest/10 text-forest'}`}>{relativeDay(item.event_date)}</span></div><p className="mt-1 text-[11px] text-forest/55">{new Date(`${item.event_date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>{item.note && <p className="mt-1 truncate text-xs text-[#ad99a5]">{item.note}</p>}</div></div><div className="mt-2 flex justify-end gap-1 border-t border-white/5 pt-2"><button type="button" onClick={() => openEdit('Edit Timeline', 'wedding_timeline', item.id, [{ key: 'title', label: 'Judul', value: item.title }, { key: 'event_date', label: 'Tanggal', value: item.event_date, type: 'date' }, { key: 'note', label: 'Catatan', value: item.note }], values => ({ title: values.title.trim(), event_date: values.event_date, note: values.note }))} className="rounded-md px-2 py-1 text-[11px] text-[#cdbbc6] hover:bg-white/5">Edit</button><button type="button" onClick={() => remove('wedding_timeline', item.id)} className="rounded-md px-2 py-1 text-[11px] text-[#c38fa8] hover:bg-[#2a1c24]">Hapus</button></div></article></div>)}{!timeline.length && <Empty text="Belum ada timeline." />}</div>
    </Card>
    {editing && <WeddingEditDialog title={editing.title} fields={editing.fields} onClose={() => setEditing(null)} onSave={async values => { await edit(editing.table, editing.id, editing.map(values)); setEditing(null) }} />}
  </div>
}
function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) { return <div className="min-w-0 rounded-xl bg-cream/70 p-3"><p className={`${small ? 'text-sm' : 'text-lg'} truncate font-bold text-forest`}>{value}</p><p className="text-[10px] text-forest/55">{label}</p></div> }
function Empty({ text }: { text: string }) { return <p className="py-5 text-center text-sm text-forest/45">{text}</p> }

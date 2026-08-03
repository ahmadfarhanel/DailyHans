import { useEffect, useState } from 'react'
import { getBills, addBill, toggleBill, deleteBill, type Bill } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'

const RECURRING = [
  { id: 'sekali', label: 'Sekali' },
  { id: 'bulanan', label: 'Bulanan' },
  { id: 'tahunan', label: 'Tahunan' },
]

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Bills() {
  const [items, setItems] = useState<Bill[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ name: '', amount: '', due_date: '', recurring: 'bulanan' })

  useEffect(() => { getBills().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name || !values.amount || !values.due_date) return
    const created = await addBill({
      name: values.name,
      amount: +values.amount,
      due_date: values.due_date,
      paid: false,
      recurring: values.recurring,
      category: 'lainnya'
    })
    if (created) setItems([created, ...items])
    reset()
    setShowForm(false)
  }

  const unpaidTotal = items.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)
  const overdueCount = items.filter(i => !i.paid && new Date(i.due_date) < new Date()).length

  return (
    <Card title="Tagihan" icon="📋" className="mb-6">
      {/* Summary */}
      <div className="mb-5 rounded-xl bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-400/80">Total Belum Dibayar</p>
            <p className="mt-1 text-2xl font-bold text-rose-300">{fmt(unpaidTotal)}</p>
          </div>
          {overdueCount > 0 && (
            <Badge variant="red">⚠️ {overdueCount} terlambat</Badge>
          )}
        </div>
      </div>

      {/* Add */}
      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tagihan" placeholder="Listrik" value={values.name} onChange={set('name')} required />
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="250000" value={values.amount} onChange={set('amount')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jatuh Tempo" type="date" value={values.due_date} onChange={set('due_date')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Periode</span>
              <select value={values.recurring} onChange={e => setValues({ ...values, recurring: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50">
                {RECURRING.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset() }}>Batal</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Tagihan</Button>
      )}

      {/* List */}
      <div className="space-y-2">
        {items.map(i => {
          const overdue = !i.paid && new Date(i.due_date) < new Date()
          return (
            <div key={i.id} className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.paid ? 'border-zinc-800/30 bg-zinc-900/20' : overdue ? 'border-rose-500/30 bg-rose-500/10' : 'border-zinc-800/60 bg-zinc-800/20 hover:bg-zinc-800/40'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${i.paid ? 'border-emerald-500 bg-emerald-500' : overdue ? 'border-rose-500' : 'border-zinc-600'}`}>
                  {i.paid && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <p className={`text-sm font-medium transition ${i.paid ? 'text-zinc-500 line-through' : overdue ? 'text-rose-300' : 'text-zinc-200'}`}>{i.name}</p>
                  <span className={`text-xs ${overdue ? 'text-rose-400' : 'text-zinc-500'}`}>Jatuh tempo: {i.due_date}</span>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <Badge variant={overdue ? 'red' : i.paid ? 'emerald' : 'default'}>{i.recurring}</Badge>
                <Button variant="danger" size="sm" onClick={() => { toggleBill(i.id, !i.paid); setItems(items.map(x => x.id === i.id ? { ...x, paid: !x.paid } : x)) }}>✓</Button>
                <Button variant="danger" size="sm" onClick={() => deleteBill(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <EmptyState icon="📋" message="Tidak ada tagihan" />}
      </div>
    </Card>
  )
}
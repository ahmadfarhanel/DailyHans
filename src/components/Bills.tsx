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
      name: values.name, amount: +values.amount, due_date: values.due_date,
      paid: false, recurring: values.recurring, category: 'lainnya'
    })
    if (created) setItems([created, ...items])
    reset(); setShowForm(false)
  }

  const unpaidTotal = items.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)

  return (
    <Card title="Tagihan" icon="📋" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-red-500">Total Belum Dibayar</p>
          <p className="text-xs text-forest/40">{items.length} tagihan</p>
        </div>
        <p className="mt-1 text-2xl font-bold text-forest">{fmt(unpaidTotal)}</p>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tagihan" placeholder="Listrik" value={values.name} onChange={set('name')} required />
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="250000" value={values.amount} onChange={set('amount')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jatuh Tempo" type="date" value={values.due_date} onChange={set('due_date')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Periode</span>
              <select value={values.recurring} onChange={e => setValues({ ...values, recurring: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
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

      <div className="space-y-2">
        {items.map(i => {
          const overdue = !i.paid && new Date(i.due_date) < new Date()
          return (
            <div key={i.id} className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.paid ? 'border-forest/5 bg-cream/50' : overdue ? 'border-red-200 bg-red-50' : 'border-forest/8 bg-white hover:bg-cream-dark'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${i.paid ? 'border-forest bg-forest' : overdue ? 'border-red-400' : 'border-forest/25'}`}>
                  {i.paid && <svg className="h-3 w-3 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <p className={`text-sm font-medium transition ${i.paid ? 'text-forest/40 line-through' : overdue ? 'text-red-600 dark:text-red-400' : 'text-forest'}`}>{i.name}</p>
                  <span className={`text-xs ${overdue ? 'text-red-500' : 'text-forest/40'}`}>Jatuh tempo: {i.due_date}</span>
                </div>
              </label>
              <div className="flex items-center gap-1">
                <Badge variant={overdue ? 'danger' : i.paid ? 'success' : 'default'}>{i.recurring}</Badge>
                <Button variant="success" size="sm" onClick={() => { toggleBill(i.id, !i.paid); setItems(items.map(x => x.id === i.id ? { ...x, paid: !x.paid } : x)) }}>✓</Button>
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

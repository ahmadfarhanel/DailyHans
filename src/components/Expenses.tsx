import { useEffect, useState } from 'react'
import { getExpenses, addExpense, deleteExpense, type Expense } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'

const CATS = [
  { id: 'makanan', icon: '🍜', color: 'warning' },
  { id: 'transport', icon: '🚗', color: 'info' },
  { id: 'rumah', icon: '🏠', color: 'success' },
  { id: 'belanja', icon: '🛍️', color: 'gold' },
  { id: 'hiburan', icon: '🎬', color: 'danger' },
  { id: 'kesehatan', icon: '💊', color: 'warning' },
  { id: 'tagihan', icon: '📄', color: 'default' },
  { id: 'lainnya', icon: '📦', color: 'default' },
] as const

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ amount: '', category: 'makanan', description: '' })

  useEffect(() => { getExpenses().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.amount) return
    const created = await addExpense({ amount: +values.amount, category: values.category, description: values.description, date: new Date().toISOString().slice(0, 10) })
    if (created) setItems([created, ...items])
    reset(); setShowForm(false)
  }

  const total = items.reduce((s, i) => s + i.amount, 0)
  const catInfo = (c: string) => CATS.find(x => x.id === c) || CATS[7]

  return (
    <Card title="Pengeluaran" icon="💰" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-gold/15 via-gold/10 to-gold/5 border border-gold/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-amber-700">Total Bulan Ini</p>
          <p className="text-xs text-forest/40">{items.length} transaksi</p>
        </div>
        <p className="mt-1 text-2xl font-bold text-forest">{fmt(total)}</p>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="50000" value={values.amount} onChange={set('amount')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Kategori</span>
              <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
              </select>
            </label>
          </div>
          <Input label="Deskripsi" placeholder="Beli sayur di pasar" value={values.description} onChange={set('description')} />
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset() }}>Batal</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Pengeluaran</Button>
      )}

      <div className="space-y-2">
        {items.map(i => {
          const cat = catInfo(i.category)
          return (
            <div key={i.id} className="group flex items-center justify-between rounded-xl border border-forest/8 bg-white px-4 py-3 transition hover:bg-cream-dark hover:border-forest/12">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg">{cat.icon}</div>
                <div>
                  <p className="text-sm font-medium text-forest">{i.description || i.category}</p>
                  <Badge variant={cat.color as any}>{i.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-forest">{fmt(i.amount)}</span>
                <Button variant="danger" size="sm" onClick={() => deleteExpense(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <EmptyState icon="💸" message="Belum ada pengeluaran" />}
      </div>
    </Card>
  )
}

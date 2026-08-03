import { useEffect, useState } from 'react'
import { getExpenses, addExpense, deleteExpense, type Expense } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'

const CATS = [
  { id: 'makanan', icon: '🍜', color: 'amber' },
  { id: 'transport', icon: '🚗', color: 'sky' },
  { id: 'rumah', icon: '🏠', color: 'emerald' },
  { id: 'belanja', icon: '🛍️', color: 'violet' },
  { id: 'hiburan', icon: '🎬', color: 'pink' },
  { id: 'kesehatan', icon: '💊', color: 'red' },
  { id: 'tagihan', icon: '📄', color: 'orange' },
  { id: 'lainnya', icon: '📦', color: 'zinc' },
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
    const created = await addExpense({
      amount: +values.amount,
      category: values.category,
      description: values.description,
      date: new Date().toISOString().slice(0, 10)
    })
    if (created) setItems([created, ...items])
    reset()
    setShowForm(false)
  }

  const total = items.reduce((s, i) => s + i.amount, 0)
  const catInfo = (c: string) => CATS.find(x => x.id === c) || CATS[7]

  return (
    <Card title="Pengeluaran" icon="💰" className="mb-6">
      {/* Summary */}
      <div className="mb-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-400/80">Total Bulan Ini</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">{fmt(total)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">{items.length} transaksi</p>
          </div>
        </div>
      </div>

      {/* Add Button / Form */}
      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="50000" value={values.amount} onChange={set('amount')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Kategori</span>
              <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50">
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

      {/* List */}
      <div className="space-y-2">
        {items.map(i => {
          const cat = catInfo(i.category)
          return (
            <div key={i.id} className="group flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-800/20 px-4 py-3 transition hover:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-lg">{cat.icon}</div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{i.description || i.category}</p>
                  <Badge variant={cat.color === 'zinc' ? 'default' : 'emerald'}>{i.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-zinc-200">{fmt(i.amount)}</span>
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
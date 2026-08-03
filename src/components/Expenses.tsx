import { useEffect, useState } from 'react'
import { getExpenses, addExpense, deleteExpense, type Expense } from '../lib/db'
import { Card, Input, Button, useForm } from './ui'

const CATS = ['makanan', 'transport', 'rumah', 'belanja', 'hiburan', 'kesehatan', 'tagihan', 'lainnya']

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([])
  const { values, setValues, set, reset } = useForm({ amount: '', category: 'makanan', description: '' })

  useEffect(() => { getExpenses().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.amount) return
    const created = await addExpense({ amount: +values.amount, category: values.category, description: values.description, date: new Date().toISOString().slice(0, 10) })
    if (created) setItems([created, ...items])
    reset()
  }

  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <Card title="Pengeluaran">
      <form onSubmit={submit} className="mb-4 grid grid-cols-2 gap-2">
        <Input label="Jumlah (Rp)" type="number" min="1" placeholder="50000" value={values.amount} onChange={set('amount')} required />
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">Kategori</span>
          <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500">
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className="col-span-2">
          <Input label="Deskripsi" placeholder="Beli sayur di pasar" value={values.description} onChange={set('description')} />
        </div>
        <div className="col-span-2">
          <Button type="submit" className="w-full">+ Tambah</Button>
        </div>
      </form>
      <div className="mb-3 flex justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-sm">
        <span className="text-emerald-300">Total bulan ini</span>
        <span className="font-semibold text-emerald-300">{fmt(total)}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map(i => (
          <li key={i.id} className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm">
            <div>
              <span className="font-medium">{i.description || i.category}</span>
              <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{i.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{fmt(i.amount)}</span>
              <Button variant="danger" onClick={() => deleteExpense(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-center text-sm text-zinc-500">Belum ada pengeluaran</li>}
      </ul>
    </Card>
  )
}

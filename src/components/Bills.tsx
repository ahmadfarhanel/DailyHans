import { useEffect, useState } from 'react'
import { getBills, addBill, toggleBill, deleteBill, type Bill } from '../lib/db'
import { Card, Input, Button, useForm } from './ui'

const RECURRING = ['sekali', 'bulanan', 'tahunan']
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Bills() {
  const [items, setItems] = useState<Bill[]>([])
  const { values, setValues, set, reset } = useForm({ name: '', amount: '', due_date: '', recurring: 'bulanan' })

  useEffect(() => { getBills().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name || !values.amount || !values.due_date) return
    const created = await addBill({ name: values.name, amount: +values.amount, due_date: values.due_date, paid: false, recurring: values.recurring, category: 'lainnya' })
    if (created) setItems([created, ...items])
    reset()
  }

  return (
    <Card title="Tagihan">
      <form onSubmit={submit} className="mb-4 grid grid-cols-2 gap-2">
        <Input label="Nama tagihan" placeholder="Listrik, internet..." value={values.name} onChange={set('name')} required />
        <Input label="Jumlah (Rp)" type="number" min="1" placeholder="250000" value={values.amount} onChange={set('amount')} required />
        <Input label="Jatuh tempo" type="date" value={values.due_date} onChange={set('due_date')} required />
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-400">Periode</span>
          <select value={values.recurring} onChange={e => setValues({ ...values, recurring: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500">
            {RECURRING.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <div className="col-span-2">
          <Button type="submit" className="w-full">+ Tambah Tagihan</Button>
        </div>
      </form>
      <ul className="space-y-1.5">
        {items.map(i => {
          const overdue = !i.paid && new Date(i.due_date) < new Date()
          return (
            <li key={i.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${i.paid ? 'border-zinc-800/40' : overdue ? 'border-red-500/40 bg-red-500/10' : 'border-zinc-800'}`}>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={i.paid} onChange={() => toggleBill(i.id, !i.paid).then(() => setItems(items.map(x => x.id === i.id ? { ...x, paid: !x.paid } : x)))} className="accent-emerald-500" />
                <div>
                  <span className={i.paid ? 'text-zinc-500 line-through' : ''}>{i.name}</span>
                  <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${overdue ? 'bg-red-500/20 text-red-300' : 'bg-zinc-800 text-zinc-400'}`}>{i.recurring}</span>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${overdue ? 'text-red-300' : ''}`}>{fmt(i.amount)}</span>
                <span className="text-xs text-zinc-500">{i.due_date}</span>
                <Button variant="danger" onClick={() => deleteBill(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
              </div>
            </li>
          )
        })}
        {items.length === 0 && <li className="py-6 text-center text-sm text-zinc-500">Tidak ada tagihan</li>}
      </ul>
    </Card>
  )
}
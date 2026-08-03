import { useEffect, useState } from 'react'
import { getShopping, addShopping, toggleShopping, deleteShopping, type ShoppingItem } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'

const CATS = [
  { id: 'umum', icon: '📦', color: 'zinc' },
  { id: 'sayur', icon: '🥬', color: 'emerald' },
  { id: 'daging', icon: '🍖', color: 'red' },
  { id: 'minuman', icon: '🧃', color: 'sky' },
  { id: 'snack', icon: '🍪', color: 'amber' },
  { id: 'kebutuhan', icon: '🧴', color: 'violet' },
] as const

export default function Shopping() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ name: '', quantity: '1', category: 'umum' })

  useEffect(() => { getShopping().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name) return
    const created = await addShopping({ name: values.name, quantity: values.quantity, category: values.category })
    if (created) setItems([created, ...items])
    reset()
    setShowForm(false)
  }

  const boughtCount = items.filter(i => i.bought).length
  const catInfo = (c: string) => CATS.find(x => x.id === c) || CATS[0]

  return (
    <Card title="Belanja" icon="🛒" className="mb-6">
      {/* Summary */}
      <div className="mb-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-violet-300">{boughtCount}/{items.length} sudah dibeli</p>
          <Badge variant={boughtCount === items.length && items.length > 0 ? 'emerald' : 'default'}>
            {items.length === 0 ? 'Kosong' : boughtCount === items.length ? 'Selesai!' : `${items.length - boughtCount} lagi`}
          </Badge>
        </div>
      </div>

      {/* Add */}
      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
          <Input label="Item" placeholder="Beras 5kg..." value={values.name} onChange={set('name')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Qty" value={values.quantity} onChange={set('quantity')} />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Kategori</span>
              <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50">
                {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset() }}>Batal</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Item</Button>
      )}

      {/* List */}
      <div className="space-y-2">
        {items.map(i => {
          const cat = catInfo(i.category)
          return (
            <div key={i.id} className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.bought ? 'border-zinc-800/30 bg-zinc-900/20' : 'border-zinc-800/60 bg-zinc-800/20 hover:bg-zinc-800/40'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${i.bought ? 'border-violet-500 bg-violet-500' : 'border-zinc-600'}`}>
                  {i.bought && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <p className={`text-sm font-medium transition ${i.bought ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{i.name}</p>
                  <span className="text-xs text-zinc-500">qty: {i.quantity}</span>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <Badge>{cat.icon} {cat.id}</Badge>
                <Button variant="danger" size="sm" onClick={() => { toggleShopping(i.id, !i.bought); setItems(items.map(x => x.id === i.id ? { ...x, bought: !x.bought } : x)) }}>✓</Button>
                <Button variant="danger" size="sm" onClick={() => deleteShopping(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <EmptyState icon="🛒" message="Belanja kosong" />}
      </div>
    </Card>
  )
}
import { useEffect, useState } from 'react'
import { getShopping, addShopping, toggleShopping, deleteShopping, type ShoppingItem } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'

const CATS = [
  { id: 'umum', icon: '📦', color: 'default' },
  { id: 'sayur', icon: '🥬', color: 'success' },
  { id: 'daging', icon: '🍖', color: 'danger' },
  { id: 'minuman', icon: '🧃', color: 'info' },
  { id: 'snack', icon: '🍪', color: 'gold' },
  { id: 'kebutuhan', icon: '🧴', color: 'warning' },
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
    reset(); setShowForm(false)
  }

  const boughtCount = items.filter(i => i.bought).length

  return (
    <Card title="Belanja" icon="🛒" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-forest/8 to-forest/5 border border-forest/12 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-forest">{boughtCount}/{items.length} sudah dibeli</p>
          <Badge variant={boughtCount === items.length && items.length > 0 ? 'success' : 'default'}>
            {items.length === 0 ? 'Kosong' : boughtCount === items.length ? 'Selesai!' : `${items.length - boughtCount} lagi`}
          </Badge>
        </div>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <Input label="Item" placeholder="Beras 5kg..." value={values.name} onChange={set('name')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Qty" value={values.quantity} onChange={set('quantity')} />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">Kategori</span>
              <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
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

      <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
        {items.map(i => (
          <div key={i.id} className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.bought ? 'border-forest/5 bg-cream/50' : 'border-forest/8 bg-white hover:bg-cream-dark'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${i.bought ? 'border-forest bg-forest' : 'border-forest/25'}`}>
                {i.bought && <svg className="h-3 w-3 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div>
                <p className={`text-sm font-medium transition ${i.bought ? 'text-forest/65 line-through' : 'text-forest'}`}>{i.name}</p>
                <span className="text-xs text-forest/65">qty: {i.quantity}</span>
              </div>
            </label>
            <div className="flex items-center gap-1">
              <Button variant="success" size="sm" onClick={() => { toggleShopping(i.id, !i.bought); setItems(items.map(x => x.id === i.id ? { ...x, bought: !x.bought } : x)) }}>✓</Button>
              <Button variant="danger" size="sm" onClick={() => deleteShopping(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <EmptyState icon="🛒" message="Belanja kosong" />}
      </div>
    </Card>
  )
}
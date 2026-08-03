import { useEffect, useState } from 'react'
import { getShopping, addShopping, toggleShopping, deleteShopping, type ShoppingItem } from '../lib/db'
import { Card, Input, Button, useForm } from './ui'

export default function Shopping() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const { values, set, reset } = useForm({ name: '', quantity: '1', category: 'umum' })

  useEffect(() => { getShopping().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name) return
    const created = await addShopping({ name: values.name, quantity: values.quantity, category: values.category })
    if (created) setItems([created, ...items])
    reset()
  }

  return (
    <Card title="Belanja">
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <Input placeholder="Beras 5kg..." value={values.name} onChange={set('name')} required />
        <Input placeholder="qty" className="w-16" value={values.quantity} onChange={set('quantity')} />
        <Button type="submit">+</Button>
      </form>
      <ul className="space-y-1.5">
        {items.map(i => (
          <li key={i.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${i.bought ? 'border-zinc-800/40 bg-transparent' : 'border-zinc-800'}`}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={i.bought} onChange={() => toggleShopping(i.id, !i.bought).then(() => setItems(items.map(x => x.id === i.id ? { ...x, bought: !x.bought } : x)))} className="accent-emerald-500" />
              <span className={i.bought ? 'text-zinc-500 line-through' : ''}>
                {i.name} <span className="text-zinc-500">({i.quantity})</span>
              </span>
            </label>
            <Button variant="danger" onClick={() => deleteShopping(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-center text-sm text-zinc-500">Belanja kosong</li>}
      </ul>
    </Card>
  )
}

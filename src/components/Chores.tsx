import { useEffect, useState } from 'react'
import { getChores, addChore, toggleChore, deleteChore, type Chore } from '../lib/db'
import { Card, Input, Button, useForm } from './ui'

export default function Chores() {
  const [items, setItems] = useState<Chore[]>([])
  const { values, set, reset } = useForm({ title: '', assignee: '' })

  useEffect(() => { getChores().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.title) return
    const created = await addChore({ title: values.title, assignee: values.assignee, repeat_days: 0 })
    if (created) setItems([created, ...items])
    reset()
  }

  return (
    <Card title="Tugas Rumah">
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <Input placeholder="Cuci piring..." value={values.title} onChange={set('title')} required />
        <Input placeholder="Siapa?" className="w-28" value={values.assignee} onChange={set('assignee')} />
        <Button type="submit">+</Button>
      </form>
      <ul className="space-y-1.5">
        {items.map(i => (
          <li key={i.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${i.done ? 'border-zinc-800/40 bg-transparent' : 'border-zinc-800'}`}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={i.done} onChange={() => toggleChore(i.id, !i.done).then(() => setItems(items.map(x => x.id === i.id ? { ...x, done: !x.done } : x)))} className="accent-emerald-500" />
              <span className={i.done ? 'text-zinc-500 line-through' : ''}>{i.title}</span>
            </label>
            <div className="flex items-center gap-2">
              {i.assignee && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-300">{i.assignee}</span>}
              <Button variant="danger" onClick={() => deleteChore(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="py-6 text-center text-sm text-zinc-500">Tidak ada tugas</li>}
      </ul>
    </Card>
  )
}

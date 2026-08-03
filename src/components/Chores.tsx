import { useEffect, useState } from 'react'
import { getChores, addChore, toggleChore, deleteChore, type Chore } from '../lib/db'
import { Card, Input, Button, useForm, EmptyState } from './ui'

const ASSIGNEES = ['🧑 Papa', '👩 Mama', '👶 Anak', '🧹 Semua']

export default function Chores() {
  const [items, setItems] = useState<Chore[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ title: '', assignee: '' })

  useEffect(() => { getChores().then(setItems) }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.title) return
    const created = await addChore({ title: values.title, assignee: values.assignee, repeat_days: 0 })
    if (created) setItems([created, ...items])
    reset(); setShowForm(false)
  }

  const doneCount = items.filter(i => i.done).length

  return (
    <Card title="Tugas Rumah" icon="✅" className="mb-6">
      <div className="mb-5 rounded-xl bg-cream border border-forest/8 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-forest/60">Progres</p>
          <p className="text-xs text-forest/40">{doneCount}/{items.length} selesai</p>
        </div>
        <div className="h-2.5 rounded-full bg-forest/8 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-forest to-gold transition-all duration-500"
            style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : '0%' }} />
        </div>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <Input label="Tugas" placeholder="Cuci piring..." value={values.title} onChange={set('title')} required />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Ditugaskan</span>
            <select value={values.assignee} onChange={e => setValues({ ...values, assignee: e.target.value })}
              className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
              <option value="">— pilih —</option>
              {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset() }}>Batal</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Tugas</Button>
      )}

      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.done ? 'border-forest/5 bg-cream/50' : 'border-forest/8 bg-white hover:bg-cream-dark'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${i.done ? 'border-forest bg-forest' : 'border-forest/25'}`}>
                {i.done && <svg className="h-3 w-3 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div>
                <p className={`text-sm font-medium transition ${i.done ? 'text-forest/40 line-through' : 'text-forest'}`}>{i.title}</p>
                {i.assignee && <span className="text-xs text-forest/40">{i.assignee}</span>}
              </div>
            </label>
            <div className="flex items-center gap-1">
              <Button variant="success" size="sm" onClick={() => { toggleChore(i.id, !i.done); setItems(items.map(x => x.id === i.id ? { ...x, done: !x.done } : x)) }}>✓</Button>
              <Button variant="danger" size="sm" onClick={() => deleteChore(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <EmptyState icon="🏠" message="Tidak ada tugas" />}
      </div>
    </Card>
  )
}

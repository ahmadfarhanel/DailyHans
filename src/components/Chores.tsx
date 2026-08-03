import { useEffect, useState } from 'react'
import { getChores, addChore, deleteChore, toggleChore, type Chore } from '../lib/db'
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
    reset()
    setShowForm(false)
  }

  const doneCount = items.filter(i => i.done).length

  return (
    <Card title="Tugas Rumah" icon="✅" className="mb-6">
      {/* Progress bar */}
      <div className="mb-5 rounded-xl bg-zinc-800/30 border border-zinc-800/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-sky-400/80">Progres</p>
          <p className="text-xs text-zinc-500">{doneCount}/{items.length} selesai</p>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* Add */}
      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
          <Input label="Tugas" placeholder="Cuci piring..." value={values.title} onChange={set('title')} required />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Ditugaskan</span>
            <select value={values.assignee} onChange={e => setValues({ ...values, assignee: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50">
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

      {/* List */}
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.done ? 'border-zinc-800/30 bg-zinc-900/20' : 'border-zinc-800/60 bg-zinc-800/20 hover:bg-zinc-800/40'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${i.done ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600'}`}>
                {i.done && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div>
                <p className={`text-sm font-medium transition ${i.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{i.title}</p>
                {i.assignee && <span className="text-xs text-zinc-500">{i.assignee}</span>}
              </div>
            </label>
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={() => { toggleChore(i.id, !i.done); setItems(items.map(x => x.id === i.id ? { ...x, done: !x.done } : x)) }}>✓</Button>
              <Button variant="danger" size="sm" onClick={() => deleteChore(i.id).then(() => setItems(items.filter(x => x.id !== i.id)))}>✕</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <EmptyState icon="🏠" message="Tidak ada tugas" />}
      </div>
    </Card>
  )
}
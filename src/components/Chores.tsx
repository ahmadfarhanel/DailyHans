import { useEffect, useState } from 'react'
import { getChores, addChore, toggleChore, deleteChore, type Chore } from '../lib/db'
import { Card, Input, Button, useForm, EmptyState } from './ui'
import ConfirmDialog from './ConfirmDialog'

const MEMBERS = ['Papa', 'Mama', 'Anak', 'Lainnya']

export default function Chores() {
  const [items, setItems] = useState<Chore[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ title: '', assignee: '', added_by: '' })
  const [confirmAdd, setConfirmAdd] = useState<{ title: string; assignee: string; added_by: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Chore | null>(null)

  useEffect(() => { getChores().then(setItems) }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.title) return
    setConfirmAdd({ title: values.title, assignee: values.assignee, added_by: values.added_by })
  }

  const doAdd = async () => {
    if (!confirmAdd) return
    const created = await addChore({ ...confirmAdd })
    if (created) setItems([created, ...items])
    setConfirmAdd(null); reset(); setShowForm(false)
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    await deleteChore(confirmDelete.id)
    setItems(items.filter(x => x.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const doneCount = items.filter(i => i.done).length
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0

  return (
    <Card title="Tugas Rumah" icon="✅" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-forest/10 to-gold/5 border border-forest/15 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-forest/70">Progress</p>
          <p className="text-xs text-forest/65">{doneCount}/{items.length}</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-cream overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-forest to-forest-light transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <Input label="Nama Tugas" placeholder="Sapu lantai" value={values.title} onChange={set('title')} required />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">Ditugaskan Kepada</span>
              <select value={values.assignee} onChange={e => setValues({ ...values, assignee: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                <option value="">— pilih —</option>
                {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">Ditambahkan oleh</span>
              <select value={values.added_by} onChange={e => setValues({ ...values, added_by: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                <option value="">— pilih —</option>
                {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset() }}>Batal</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Tugas</Button>
      )}

      <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
        {items.map(i => (
          <div key={i.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${i.done ? 'border-forest/8 bg-cream/50' : 'border-forest/8 bg-white'}`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <input type="checkbox" checked={i.done} onChange={() => { toggleChore(i.id, !i.done); setItems(items.map(x => x.id === i.id ? { ...x, done: !x.done } : x)) }}
                className="h-4 w-4 rounded accent-forest" />
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${i.done ? 'text-forest/65 line-through' : 'text-forest'}`}>{i.title}</p>
                {(i as any).assignee && <span className="text-[10px] text-forest/60">ditugaskan: {(i as any).assignee}</span>}
                {(i as any).added_by && <span className="text-[10px] text-forest/60 ml-2">oleh {(i as any).added_by}</span>}
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(i)} className="ml-2">🗑️</Button>
          </div>
        ))}
        {items.length === 0 && <EmptyState icon="✅" message="Belum ada tugas" />}
      </div>

      {/* Confirm Add */}
      <ConfirmDialog
        open={!!confirmAdd}
        title="Konfirmasi Tambah Tugas"
        message={`Tugas: ${confirmAdd?.title}\nDitugaskan: ${confirmAdd?.assignee || '-'}\nDitambahkan oleh: ${confirmAdd?.added_by || '-'}`}
        confirmLabel="Ya, Tambah"
        variant="info"
        onConfirm={doAdd}
        onCancel={() => setConfirmAdd(null)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message={`Hapus tugas "${confirmDelete?.title}"?`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  )
}
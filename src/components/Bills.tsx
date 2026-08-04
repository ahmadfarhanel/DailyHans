import { useEffect, useState } from 'react'
import { getBills, addBill, toggleBill, deleteBill, type Bill } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'
import ConfirmDialog from './ConfirmDialog'
import { jakartaToday } from '../lib/date'

const CATS = ['listrik', 'air', 'internet', 'sewa', 'asuransi', 'cicilan', 'lainnya']
const MEMBERS = ['Papa', 'Mama', 'Anak', 'Lainnya']
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Bills() {
  const [items, setItems] = useState<Bill[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ name: '', amount: '', category: 'listrik', due_date: jakartaToday(), recurring: 'bulanan', added_by: '' })
  const [confirmDelete, setConfirmDelete] = useState<Bill | null>(null)
  const [confirmAdd, setConfirmAdd] = useState<{ name: string; amount: number; category: string; due_date: string; recurring: string; added_by: string } | null>(null)

  useEffect(() => { getBills().then(setItems) }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.amount || !values.name) return
    setConfirmAdd({
      name: values.name,
      amount: +values.amount,
      category: values.category,
      due_date: values.due_date,
      recurring: values.recurring,
      added_by: values.added_by,
    })
  }

  const doAdd = async () => {
    if (!confirmAdd) return
    const created = await addBill({ ...confirmAdd, paid: false })
    if (created) setItems([...items, created])
    setConfirmAdd(null); reset(); setShowForm(false)
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    await deleteBill(confirmDelete.id)
    setItems(items.filter(x => x.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const unpaidTotal = items.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)

  return (
    <Card title="Tagihan" icon="📋" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 p-4">
        <p className="text-xs font-medium text-red-600">Belum Dibayar</p>
        <p className="mt-1 font-bold text-red-500 overflow-hidden" style={{ fontSize: 'clamp(11px, 3.8vw, 20px)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{fmt(unpaidTotal)}</p>
        <p className="text-[10px] text-red-400">{items.filter(i => !i.paid).length} tagihan tertunda</p>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <Input label="Nama Tagihan" placeholder="PLN" value={values.name} onChange={set('name')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="500000" value={values.amount} onChange={set('amount')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Kategori</span>
              <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Jatuh Tempo</span>
              <input type="date" value={values.due_date} onChange={e => setValues({ ...values, due_date: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Perulangan</span>
              <select value={values.recurring} onChange={e => setValues({ ...values, recurring: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                <option value="sekali">Sekali</option>
                <option value="bulanan">Bulanan</option>
                <option value="3bulan">3 Bulan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Ditambahkan oleh</span>
            <select value={values.added_by} onChange={e => setValues({ ...values, added_by: e.target.value })}
              className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
              <option value="">— pilih —</option>
              {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1">Simpan</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset() }}>Batal</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Tagihan</Button>
      )}

      <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
        {items.map(i => {
          const overdue = !i.paid && new Date(i.due_date) < new Date()
          return (
            <div key={i.id} className={`rounded-xl border px-4 py-3 transition hover:bg-cream-dark ${overdue ? 'border-red-200 bg-red-50' : 'border-forest/8 bg-white'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={i.paid} onChange={() => { toggleBill(i.id, !i.paid); setItems(items.map(x => x.id === i.id ? { ...x, paid: !x.paid } : x)) }}
                      className="h-4 w-4 rounded accent-forest shrink-0" />
                    <p className={`text-sm font-medium truncate ${i.paid ? 'text-forest/40 line-through' : 'text-forest'}`}>{i.name}</p>
                  </div>
                  <div className="mt-1.5 ml-6 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge variant={overdue ? 'danger' : i.paid ? 'success' : 'default'}>{i.recurring}</Badge>
                    <span className="text-[10px] text-forest/35">{i.due_date}</span>
                    {(i as any).added_by && <span className="text-[10px] text-forest/30">oleh {(i as any).added_by}</span>}
                    <span className={`text-sm font-bold ${i.paid ? 'text-emerald-500 line-through' : 'text-forest'}`}>{fmt(i.amount)}</span>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(i)} className="shrink-0 mt-0.5">🗑️</Button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <EmptyState icon="📋" message="Belum ada tagihan" />}
      </div>

      {/* Confirm Add */}
      <ConfirmDialog
        open={!!confirmAdd}
        title="Konfirmasi Tambah Tagihan"
        message={`Tagihan: ${confirmAdd?.name}\nJumlah: ${fmt(confirmAdd?.amount || 0)}\nKategori: ${confirmAdd?.category}\nJatuh Tempo: ${confirmAdd?.due_date}\nPerulangan: ${confirmAdd?.recurring}`}
        confirmLabel="Ya, Tambah"
        variant="info"
        onConfirm={doAdd}
        onCancel={() => setConfirmAdd(null)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message={`Hapus tagihan "${confirmDelete?.name}" sebesar ${fmt(confirmDelete?.amount || 0)}?`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  )
}
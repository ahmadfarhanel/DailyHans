import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'
import ConfirmDialog from './ConfirmDialog'
import { jakartaToday } from '../lib/date'

type Income = { id: string; amount: number; source: string; description: string; date: string; added_by: string }

const SOURCES = ['gaji', 'bonus', 'bisnis', 'investasi', 'hadiah', 'lainnya']
const MEMBERS = ['Papa', 'Mama', 'Anak', 'Lainnya']
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const label = (value: string) => value ? value[0].toUpperCase() + value.slice(1) : '-'

export default function IncomeTab() {
  const [items, setItems] = useState<Income[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ amount: '', source: 'gaji', description: '', added_by: '', date: jakartaToday() })

  const [confirmAdd, setConfirmAdd] = useState<{ amount: number; source: string; description: string; added_by: string; date: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Income | null>(null)

  useEffect(() => {
    supabase.from('income').select('*').order('date', { ascending: false }).then(({ data }) => setItems((data || []) as Income[]))
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.amount) return
    setConfirmAdd({
      amount: +values.amount,
      source: values.source,
      description: values.description,
      added_by: values.added_by,
      date: values.date,
    })
  }

  const confirmAddIncome = async () => {
    if (!confirmAdd) return
    const { data } = await supabase.from('income').insert({
      amount: confirmAdd.amount,
      source: confirmAdd.source,
      description: confirmAdd.description,
      added_by: confirmAdd.added_by || null,
      date: confirmAdd.date,
    }).select().single()
    if (data) setItems([data as Income, ...items])
    setConfirmAdd(null)
    reset(); setShowForm(false)
  }

  const confirmDeleteIncome = async () => {
    if (!confirmDelete) return
    await supabase.from('income').delete().eq('id', confirmDelete.id)
    setItems(items.filter(x => x.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <Card title="Pemasukan" icon="📈" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-forest/10 to-gold/5 border border-forest/15 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-forest/70">Total Pemasukan</p>
          <p className="text-xs text-forest/40">{items.length} transaksi</p>
        </div>
        <p className="mt-1 text-2xl font-bold text-forest">{fmt(total)}</p>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="5000000" value={values.amount} onChange={set('amount')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Sumber</span>
              <select value={values.source} onChange={e => setValues({ ...values, source: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                {SOURCES.map(s => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </label>
          </div>
          <Input label="Deskripsi" placeholder="Gaji bulan Agustus" value={values.description} onChange={set('description')} />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Tanggal</span>
              <input type="date" value={values.date} onChange={e => setValues({ ...values, date: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Ditambahkan oleh</span>
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
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Pemasukan</Button>
      )}

      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="group flex items-center gap-3 rounded-xl border border-forest/8 bg-white px-4 py-3 transition hover:bg-cream-dark">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-forest">{i.description || label(i.source)}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge variant="success">{label(i.source)}</Badge>
                {i.added_by && <span className="text-[10px] text-forest/35">Oleh {i.added_by}</span>}
                <span className="text-[10px] text-forest/30">{i.date}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="max-w-24 truncate text-sm font-semibold text-emerald-600 sm:max-w-none">+{fmt(i.amount)}</span>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(i)}>🗑️</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <EmptyState icon="📈" message="Belum ada pemasukan" />}
      </div>

      {/* Confirm Add */}
      <ConfirmDialog
        open={!!confirmAdd}
        title="Konfirmasi Tambah Pemasukan"
        message={`Sumber: ${label(confirmAdd?.source || '')}\nJumlah: ${fmt(confirmAdd?.amount || 0)}\nDeskripsi: ${confirmAdd?.description || '-'}\nTanggal: ${confirmAdd?.date}\nDitambahkan oleh: ${confirmAdd?.added_by || '-'}`}
        confirmLabel="Ya, Tambah"
        variant="info"
        onConfirm={confirmAddIncome}
        onCancel={() => setConfirmAdd(null)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message={`Hapus pemasukan "${confirmDelete?.description || confirmDelete?.source}" sebesar ${fmt(confirmDelete?.amount || 0)}?`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={confirmDeleteIncome}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  )
}
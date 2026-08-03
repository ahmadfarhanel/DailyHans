import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'

type Income = { id: string; amount: number; source: string; description: string; date: string; added_by: string }

const SOURCES = ['gaji', 'bonus', 'bisnis', 'investasi', 'hadiah', 'lainnya']
const MEMBERS = ['Papa', 'Mama', 'Anak', 'Lainnya']
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function IncomeTab() {
  const [items, setItems] = useState<Income[]>([])
  const [showForm, setShowForm] = useState(false)
  const { values, setValues, set, reset } = useForm({ amount: '', source: 'gaji', description: '', added_by: '' })

  useEffect(() => {
    supabase.from('income').select('*').order('date', { ascending: false }).then(({ data }) => setItems((data || []) as Income[]))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.amount) return
    const { data } = await supabase.from('income').insert({
      amount: +values.amount,
      source: values.source,
      description: values.description,
      added_by: values.added_by || null,
      date: new Date().toISOString().slice(0, 10),
    }).select().single()
    if (data) setItems([data as Income, ...items])
    reset(); setShowForm(false)
  }

  const del = async (id: string) => {
    await supabase.from('income').delete().eq('id', id)
    setItems(items.filter(x => x.id !== id))
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
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <Input label="Deskripsi" placeholder="Gaji bulan Agustus" value={values.description} onChange={set('description')} />
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
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Pemasukan</Button>
      )}

      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="group flex items-center justify-between rounded-xl border border-forest/8 bg-white px-4 py-3 transition hover:bg-cream-dark">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-forest truncate">{i.description || i.source}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="success">{i.source}</Badge>
                {i.added_by && <span className="text-[10px] text-forest/35 shrink-0">oleh {i.added_by}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="font-semibold text-emerald-600 whitespace-nowrap">+{fmt(i.amount)}</span>
              <Button variant="danger" size="sm" onClick={() => del(i.id)}>✕</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <EmptyState icon="📈" message="Belum ada pemasukan" />}
      </div>
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { getPlans, addPlan, updatePlanStatus, deletePlan, type Plan } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'
import ConfirmDialog from './ConfirmDialog'
import { jakartaToday } from '../lib/date'

const MEMBERS = ['Papa', 'Mama', 'Anak', 'Lainnya']
const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function Plans() {
  const [items, setItems] = useState<Plan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'semua' | 'mendatang' | 'selesai' | 'dibatalkan'>('semua')
  const { values, setValues, set, reset } = useForm({
    title: '',
    date: jakartaToday(),
    location: '',
    budget: '',
    description: '',
    added_by: ''
  })
  const [confirmAdd, setConfirmAdd] = useState<{
    title: string
    date: string
    location: string
    budget: number
    description: string
    added_by: string
  } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null)

  useEffect(() => {
    getPlans().then(setItems)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.title || !values.date) return
    setConfirmAdd({
      title: values.title,
      date: values.date,
      location: values.location,
      budget: values.budget ? +values.budget : 0,
      description: values.description,
      added_by: values.added_by
    })
  }

  const doAdd = async () => {
    if (!confirmAdd) return
    const created = await addPlan({
      title: confirmAdd.title,
      date: confirmAdd.date,
      location: confirmAdd.location,
      budget: confirmAdd.budget,
      description: confirmAdd.description,
      added_by: confirmAdd.added_by
    })
    if (created) setItems([created, ...items])
    setConfirmAdd(null)
    reset()
    setShowForm(false)
  }

  const doChangeStatus = async (id: string, status: Plan['status']) => {
    await updatePlanStatus(id, status)
    setItems(items.map(x => (x.id === id ? { ...x, status } : x)))
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    await deletePlan(confirmDelete.id)
    setItems(items.filter(x => x.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const upcomingCount = items.filter(i => i.status === 'rencana').length
  const totalBudgetUpcoming = items
    .filter(i => i.status === 'rencana')
    .reduce((sum, i) => sum + (i.budget || 0), 0)

  const filteredItems = items.filter(i => {
    if (filter === 'mendatang') return i.status === 'rencana'
    if (filter === 'selesai') return i.status === 'selesai'
    if (filter === 'dibatalkan') return i.status === 'dibatalkan'
    return true
  })

  return (
    <Card title="Rencana & Jalan-Jalan" icon="🗺️" className="mb-6">
      {/* Header Banner */}
      <div className="mb-5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50/50 border border-sky-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-sky-700">Rencana Mendatang</p>
            <p className="mt-1 font-bold text-sky-600 truncate" style={{ fontSize: 'clamp(14px, 4vw, 20px)' }}>
              {upcomingCount} Acara
            </p>
          </div>
          <div className="text-right min-w-0">
            <p className="text-[10px] text-sky-500 uppercase tracking-wider">Est. Total Budget</p>
            <p className="font-bold text-sky-700 truncate" style={{ fontSize: 'clamp(12px, 3.5vw, 16px)' }}>
              {fmt(totalBudgetUpcoming)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-forest/5 p-1 text-xs">
        {(['semua', 'mendatang', 'selesai', 'dibatalkan'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg py-1.5 font-semibold capitalize transition ${
              filter === f ? 'bg-white text-forest shadow-sm' : 'text-forest/60 hover:text-forest'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Form Tambah */}
      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <Input
            label="Nama Rencana / Acara"
            placeholder="Liburan ke Bali / Dinner Ultah"
            value={values.title}
            onChange={set('title')}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">
                Tanggal Rencana
              </span>
              <input
                type="date"
                value={values.date}
                onChange={e => setValues({ ...values, date: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
                required
              />
            </label>
            <Input
              label="Lokasi / Tujuan"
              placeholder="Pantai Kuta / Restoran X"
              value={values.location}
              onChange={set('location')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimasi Budget (Rp)"
              type="number"
              min="0"
              placeholder="1500000"
              value={values.budget}
              onChange={set('budget')}
            />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">
                Ditambahkan oleh
              </span>
              <select
                value={values.added_by}
                onChange={e => setValues({ ...values, added_by: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
              >
                <option value="">— pilih —</option>
                {MEMBERS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Input
            label="Catatan / Deskripsi"
            placeholder="Bawa baju ganti, reservasi tempat H-3"
            value={values.description}
            onChange={set('description')}
          />

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="lg" className="flex-1">
              Simpan Rencana
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                reset()
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">
          + Tambah Rencana Baru
        </Button>
      )}

      {/* List Items */}
      <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
        {filteredItems.map(i => {
          const badgeVariant =
            i.status === 'selesai' ? 'success' : i.status === 'dibatalkan' ? 'default' : 'info'

          return (
            <div
              key={i.id}
              className={`rounded-xl border p-4 transition ${
                i.status === 'selesai'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : i.status === 'dibatalkan'
                  ? 'border-forest/5 bg-gray-50 opacity-60'
                  : 'border-forest/10 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        i.status === 'selesai'
                          ? 'line-through text-forest/60'
                          : i.status === 'dibatalkan'
                          ? 'line-through text-forest/65'
                          : 'text-forest'
                      }`}
                    >
                      {i.title}
                    </p>
                    <Badge variant={badgeVariant as any}>{i.status}</Badge>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-forest/75">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>🗓 {i.date}</span>
                      {i.location && <span>📍 {i.location}</span>}
                      {i.budget > 0 && (
                        <span className="font-medium text-forest">💰 {fmt(i.budget)}</span>
                      )}
                    </div>
                    {i.description && (
                      <p className="text-forest/60 italic text-[11px] break-words">{i.description}</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDelete(i)}
                  className="shrink-0"
                >
                  🗑️
                </Button>
              </div>

              {/* Action buttons per item */}
              <div className="mt-3 flex gap-2 border-t border-forest/5 pt-2.5 text-xs">
                {i.status !== 'selesai' && (
                  <button
                    onClick={() => doChangeStatus(i.id, 'selesai')}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-emerald-800 font-medium hover:bg-emerald-200 transition"
                  >
                    ✓ Tandai Selesai
                  </button>
                )}
                {i.status !== 'rencana' && (
                  <button
                    onClick={() => doChangeStatus(i.id, 'rencana')}
                    className="flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1 text-sky-800 font-medium hover:bg-sky-200 transition"
                  >
                    🔄 Kembalikan ke Rencana
                  </button>
                )}
                {i.status !== 'dibatalkan' && (
                  <button
                    onClick={() => doChangeStatus(i.id, 'dibatalkan')}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600 font-medium hover:bg-gray-200 transition ml-auto"
                  >
                    ✕ Batalkan
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filteredItems.length === 0 && (
          <EmptyState icon="🗺️" message="Belum ada rencana di kategori ini" />
        )}
      </div>

      {/* Confirm Add */}
      <ConfirmDialog
        open={!!confirmAdd}
        title="Konfirmasi Tambah Rencana"
        message={`Rencana: ${confirmAdd?.title}\nTanggal: ${confirmAdd?.date}\nLokasi: ${
          confirmAdd?.location || '-'
        }\nBudget: ${fmt(confirmAdd?.budget || 0)}\nDitambahkan oleh: ${
          confirmAdd?.added_by || '-'
        }`}
        confirmLabel="Ya, Simpan Rencana"
        variant="info"
        onConfirm={doAdd}
        onCancel={() => setConfirmAdd(null)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message={`Hapus rencana "${confirmDelete?.title}"?`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  )
}

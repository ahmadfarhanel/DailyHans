import { useEffect, useState } from 'react'
import { getExpenses, addExpense, deleteExpense, type Expense } from '../lib/db'
import { Card, Input, Button, useForm, Badge, EmptyState } from './ui'
import ConfirmDialog from './ConfirmDialog'
import { jakartaToday } from '../lib/date'

type ReceiptScan = {
  merchant: string
  amount: number | null
  date: string | null
  category: 'makanan' | 'transport' | 'rumah' | 'belanja' | 'hiburan' | 'kesehatan' | 'tagihan' | 'lainnya'
  description: string
  confidence: number
}

const CATS = [
  { id: 'makanan', icon: '🍜', color: 'warning' },
  { id: 'transport', icon: '🚗', color: 'info' },
  { id: 'rumah', icon: '🏠', color: 'success' },
  { id: 'belanja', icon: '🛍️', color: 'gold' },
  { id: 'hiburan', icon: '🎬', color: 'danger' },
  { id: 'kesehatan', icon: '💊', color: 'warning' },
  { id: 'tagihan', icon: '📄', color: 'default' },
  { id: 'lainnya', icon: '📦', color: 'default' },
] as const

const MEMBERS = ['Papa', 'Mama', 'Anak', 'Lainnya']

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const label = (value: string) => value ? value[0].toUpperCase() + value.slice(1) : '-'

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([])
  const [showForm, setShowForm] = useState(false)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false)
  const [receiptName, setReceiptName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scan, setScan] = useState<ReceiptScan | null>(null)
  const { values, setValues, set, reset } = useForm({ amount: '', category: 'makanan', description: '', added_by: '', date: jakartaToday() })

  const scanReceipt = async (file: File) => {
    setScanning(true)
    setScanError('')
    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Foto struk tidak bisa dibaca'))
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
        reader.readAsDataURL(file)
      })
      const result = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      })
      const data = await result.json()
      if (!result.ok) throw new Error(data?.error || 'scan failed')
      const parsed = data as ReceiptScan
      setScan(parsed)
      setValues({
        ...values,
        amount: parsed.amount ? String(parsed.amount) : values.amount,
        category: parsed.category,
        description: parsed.description || parsed.merchant || values.description,
        date: parsed.date || values.date,
      })
    } catch (error) {
      console.error('receipt OCR failed', error)
      setScanError('Scan gagal. Coba foto lebih dekat, terang, dan struk lurus.')
    } finally {
      setScanning(false)
    }
  }

  const selectReceipt = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setReceiptName(file.name)
    setReceiptPreviewOpen(false)
    setScan(null)
    setScanError('')
    const reader = new FileReader()
    reader.onload = () => setReceiptPreview(String(reader.result))
    reader.readAsDataURL(file)
    void scanReceipt(file)
  }

  const clearReceipt = () => {
    setReceiptPreviewOpen(false)
    setReceiptPreview(null)
    setReceiptName('')
    setScan(null)
    setScanError('')
  }

  // Confirmation state
  const [confirmAdd, setConfirmAdd] = useState<{ amount: number; category: string; description: string; added_by: string; date: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null)

  useEffect(() => { getExpenses().then(setItems) }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.amount) return
    setConfirmAdd({
      amount: +values.amount,
      category: values.category,
      description: values.description,
      added_by: values.added_by,
      date: values.date,
    })
  }

  const confirmAddExpense = async () => {
    if (!confirmAdd) return
    const created = await addExpense({
      amount: confirmAdd.amount,
      category: confirmAdd.category,
      description: confirmAdd.description,
      date: confirmAdd.date,
      added_by: confirmAdd.added_by || undefined,
    } as any)
    if (created) setItems([created, ...items])
    setConfirmAdd(null)
    reset(); setShowForm(false)
  }

  const confirmDeleteExpense = async () => {
    if (!confirmDelete) return
    await deleteExpense(confirmDelete.id)
    setItems(items.filter(x => x.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const total = items.reduce((s, i) => s + i.amount, 0)
  const catInfo = (c: string) => CATS.find(x => x.id === c) || CATS[7]

  return (
    <Card title="Pengeluaran" icon="💰" className="mb-6">
      <div className="mb-5 rounded-xl bg-gradient-to-r from-gold/15 via-gold/10 to-gold/5 border border-gold/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-amber-700">Total Bulan Ini</p>
          <p className="text-xs text-forest/40">{items.length} transaksi</p>
        </div>
        <p className="mt-1 text-2xl font-bold text-forest">{fmt(total)}</p>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-forest/8 bg-cream p-4">
          <div className="rounded-xl border border-dashed border-forest/30 bg-forest/5 p-3">
            <div className="flex items-start gap-3">
              {receiptPreview ? (
                <button type="button" onClick={() => setReceiptPreviewOpen(true)} className="group relative h-20 w-16 shrink-0 overflow-hidden rounded-lg outline-none focus:ring-2 focus:ring-forest/50" aria-label="Lihat struk">
                  <img src={receiptPreview} alt="Preview struk" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-black/0 text-lg opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">🔍</span>
                </button>
              ) : (
                <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-2xl">🧾</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-forest">Scan struk</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-forest/55">
                  Pilih foto. AI otomatis membaca total, tanggal, toko, dan kategori.
                </p>
                {receiptName && <p className="mt-1 truncate text-[10px] text-forest/50">{receiptName}</p>}
                <div className="mt-2 flex gap-2">
                  <label className="cursor-pointer rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-cream transition hover:bg-forest-light">
                    📷 Kamera
                    <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={e => selectReceipt(e.target.files?.[0])} />
                  </label>
                  <label className="cursor-pointer rounded-lg border border-forest/20 px-3 py-1.5 text-xs font-semibold text-forest/75 transition hover:bg-forest/10">
                    Galeri
                    <input className="sr-only" type="file" accept="image/*" onChange={e => selectReceipt(e.target.files?.[0])} />
                  </label>
                  {receiptPreview && (
                    <button type="button" onClick={clearReceipt} className="px-2 text-xs text-red-500 hover:text-red-400">Hapus</button>
                  )}
                </div>
              </div>
            </div>
            {scanning && (
              <div className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-[11px] text-forest/70">
                Membaca struk di perangkat… pertama kali bisa lebih lama karena model OCR diunduh.
              </div>
            )}
            {scan && !scanning && (
              <div className="mt-3 rounded-lg border border-forest/15 bg-forest/8 px-3 py-2 text-[11px] text-forest/75">
                <p className="font-semibold">OCR selesai • keyakinan {scan.confidence}%</p>
                <p className="mt-1">Toko: {scan.merchant || '-'} • Total: {scan.amount ? fmt(scan.amount) : '-'} • Kategori: {label(scan.category)}</p>
                <p className="mt-1 text-forest/50">Cek kembali hasil sebelum simpan.</p>
              </div>
            )}
            {scanError && <p className="mt-3 text-[11px] text-red-500">{scanError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah (Rp)" type="number" min="1" placeholder="50000" value={values.amount} onChange={set('amount')} required />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Kategori</span>
              <select value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10">
                {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {label(c.id)}</option>)}
              </select>
            </label>
          </div>
          <Input label="Deskripsi" placeholder="Beli sayur di pasar" value={values.description} onChange={set('description')} />
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
        <Button onClick={() => setShowForm(true)} className="mb-5 w-full">+ Tambah Pengeluaran</Button>
      )}

      <div className="space-y-2">
        {items.map(i => {
          const cat = catInfo(i.category)
          return (
            <div key={i.id} className="group flex items-center justify-between rounded-xl border border-forest/8 bg-white px-4 py-3 transition hover:bg-cream-dark hover:border-forest/12">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-lg">{cat.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-forest truncate">{i.description || i.category}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={cat.color as any}>{label(i.category)}</Badge>
                    {(i as any).added_by && <span className="text-[10px] text-forest/35 shrink-0">oleh {(i as any).added_by}</span>}
                    <span className="text-[10px] text-forest/30">{i.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="font-semibold text-forest whitespace-nowrap">{fmt(i.amount)}</span>
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(i)}>🗑️</Button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <EmptyState icon="💸" message="Belum ada pengeluaran" />}
      </div>

      {/* Confirm Add Dialog */}
      <ConfirmDialog
        open={!!confirmAdd}
        title="Konfirmasi Tambah Pengeluaran"
        message={`Kategori: ${label(confirmAdd?.category || '')}\nJumlah: ${fmt(confirmAdd?.amount || 0)}\nDeskripsi: ${confirmAdd?.description || '-'}\nTanggal: ${confirmAdd?.date}\nDitambahkan oleh: ${confirmAdd?.added_by || '-'}`}
        confirmLabel="Ya, Tambah"
        variant="info"
        onConfirm={confirmAddExpense}
        onCancel={() => setConfirmAdd(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Konfirmasi Hapus"
        message={`Hapus pengeluaran "${confirmDelete?.description || confirmDelete?.category}" sebesar ${fmt(confirmDelete?.amount || 0)}?`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={confirmDeleteExpense}
        onCancel={() => setConfirmDelete(null)}
      />
      {receiptPreviewOpen && receiptPreview && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Preview struk" onClick={() => setReceiptPreviewOpen(false)}>
          <button type="button" onClick={() => setReceiptPreviewOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/25">Tutup ✕</button>
          <img src={receiptPreview} alt="Struk penuh" className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </Card>
  )
}
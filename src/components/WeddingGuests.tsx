import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { Button, Input } from './ui'
import WeddingEditDialog, { type EditField } from './WeddingEditDialog'

type Guest = { id: string; name: string; family_side: string; region: string; phone: string; pax: number; rsvp: 'menunggu' | 'hadir' | 'tidak_hadir' }

type GuestDraft = { name: string; family_side: string; region: string; pax: number }

const slug = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const phoneWa = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '62')
const inviteUrl = (name: string) => `https://wedding-kaoayy.vercel.app/?to=${encodeURIComponent(slug(name))}`

function parseBulkText(text: string): GuestDraft[] {
  return text
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/[\t,|]/).map(part => part.trim()).filter(Boolean)
      const [name = '', family_side = 'Mempelai', region = '', paxRaw = '1'] = parts
      return { name, family_side, region, pax: Math.max(1, Number(paxRaw) || 1) }
    })
    .filter(item => item.name)
}

function parseGuestRows(rows: Record<string, any>[]): GuestDraft[] {
  return rows.map(row => {
    const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [String(k).toLowerCase().trim(), v]))
    const name = String(lower.name ?? lower.nama ?? lower['nama tamu'] ?? '').trim()
    const family_side = String(lower.family_side ?? lower.family ?? lower.keluarga ?? lower['keluarga siapa'] ?? 'Mempelai').trim() || 'Mempelai'
    const region = String(lower.region ?? lower.daerah ?? lower.kota ?? lower.alamat ?? '').trim()
    const pax = Math.max(1, Number(lower.pax ?? lower.jumlah ?? lower['jumlah pax'] ?? 1) || 1)
    return { name, family_side, region, pax }
  }).filter(item => item.name)
}

export default function WeddingGuests() {
  const [items, setItems] = useState<Guest[]>([])
  const [form, setForm] = useState({ name: '', family: '', region: '', phone: '', pax: '1' })
  const [filter, setFilter] = useState<'all' | Guest['rsvp']>('all')
  const [query, setQuery] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [bulkPreview, setBulkPreview] = useState<GuestDraft[] | null>(null)
  const [bulkMessage, setBulkMessage] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Guest | null>(null)
  const [copied, setCopied] = useState('')

  const load = async () => {
    const { data, error: loadError } = await supabase.from('wedding_guests').select('*').order('created_at')
    if (loadError) setError(loadError.message)
    else setItems((data || []) as Guest[])
  }
  useEffect(() => { void load() }, [])

  const add = async () => {
    if (!form.name.trim()) return
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setError('Silakan login kembali.')
    const { error: insertError } = await supabase.from('wedding_guests').insert({ user_id: user.id, name: form.name.trim(), family_side: form.family.trim() || 'Mempelai', region: form.region.trim(), phone: form.phone.trim(), pax: Number(form.pax) || 1 })
    if (insertError) return setError(insertError.message)
    setForm({ name: '', family: '', region: '', phone: '', pax: '1' }); await load()
  }

  const keyOf = (item: GuestDraft | Guest) => [item.name, item.family_side, item.region].map(value => value.trim().toLowerCase()).join('|')
  const previewImport = (drafts: GuestDraft[]) => {
    const seen = new Set(items.map(keyOf))
    const batch = new Set<string>()
    const unique = drafts.filter(item => {
      const key = keyOf(item)
      if (seen.has(key) || batch.has(key)) return false
      batch.add(key)
      return true
    })
    setBulkPreview(unique)
    setBulkMessage(`${drafts.length} terbaca. ${drafts.length - unique.length} duplikat dilewati. Cek preview lalu import.`)
  }
  const confirmImport = async () => {
    if (!bulkPreview?.length) return
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setError('Silakan login kembali.')
    const { error: insertError } = await supabase.from('wedding_guests').insert(bulkPreview.map(item => ({ user_id: user.id, name: item.name, family_side: item.family_side || 'Mempelai', region: item.region || '', pax: Number(item.pax) || 1 })))
    if (insertError) return setError(insertError.message)
    const count = bulkPreview.length
    setBulkText(''); setBulkPreview(null); setBulkMessage(`Berhasil import ${count} tamu.`)
    await load()
  }
  const handleBulkFile = async (file: File) => {
    setError(''); setBulkMessage(''); setBulkPreview(null)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'csv' || ext === 'txt') return previewImport(parseBulkText(await file.text()))
    if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const sheet = workbook.SheetNames[0]
      if (!sheet) return setError('File Excel kosong.')
      return previewImport(parseGuestRows(XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheet], { defval: '' })))
    }
    setError('Format file harus .xlsx, .xls, .csv, atau .txt')
  }

  const visible = useMemo(() => {
    const base = filter === 'all' ? items : items.filter(item => item.rsvp === filter)
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter(item => [item.name, item.family_side, item.region, item.rsvp].join(' ').toLowerCase().includes(q))
  }, [filter, items, query])

  const stats = useMemo(() => ({
    pax: items.reduce((sum, item) => sum + Number(item.pax), 0),
    attending: items.filter(item => item.rsvp === 'hadir').reduce((sum, item) => sum + Number(item.pax), 0),
  }), [items])

  const updateRsvp = async (id: string, rsvp: Guest['rsvp']) => { await supabase.from('wedding_guests').update({ rsvp }).eq('id', id); await load() }
  const remove = async (id: string) => { await supabase.from('wedding_guests').delete().eq('id', id); await load() }
  const edit = async (values: Record<string, string>) => {
    if (!editing || !values.name.trim()) return
    await supabase.from('wedding_guests').update({ name: values.name.trim(), family_side: values.family_side || 'Mempelai', region: values.region || '', phone: values.phone.trim(), pax: Number(values.pax) || 1 }).eq('id', editing.id)
    setEditing(null); await load()
  }
  const guestFields = (item: Guest): EditField[] => [
    { key: 'name', label: 'Nama tamu', value: item.name },
    { key: 'family_side', label: 'Keluarga siapa?', value: item.family_side },
    { key: 'region', label: 'Daerah / kota', value: item.region },
    { key: 'phone', label: 'Nomor WhatsApp', value: item.phone || '', type: 'text' },
    { key: 'pax', label: 'Jumlah pax', value: String(item.pax), type: 'number' },
  ]
  const copyInvite = async (name: string) => {
    try { await navigator.clipboard.writeText(inviteUrl(name)); setCopied(name); window.setTimeout(() => setCopied(''), 1800) }
    catch { setError('Browser tidak mengizinkan menyalin link. Buka tombol Undangan lalu salin dari address bar.') }
  }

  return <section className="space-y-5">
    <div className="relative overflow-hidden rounded-3xl border border-forest/15 bg-gradient-to-br from-forest/20 via-gold/10 to-forest-light/15 p-5 shadow-xl shadow-forest/10 sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-10 text-9xl opacity-10">💌</div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-forest/60">Wedding Planner</p>
      <h1 className="mt-1 text-2xl font-bold text-forest sm:text-3xl">Daftar Tamu</h1>
      <p className="mt-2 max-w-lg text-sm text-forest/65">Kelola undangan, keluarga, asal daerah, jumlah pax, RSVP, link undangan, dan import tamu cepat.</p>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-lg"><Stat value={String(items.length)} label="Undangan" /><Stat value={String(stats.pax)} label="Total pax" /><Stat value={String(stats.attending)} label="Pax hadir" /></div>
    </div>

    <div className="rounded-2xl border border-forest/10 bg-white/90 p-4 shadow-lg shadow-forest/5 sm:p-5">
      <h2 className="text-base font-bold text-forest">Tambah Tamu</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama tamu" /><Input value={form.family} onChange={e => setForm({ ...form, family: e.target.value })} placeholder="Keluarga siapa? Contoh: Keluarga Mama" /><Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Daerah / kota" /><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="WhatsApp, contoh: 08123456789" inputMode="tel" /><Input type="number" min="1" max="20" value={form.pax} onChange={e => setForm({ ...form, pax: e.target.value })} placeholder="Jumlah pax" /></div>
      <Button type="button" className="mt-3 w-full" onClick={add}>+ Tambah Tamu</Button>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-500">{error}</p>}
    </div>

    <div className="rounded-2xl border border-forest/10 bg-white/90 p-4 shadow-lg shadow-forest/5 sm:p-5">
      <h2 className="text-base font-bold text-forest">Import Tamu</h2>
      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">File Excel / CSV</span>
          <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={e => { const file = e.target.files?.[0]; if (file) void handleBulkFile(file); e.currentTarget.value = '' }} className="block w-full cursor-pointer rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-forest" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">Bulk text</span>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder={"Contoh:\nBudi Santoso | Keluarga Ayah | Jakarta | 2\nSiti Aminah, Keluarga Ibu, Bandung, 1"} rows={5} className="w-full rounded-xl border border-forest/15 bg-white px-3 py-3 text-sm text-forest outline-none focus:border-forest/40" />
        </label>
        <div className="flex gap-2"><Button type="button" className="flex-1" onClick={() => previewImport(parseBulkText(bulkText))}>Preview Text</Button><Button type="button" variant="ghost" onClick={() => { setBulkText(''); setBulkPreview(null); setBulkMessage('') }}>Clear</Button></div>
        {bulkMessage && <p className="rounded-lg bg-forest/8 p-3 text-xs text-forest">{bulkMessage}</p>}
        {bulkPreview && <div className="rounded-2xl border border-forest/15 bg-cream/70 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-forest">Preview {bulkPreview.length} tamu</p><Button type="button" onClick={() => void confirmImport()}>Import Sekarang</Button></div><div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-forest/65">{bulkPreview.slice(0, 20).map((item, index) => <p key={`${item.name}-${index}`} className="truncate">{index + 1}. {item.name} — {item.family_side} — {item.region || 'Daerah belum diisi'} — {item.pax} pax</p>)}{bulkPreview.length > 20 && <p>+ {bulkPreview.length - 20} tamu lain</p>}</div></div>}
      </div>
    </div>

    <div className="rounded-2xl border border-forest/10 bg-white/90 p-4 shadow-lg shadow-forest/5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">{([{ id: 'all', label: 'Semua' }, { id: 'menunggu', label: 'Menunggu' }, { id: 'hadir', label: 'Hadir' }, { id: 'tidak_hadir', label: 'Tidak hadir' }] as const).map(option => <button key={option.id} type="button" onClick={() => setFilter(option.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === option.id ? 'bg-forest text-cream' : 'bg-forest/8 text-forest/65'}`}>{option.label}</button>)}</div>
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama, keluarga, daerah" className="sm:max-w-xs" />
      </div>
      <div className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">{visible.map(item => <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-cream/60 p-3 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-lg">👤</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-forest">{item.name}</h3><p className="truncate text-xs text-forest/60">{item.family_side} • {item.region || 'Daerah belum diisi'} • {item.pax} pax</p></div><div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end"><select value={item.rsvp} onChange={e => updateRsvp(item.id, e.target.value as Guest['rsvp'])} className="min-h-10 rounded-xl border border-forest/15 bg-white px-3 py-1 text-xs"><option value="menunggu">Menunggu</option><option value="hadir">Hadir</option><option value="tidak_hadir">Tidak hadir</option></select><a href={inviteUrl(item.name)} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-2 text-xs text-forest hover:bg-forest/8">Undangan</a><a href={`https://wa.me/${phoneWa(item.phone)}?text=${encodeURIComponent(`Halo ${item.name}, kami mengundang Anda ke pernikahan kami.\n${inviteUrl(item.name)}`)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#25D366]/15 px-2 py-2 text-xs font-semibold text-[#128C4A] hover:bg-[#25D366]/25">WhatsApp</a><button type="button" onClick={() => copyInvite(item.name)} className="rounded-lg px-2 py-2 text-xs text-forest hover:bg-forest/8">{copied === item.name ? 'Tersalin ✓' : 'Salin'}</button><button type="button" onClick={() => setEditing(item)} className="rounded-lg px-2 py-2 text-xs text-forest hover:bg-forest/8">Edit</button><button type="button" onClick={() => remove(item.id)} className="rounded-lg px-2 py-2 text-xs text-red-500 hover:bg-red-50">Hapus</button></div></article>)}{!visible.length && <p className="py-10 text-center text-sm text-forest/45">Belum ada tamu pada daftar ini.</p>}</div>
    </div>
    {editing && <WeddingEditDialog title="Edit Tamu" fields={guestFields(editing)} onClose={() => setEditing(null)} onSave={edit} />}
  </section>
}
function Stat({ value, label }: { value: string; label: string }) { return <div className="rounded-xl bg-cream/80 p-3"><p className="text-lg font-bold text-forest">{value}</p><p className="text-[10px] text-forest/55">{label}</p></div> }

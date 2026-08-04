import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Input } from './ui'
import WeddingEditDialog, { type EditField } from './WeddingEditDialog'

type Guest = { id: string; name: string; family_side: string; region: string; pax: number; rsvp: 'menunggu' | 'hadir' | 'tidak_hadir' }

export default function WeddingGuests() {
  const [items, setItems] = useState<Guest[]>([])
  const [form, setForm] = useState({ name: '', family: '', region: '', pax: '1' })
  const [filter, setFilter] = useState<'all' | Guest['rsvp']>('all')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Guest | null>(null)
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
    const { error: insertError } = await supabase.from('wedding_guests').insert({ user_id: user.id, name: form.name.trim(), family_side: form.family.trim() || 'Mempelai', region: form.region.trim(), pax: Number(form.pax) || 1 })
    if (insertError) return setError(insertError.message)
    setForm({ name: '', family: '', region: '', pax: '1' }); await load()
  }
  const visible = filter === 'all' ? items : items.filter(item => item.rsvp === filter)
  const stats = useMemo(() => ({
    pax: items.reduce((sum, item) => sum + Number(item.pax), 0),
    attending: items.filter(item => item.rsvp === 'hadir').reduce((sum, item) => sum + Number(item.pax), 0),
  }), [items])
  const updateRsvp = async (id: string, rsvp: Guest['rsvp']) => { await supabase.from('wedding_guests').update({ rsvp }).eq('id', id); await load() }
  const remove = async (id: string) => { await supabase.from('wedding_guests').delete().eq('id', id); await load() }
  const edit = async (values: Record<string, string>) => {
    if (!editing || !values.name.trim()) return
    await supabase.from('wedding_guests').update({ name: values.name.trim(), family_side: values.family_side || 'Mempelai', region: values.region || '', pax: Number(values.pax) || 1 }).eq('id', editing.id)
    setEditing(null); await load()
  }
  const guestFields = (item: Guest): EditField[] => [{ key: 'name', label: 'Nama tamu', value: item.name }, { key: 'family_side', label: 'Keluarga siapa?', value: item.family_side }, { key: 'region', label: 'Daerah / kota', value: item.region }, { key: 'pax', label: 'Jumlah pax', value: String(item.pax), type: 'number' }]

  return <section className="space-y-5">
    <div className="relative overflow-hidden rounded-3xl border border-forest/15 bg-gradient-to-br from-forest/20 via-gold/10 to-forest-light/15 p-5 shadow-xl shadow-forest/10 sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-10 text-9xl opacity-10">💌</div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-forest/60">Wedding Planner</p>
      <h1 className="mt-1 text-2xl font-bold text-forest sm:text-3xl">Daftar Tamu</h1>
      <p className="mt-2 max-w-lg text-sm text-forest/65">Kelola undangan, keluarga, asal daerah, jumlah pax, dan RSVP dalam satu fokus khusus.</p>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-lg"><Stat value={String(items.length)} label="Undangan" /><Stat value={String(stats.pax)} label="Total pax" /><Stat value={String(stats.attending)} label="Pax hadir" /></div>
    </div>

    <div className="rounded-2xl border border-forest/10 bg-white/90 p-4 shadow-lg shadow-forest/5 sm:p-5">
      <h2 className="text-base font-bold text-forest">Tambah Tamu</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama tamu" /><Input value={form.family} onChange={e => setForm({ ...form, family: e.target.value })} placeholder="Keluarga siapa? Contoh: Keluarga Mama" /><Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Daerah / kota" /><Input type="number" min="1" max="20" value={form.pax} onChange={e => setForm({ ...form, pax: e.target.value })} placeholder="Jumlah pax" /></div>
      <Button type="button" className="mt-3 w-full" onClick={add}>+ Tambah Tamu</Button>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-500">{error}</p>}
    </div>

    <div className="rounded-2xl border border-forest/10 bg-white/90 p-4 shadow-lg shadow-forest/5 sm:p-5">
      <div className="flex flex-wrap gap-2">{([{ id: 'all', label: 'Semua' }, { id: 'menunggu', label: 'Menunggu' }, { id: 'hadir', label: 'Hadir' }, { id: 'tidak_hadir', label: 'Tidak hadir' }] as const).map(option => <button key={option.id} type="button" onClick={() => setFilter(option.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === option.id ? 'bg-forest text-cream' : 'bg-forest/8 text-forest/65'}`}>{option.label}</button>)}</div>
      <div className="mt-4 space-y-2">{visible.map(item => <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-cream/60 p-3 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-lg">👤</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-forest">{item.name}</h3><p className="truncate text-xs text-forest/60">{item.family_side} • {item.region || 'Daerah belum diisi'} • {item.pax} pax</p></div><div className="flex items-center justify-between gap-2 sm:justify-end"><select value={item.rsvp} onChange={e => updateRsvp(item.id, e.target.value as Guest['rsvp'])} className="min-h-10 rounded-xl border border-forest/15 bg-white px-3 py-1 text-xs"><option value="menunggu">Menunggu</option><option value="hadir">Hadir</option><option value="tidak_hadir">Tidak hadir</option></select><button type="button" onClick={() => setEditing(item)} className="rounded-lg px-2 py-2 text-xs text-forest hover:bg-forest/8">Edit</button><button type="button" onClick={() => remove(item.id)} className="rounded-lg px-2 py-2 text-xs text-red-500 hover:bg-red-50">Hapus</button></div></article>)}{!visible.length && <p className="py-10 text-center text-sm text-forest/45">Belum ada tamu pada daftar ini.</p>}</div>
    </div>
    {editing && <WeddingEditDialog title="Edit Tamu" fields={guestFields(editing)} onClose={() => setEditing(null)} onSave={edit} />}
  </section>
}
function Stat({ value, label }: { value: string; label: string }) { return <div className="rounded-xl bg-cream/80 p-3"><p className="text-lg font-bold text-forest">{value}</p><p className="text-[10px] text-forest/55">{label}</p></div> }

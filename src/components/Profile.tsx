import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Profile({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('name').single().then(({ data }) => {
      if (data?.name) setName(data.name)
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({ id: user.id, name }, { onConflict: 'id' })
    setSaving(false)
    if (error) setMsg(`Gagal: ${error.message}`)
    else { setMsg('Tersimpan!'); setTimeout(onClose, 800) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-forest/40 backdrop-blur-sm" />

      {/* Modal - responsive width */}
      <div className="relative z-[101] w-full max-w-sm mx-auto" onClick={e => e.stopPropagation()}>
        <div className="rounded-2xl border border-forest/15 bg-white shadow-2xl shadow-forest/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-forest/10 bg-gradient-to-r from-forest/[0.03] to-gold/5 px-5 py-4">
            <span className="text-lg">⚙️</span>
            <h2 className="text-base font-semibold text-forest">Pengaturan Profil</h2>
          </div>

          {/* Body */}
          <form onSubmit={save} className="p-5 space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-forest to-forest-light text-3xl font-bold text-cream shadow-lg shadow-forest/25">
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </div>
            </div>

            {/* Input Nama */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Nama tampilan"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-3 text-sm text-forest outline-none transition placeholder:text-forest/50 focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
                autoFocus
              />
            </div>

            {/* Message */}
            {msg && (
              <p className={`text-sm text-center ${msg.startsWith('Gagal') ? 'text-red-500' : 'text-forest'}`}>
                {msg}
              </p>
            )}

            {/* Buttons - stack on mobile */}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-forest to-forest-light px-4 py-3 text-sm font-bold text-cream shadow-lg shadow-forest/25 transition hover:shadow-forest/40 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-forest/15 px-4 py-3 text-sm font-medium text-forest/70 hover:border-forest/25 hover:text-forest bg-white transition"
              >
                Tutup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Input, Button } from './ui'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/30 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        <Card title="Pengaturan Profil" icon="⚙️" className="w-[380px] max-w-[calc(100vw-2rem)]">
          <form onSubmit={save} className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-forest to-forest-light text-3xl font-bold text-cream shadow-lg shadow-forest/25">
                {name ? name.charAt(0).toUpperCase() : '👤'}
              </div>
            </div>
            <Input label="Nama Lengkap" placeholder="Nama tampilan" value={name} onChange={e => setName(e.target.value)} />
            {msg && <p className={`text-sm text-center ${msg.startsWith('Gagal') ? 'text-red-500' : 'text-forest'}`}>{msg}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="lg" className="flex-1" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
              <Button type="button" variant="ghost" onClick={onClose}>Tutup</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

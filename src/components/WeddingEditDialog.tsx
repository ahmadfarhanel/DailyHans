import { useEffect, useState } from 'react'
import { Button } from './ui'

export type EditField = { key: string; label: string; value: string; type?: 'text' | 'number' | 'date' }

export default function WeddingEditDialog({ title, fields, onSave, onClose }: { title: string; fields: EditField[]; onSave: (values: Record<string, string>) => void; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => setValues(Object.fromEntries(fields.map(field => [field.key, field.value]))), [fields])
  return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
    <form onSubmit={event => { event.preventDefault(); onSave(values) }} onClick={event => event.stopPropagation()} className="w-full max-w-md rounded-3xl border border-forest/15 bg-cream p-5 shadow-2xl sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-forest/60">Wedding Planner</p><h2 className="mt-1 text-lg font-black text-forest">{title}</h2></div><button type="button" onClick={onClose} className="rounded-full bg-forest/8 px-3 py-1.5 text-xs text-forest">Tutup ✕</button></div>
      <div className="space-y-3">{fields.map(field => <label key={field.key} className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">{field.label}</span><input required={field.key === 'name' || field.key === 'title' || field.key === 'category'} type={field.type || 'text'} value={values[field.key] || ''} onChange={event => setValues({ ...values, [field.key]: event.target.value })} className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest/45 focus:ring-2 focus:ring-forest/10" /></label>)}</div>
      <div className="mt-6 flex gap-2"><Button type="submit" className="flex-1">Simpan Perubahan</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div>
    </form>
  </div>
}

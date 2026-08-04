import { useEffect, useState } from 'react'
import { transactionImageUrl } from '../lib/transactionImage'

export default function TransactionImage({ path, alt }: { path?: string | null; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => { void transactionImageUrl(path).then(setUrl) }, [path])
  if (!url) return null
  return <>
    <button type="button" onClick={() => setOpen(true)} className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-forest/15 outline-none focus:ring-2 focus:ring-forest/50" aria-label={`Lihat ${alt}`}>
      <img src={url} alt={alt} className="h-full w-full object-cover" />
    </button>
    {open && <div className="fixed inset-0 z-[110] grid cursor-zoom-out place-items-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/25">Tutup ✕</button>
      <img src={url} alt={alt} className="max-h-[85vh] max-w-full cursor-zoom-out rounded-xl object-contain shadow-2xl" />
    </div>}
  </>
}

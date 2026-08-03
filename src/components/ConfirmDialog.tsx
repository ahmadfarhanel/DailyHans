type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Ya', cancelLabel = 'Batal', variant = 'danger', onConfirm, onCancel }: Props) {
  if (!open) return null

  const colors = {
    danger: { bg: 'bg-red-50', border: 'border-red-200', btn: 'from-red-500 to-red-600', text: 'text-red-600' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', btn: 'from-amber-500 to-amber-600', text: 'text-amber-700' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', btn: 'from-forest to-forest-light', text: 'text-sky-700' },
  }
  const c = colors[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-forest/40 backdrop-blur-sm" />
      <div className={`relative z-[101] w-full max-w-xs rounded-2xl border ${c.border} ${c.bg} shadow-xl`} onClick={e => e.stopPropagation()}>
        <div className="p-5 space-y-3">
          <h3 className={`text-base font-semibold ${c.text}`}>{title}</h3>
          <p className="text-sm text-forest/70">{message}</p>
        </div>
        <div className="flex gap-2 border-t border-forest/10 px-5 py-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl border border-forest/15 px-4 py-2 text-sm font-medium text-forest/70 hover:bg-white transition">
            {cancelLabel}
          </button>
          <button onClick={() => { onConfirm(); onCancel() }}
            className={`flex-1 rounded-xl bg-gradient-to-r ${c.btn} px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
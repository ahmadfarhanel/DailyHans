import { useState } from 'react'

export function Input({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block group">
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">{label}</span>}
      <input {...props} className={`w-full rounded-2xl border border-forest/10 bg-white/90 px-4 py-3 text-sm text-forest outline-none transition placeholder:text-forest/50 focus:border-gold/60 focus:ring-4 focus:ring-gold/10 ${className}`} />
    </label>
  )
}

export function CurrencyInput({ label = 'Jumlah (Rp)', value, onValueChange, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & { label?: string; value: string; onValueChange: (value: string) => void }) {
  const display = value ? Number(value.replace(/\D/g, '')).toLocaleString('id-ID') : ''
  return (
    <label className="block group">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/60">{label}</span>
      <div className="flex rounded-2xl border border-forest/10 bg-white/90 focus-within:border-gold/60 focus-within:ring-4 focus-within:ring-gold/10">
        <span className="grid place-items-center border-r border-forest/10 px-3 text-sm font-semibold text-forest/65">Rp</span>
        <input {...props} type="text" inputMode="numeric" value={display} onChange={e => onValueChange(e.target.value.replace(/\D/g, ''))} className="min-w-0 flex-1 rounded-r-2xl bg-transparent px-3 py-3 text-sm text-forest outline-none placeholder:text-forest/50" />
      </div>
    </label>
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'success'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-forest text-cream shadow-[0_12px_30px_rgba(23,23,23,0.12)] hover:-translate-y-0.5 hover:bg-forest-light hover:shadow-[0_16px_36px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-[0.98]',
    ghost: 'border border-forest/10 text-forest/80 hover:-translate-y-0.5 hover:border-gold/50 hover:text-forest bg-white/90',
    danger: 'text-forest/65 hover:text-red-600 hover:bg-red-50',
    success: 'bg-gold/15 text-forest hover:bg-gold/20',
  }
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }
    return <button {...props} className={`rounded-full font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} />

}

export function Card({ title, icon, children, className = '', onClick }: { title: string; icon?: string; children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <section onClick={onClick} className={`rounded-3xl border border-forest/10 bg-white/90 backdrop-blur-sm shadow-[0_18px_50px_rgba(23,23,23,0.06)] overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.12)] ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-forest/8 bg-transparent px-5 py-4">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-base font-semibold text-forest">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function useForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial)
  const set = (k: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues(v => ({ ...v, [k]: e.target.value }))
  const reset = () => setValues(initial)
  return { values, setValues, set, reset }
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' }) {
  const styles: Record<string, string> = {
    default: 'bg-forest/8 text-forest/60',
    success: 'bg-forest/15 text-forest',
    warning: 'bg-gold/20 text-amber-700',
    danger: 'bg-red-50 text-red-500',
    info: 'bg-sky-50 text-sky-600',
    gold: 'bg-gradient-to-r from-gold/20 to-gold-light/15 text-amber-800',
  }
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[variant] || styles.default}`}>{children}</span>
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-2 text-4xl opacity-20">{icon}</div>
      <p className="text-sm text-forest/65">{message}</p>
    </div>
  )
}
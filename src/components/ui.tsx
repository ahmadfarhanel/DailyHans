import { useState } from 'react'

export function Input({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block group">
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-forest/50">{label}</span>}
      <input {...props} className={`w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-forest/40 focus:ring-2 focus:ring-forest/10 ${className}`} />
    </label>
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'success'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-forest to-forest-light text-cream shadow-lg shadow-forest/25 hover:shadow-forest/40 active:scale-[0.98]',
    ghost: 'border border-forest/15 text-forest/70 hover:border-forest/30 hover:text-forest bg-white',
    danger: 'text-forest/40 hover:text-red-500 hover:bg-red-50',
    success: 'bg-forest/10 text-forest hover:bg-forest/15',
  }
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }
  return <button {...props} className={`rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} />
}

export function Card({ title, icon, children, className = '' }: { title: string; icon?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-forest/10 bg-white/90 backdrop-blur-sm shadow-lg shadow-forest/5 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-forest/10 bg-gradient-to-r from-forest/[0.03] to-forest-light/[0.02] px-5 py-4">
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
      <p className="text-sm text-forest/40">{message}</p>
    </div>
  )
}
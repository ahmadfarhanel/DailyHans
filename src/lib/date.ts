/** Get today's date in Jakarta timezone (YYYY-MM-DD) */
export function jakartaToday(): string {
  const now = new Date()
  // Jakarta = UTC+7
  const jakarta = new Date(now.getTime() + (7 * 60 - now.getTimezoneOffset()) * 60000)
  return jakarta.toISOString().slice(0, 10)
}

/** Format date to Indonesian readable format */
export function fmtDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
}

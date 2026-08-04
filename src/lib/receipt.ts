import { jakartaToday } from './date'

export type ReceiptScan = {
  text: string
  amount: number | null
  date: string
  merchant: string
  category: string
  confidence: number
}

const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'makanan', keywords: ['warung', 'resto', 'restaurant', 'makan', 'food', 'cafe', 'kopi', 'coffee', 'ayam', 'soto', 'bakso'] },
  { category: 'belanja', keywords: ['indomaret', 'alfamart', 'supermarket', 'market', 'mart', 'mall', 'shop', 'belanja', 'grocery'] },
  { category: 'transport', keywords: ['grab', 'gocar', 'goride', 'gojek', 'maxim', 'shell', 'pertamina', 'bensin', 'parkir', 'tol'] },
  { category: 'rumah', keywords: ['listrik', 'pln', 'air', 'pam', 'laundry', 'sewa', 'kos', 'rumah'] },
  { category: 'kesehatan', keywords: ['apotek', 'apotik', 'farmasi', 'obat', 'klinik', 'rs', 'rumah sakit', 'health'] },
  { category: 'tagihan', keywords: ['tagihan', 'internet', 'wifi', 'indihome', 'telkom', 'pascabayar', 'bpjs', 'cicilan'] },
  { category: 'hiburan', keywords: ['bioskop', 'movie', 'game', 'netflix', 'spotify', 'park', 'wisata', 'entertainment'] },
]

function parseAmount(text: string): number | null {
  const raw = text.match(/(?:rp\.?\s*)?(\d[\d.,]{2,})/gi)
  if (!raw?.length) return null

  const candidates = raw
    .map(s => s.replace(/[^\d]/g, ''))
    .map(n => Number(n))
    .filter(n => Number.isFinite(n) && n >= 1000)

  if (!candidates.length) return null
  return candidates.sort((a, b) => b - a)[0]
}

function parseDate(text: string): string {
  const ymd = text.match(/\b(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\b/)
  if (ymd) {
    const [, y, m, d] = ymd
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  const dmy = text.match(/\b(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2}|\d{2})\b/)
  if (dmy) {
    const [, d, m, yRaw] = dmy
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  return jakartaToday()
}

function parseMerchant(lines: string[]): string {
  const skip = ['struk', 'receipt', 'invoice', 'tanggal', 'date', 'total', 'subtotal', 'ppn', 'tax', 'cash', 'change']
  for (const line of lines) {
    const cleaned = line.trim().replace(/[^\w\s&.-]/g, '')
    if (cleaned.length < 3) continue
    if (skip.some(k => cleaned.toLowerCase().includes(k))) continue
    if (/^\d+$/.test(cleaned)) continue
    return cleaned.slice(0, 40)
  }
  return ''
}

function categorize(text: string): string {
  const lower = text.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.category
  }
  return 'lainnya'
}

export function analyzeReceiptText(text: string): ReceiptScan {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const amount = parseAmount(text)
  const date = parseDate(text)
  const merchant = parseMerchant(lines)
  const category = categorize(text)

  const hitCount = [merchant, amount, date].filter(Boolean).length
  const confidence = Math.min(95, 35 + hitCount * 20)

  return { text, amount, date, merchant, category, confidence }
}

export function summarizeReceipt(scan: ReceiptScan) {
  const amount = scan.amount ? scan.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : '-'
  return `${scan.merchant || 'Struk'} • ${amount} • ${scan.category} • ${scan.date}`
}

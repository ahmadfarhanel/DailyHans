export type ReceiptCandidate = { label: string; value: number }

export type ReceiptOCR = {
  text: string
  candidates: ReceiptCandidate[]
  bestAmount: number | null
}

const TOTAL_PATTERNS = [
  /(?:bayar\s*pakai|total\s*bayar|grand\s*total|jumlah\s*bayar|total|paid|payment)\s*(?:rp\.?\s*)?([\d.,]+)/i,
  /(?:rp\.?\s*)?([\d.,]+)\s*(?:bayar\s*pakai|total\s*bayar|grand\s*total|jumlah\s*bayar)/i,
]

function parseMoney(raw: string): number | null {
  const n = Number(raw.replace(/[^\d]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

export function extractReceiptCandidates(text: string): ReceiptCandidate[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const candidates: ReceiptCandidate[] = []

  for (const line of lines) {
    for (const pattern of TOTAL_PATTERNS) {
      const match = line.match(pattern)
      if (match?.[1]) {
        const value = parseMoney(match[1])
        if (value) candidates.push({ label: line.slice(0, 80), value })
      }
    }
  }

  if (!candidates.length) {
    const loose = text.match(/(?:rp\.?\s*)?(\d[\d.,]{3,})/g) || []
    for (const raw of loose) {
      const value = parseMoney(raw)
      if (value && value >= 1000) candidates.push({ label: raw, value })
    }
  }

  return Array.from(new Map(candidates.map(c => [`${c.label}:${c.value}`, c])).values()).slice(0, 8)
}

export function pickBestReceiptAmount(text: string): number | null {
  const candidates = extractReceiptCandidates(text)
  if (!candidates.length) return null
  const byLabel = candidates.find(c => /bayar pakai|total bayar|grand total|jumlah bayar/i.test(c.label))
  return (byLabel || candidates[candidates.length - 1]).value
}

export function summarizeReceiptOCR(text: string): ReceiptOCR {
  const candidates = extractReceiptCandidates(text)
  return {
    text,
    candidates,
    bestAmount: pickBestReceiptAmount(text),
  }
}

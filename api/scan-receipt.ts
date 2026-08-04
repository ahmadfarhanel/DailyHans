import type { VercelRequest, VercelResponse } from '@vercel/node'

type ScanResult = {
  merchant: string
  amount: number | null
  date: string | null
  category: 'makanan' | 'transport' | 'rumah' | 'belanja' | 'hiburan' | 'kesehatan' | 'tagihan' | 'lainnya'
  description: string
  confidence: number
}

const CATEGORIES = ['makanan', 'transport', 'rumah', 'belanja', 'hiburan', 'kesehatan', 'tagihan', 'lainnya'] as const

function jsonFromText(text: string): ScanResult {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Gemini response missing JSON')
  const parsed = JSON.parse(match[0]) as Partial<ScanResult>
  const category = CATEGORIES.includes(parsed.category as any) ? parsed.category as ScanResult['category'] : 'lainnya'
  return {
    merchant: String(parsed.merchant || '').slice(0, 80),
    amount: typeof parsed.amount === 'number' ? parsed.amount : null,
    date: typeof parsed.date === 'string' ? parsed.date : null,
    category,
    description: String(parsed.description || parsed.merchant || '').slice(0, 120),
    confidence: Math.max(0, Math.min(100, Number(parsed.confidence || 0))),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY belum diset di Vercel' })

  const { imageBase64, mimeType = 'image/jpeg' } = req.body || {}
  if (!imageBase64 || typeof imageBase64 !== 'string') return res.status(400).json({ error: 'imageBase64 wajib ada' })

  const prompt = `Baca struk Indonesia dari gambar ini. Kembalikan JSON valid saja, tanpa markdown.
Schema:
{
  "merchant": "nama toko/restoran, kosong jika tidak yakin",
  "amount": total bayar sebagai integer rupiah, bukan subtotal/kembalian/pajak,
  "date": "YYYY-MM-DD" atau null,
  "category": salah satu: makanan, transport, rumah, belanja, hiburan, kesehatan, tagihan, lainnya,
  "description": deskripsi singkat transaksi,
  "confidence": angka 0-100
}
Aturan:
- Prioritaskan label TOTAL, GRAND TOTAL, TOTAL BAYAR, JUMLAH, AMOUNT PAID.
- Abaikan uang tunai, kembalian, pajak, PPN, diskon, subtotal bila ada total bayar.
- Jika struk minimarket/supermarket: kategori belanja.
- Jika restoran/cafe/warung: makanan.
- Jika SPBU/parkir/tol/transport app: transport.`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ],
      }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    }),
  })

  const raw = await response.text()
  if (!response.ok) return res.status(response.status).json({ error: 'Gemini gagal membaca struk', detail: raw })

  const data = JSON.parse(raw)
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return res.status(502).json({ error: 'Gemini response kosong', detail: data })

  try {
    return res.status(200).json(jsonFromText(text))
  } catch (error) {
    return res.status(502).json({ error: 'JSON Gemini tidak valid', detail: text })
  }
}

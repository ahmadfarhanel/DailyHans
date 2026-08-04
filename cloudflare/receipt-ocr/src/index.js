const MODEL = '@cf/llava-hf/llava-1.5-7b-hf'

const CATEGORIES = ['makanan', 'transport', 'rumah', 'belanja', 'hiburan', 'kesehatan', 'tagihan', 'lainnya']

function cors(origin, allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Scan-Secret',
  }
}

function parseJson(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Model tidak mengembalikan JSON')
  const data = JSON.parse(match[0])
  const amount = Number(String(data.amount ?? '').replace(/[^0-9]/g, ''))
  return {
    merchant: String(data.merchant || '').slice(0, 80),
    amount: Number.isFinite(amount) && amount > 0 ? amount : null,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(data.date)) ? data.date : null,
    category: CATEGORIES.includes(data.category) ? data.category : 'lainnya',
    description: String(data.description || data.merchant || '').slice(0, 120),
    confidence: Math.max(0, Math.min(100, Number(data.confidence || 0))),
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const headers = cors(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') return new Response(null, { headers })
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers })
    if (!env.SCAN_SECRET || request.headers.get('X-Scan-Secret') !== env.SCAN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    try {
      const { imageBase64, mimeType = 'image/jpeg' } = await request.json()
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return Response.json({ error: 'imageBase64 wajib ada' }, { status: 400, headers })
      }

      const prompt = `Read this Indonesian receipt/order screenshot. Return JSON only, no markdown:
{"merchant":"store/restaurant name only","amount":total paid integer rupiah or null,"date":"YYYY-MM-DD" or null,"category":"makanan|transport|rumah|belanja|hiburan|kesehatan|tagihan|lainnya","description":"short Indonesian transaction description","confidence":0-100}
Rules for amount:
- Use the final paid amount, not item price/subtotal.
- Strong labels for final paid amount: "Total", "Grand Total", "Total Bayar", "Jumlah Bayar", "Bayar Pakai", "Paid", "Payment".
- For GoFood/Gojek/GrabFood screenshots, prefer the amount beside "Bayar Pakai GoPay/GoPay/OVO" or final payment method line.
- Ignore: "Harga", item price, subtotal, delivery/handling fee, service fee, tax/PPN, discount, promo, cashback, cash, change/kembalian, distance, time, order ID.
- If multiple amounts exist and discounts exist, compute paid total from subtotal + fees - discounts only if final payment line is absent.
Rules for date:
- Return null if image only shows day/month without year (example: "02 Agu"). Do not invent year.
Category: food/restaurants/GoFood/GrabFood => makanan.`

      const result = await env.AI.run(MODEL, {
        image: Array.from(Uint8Array.from(atob(imageBase64), char => char.charCodeAt(0))),
        prompt,
        max_tokens: 350,
      })
      const raw = String(result?.description || result?.response || '')
      return Response.json(parseJson(raw), { headers })
    } catch (error) {
      console.error(error)
      return Response.json({ error: 'Cloudflare AI gagal membaca struk' }, { status: 502, headers })
    }
  },
}

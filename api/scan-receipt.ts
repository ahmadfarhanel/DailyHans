import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const workerUrl = process.env.CF_RECEIPT_SCAN_URL
  const workerSecret = process.env.CF_RECEIPT_SCAN_SECRET
  if (!workerUrl || !workerSecret) return res.status(500).json({ error: 'Cloudflare OCR belum dikonfigurasi di Vercel' })

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Scan-Secret': workerSecret,
    },
    body: JSON.stringify(req.body || {}),
  })

  return res.status(response.status).send(await response.text())
}

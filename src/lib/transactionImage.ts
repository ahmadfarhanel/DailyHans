import { supabase } from './supabase'

const BUCKET = 'transaction-images'
const MAX_SIDE = 1600

export async function compressImage(file: File): Promise<File> {
  const source = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(source.width * scale)
  canvas.height = Math.round(source.height * scale)
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height)
  source.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => result ? resolve(result) : reject(new Error('Gagal kompres gambar')), 'image/webp', 0.82)
  })
  return new File([blob], `${crypto.randomUUID()}.webp`, { type: 'image/webp' })
}

export async function prepareScanImage(file: File): Promise<File> {
  const source = await createImageBitmap(file)
  const size = Math.min(1600, Math.max(source.width, source.height))
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')!
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)
  const scale = Math.min(size / source.width, size / source.height)
  const width = Math.round(source.width * scale)
  const height = Math.round(source.height * scale)
  context.drawImage(source, Math.round((size - width) / 2), Math.round((size - height) / 2), width, height)
  source.close()
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => result ? resolve(result) : reject(new Error('Gagal menyiapkan gambar scan')), 'image/jpeg', 0.92)
  })
  return new File([blob], 'receipt-scan.jpg', { type: 'image/jpeg' })
}

export async function uploadTransactionImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Silakan login kembali')
  const compressed = await compressImage(file)
  const path = `${user.id}/${compressed.name}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, { contentType: compressed.type })
  if (error) throw error
  return path
}

export async function transactionImageUrl(path?: string | null): Promise<string | null> {
  if (!path) return null
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
  return error ? null : data.signedUrl
}

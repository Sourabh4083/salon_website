import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_UPLOAD_BYTES = 1024 * 1024 // 1MB, matches the hint on the product form
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export async function POST(req) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.formData()
    const file = data.get('image')

    if (!file || typeof file.arrayBuffer !== 'function') {

      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Image must be under 1MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const b64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${b64}`


    const uploadRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
    })

    return NextResponse.json({ url: uploadRes.secure_url })

  } catch (err) {
    console.error("❌ Cloudinary upload error:", err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

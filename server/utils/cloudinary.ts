import { v2 as cloudinary } from 'cloudinary'

function getCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary not configured')
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    timeout: 120000
  })
  return cloudinary
}

export function uploadFromBuffer(
  buffer: Buffer,
  options: Record<string, unknown> = {}
): Promise<{ secure_url: string; public_id: string }> {
  const cld = getCloudinary()
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('Upload failed'))
        return
      }
      resolve({ secure_url: result.secure_url, public_id: result.public_id })
    })
    stream.end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  const cld = getCloudinary()
  await cld.uploader.destroy(publicId, { invalidate: true })
}

export function getOptimizedUrl(
  publicId: string,
  opts: { width?: number; height?: number; crop?: string } = {}
): string {
  const cld = getCloudinary()
  return cld.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...(opts.width && { width: opts.width }),
    ...(opts.height && { height: opts.height }),
    ...(opts.crop && { crop: opts.crop })
  })
}

export function uploadAvatar(
  buffer: Buffer,
  userId: string
): Promise<{ secure_url: string; public_id: string }> {
  return uploadFromBuffer(buffer, {
    folder: 'dngblog/avatars',
    public_id: userId,
    width: 200,
    height: 200,
    crop: 'fill',
    overwrite: true
  })
}

export function uploadArticleCover(
  buffer: Buffer,
  articleSlug: string
): Promise<{ secure_url: string; public_id: string }> {
  return uploadFromBuffer(buffer, {
    folder: 'dngblog/covers',
    public_id: articleSlug,
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 'auto',
    overwrite: true
  })
}

export function uploadMedia(
  buffer: Buffer,
  filename: string
): Promise<{ secure_url: string; public_id: string }> {
  return uploadFromBuffer(buffer, {
    folder: 'dngblog/media',
    public_id: filename,
    overwrite: true
  })
}

export function uploadCategoryIcon(
  buffer: Buffer,
  categorySlug: string
): Promise<{ secure_url: string; public_id: string }> {
  return uploadFromBuffer(buffer, {
    folder: 'dngblog/categories',
    public_id: categorySlug,
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    overwrite: true
  })
}

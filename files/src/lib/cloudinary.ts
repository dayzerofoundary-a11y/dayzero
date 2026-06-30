import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure Cloudinary only if the environment variable is provided
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  format: string
  bytes: number
  width?: number
  height?: number
}

export async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<CloudinaryUploadResult> {
  const isConfigured = !!process.env.CLOUDINARY_CLOUD_NAME

  if (!isConfigured) {
    // Resilient fallback for local testing without Cloudinary credentials
    console.warn('[Cloudinary] CLOUDINARY_CLOUD_NAME is not set. Using mock upload fallback.')
    return {
      publicId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      secureUrl: `https://res.cloudinary.com/demo/image/upload/sample.jpg`,
      format: mimeType.split('/')[1] || 'bin',
      bytes: buffer.length,
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'dayzero_submissions',
        resource_type: 'auto',
        filename_override: originalName,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'))
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        })
      }
    )

    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // If mock public ID, skip deletion
  if (publicId.startsWith('mock_')) {
    console.log(`[Cloudinary] Skipping deletion for mock resource: ${publicId}`)
    return
  }

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    await cloudinary.uploader.destroy(publicId)
  }
}

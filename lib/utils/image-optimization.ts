/**
 * Image Optimization Utility
 * Handles image optimization for better performance
 */

import sharp from 'sharp'
import { NextResponse } from 'next/server'

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
}

/**
 * Optimize image buffer using sharp
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options

  let transformer = sharp(buffer)

  // Resize if dimensions provided
  if (width || height) {
    transformer = transformer.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  // Convert to specified format
  switch (format) {
    case 'webp':
      transformer = transformer.webp({ quality, effort: 4 })
      break
    case 'avif':
      transformer = transformer.avif({ quality, effort: 4 })
      break
    case 'jpeg':
      transformer = transformer.jpeg({ quality, progressive: true })
      break
    case 'png':
      transformer = transformer.png({ quality, compressionLevel: 9 })
      break
  }

  return transformer.toBuffer()
}

/**
 * Generate responsive image sizes
 */
export async function generateResponsiveSizes(
  buffer: Buffer,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): Promise<Map<number, Buffer>> {
  const results = new Map<number, Buffer>()

  await Promise.all(
    sizes.map(async (size) => {
      const optimized = await optimizeImage(buffer, { width: size })
      results.set(size, optimized)
    })
  )

  return results
}

/**
 * Get optimal image format based on Accept header
 */
export function getOptimalFormat(acceptHeader: string | null): 'avif' | 'webp' | 'jpeg' {
  if (!acceptHeader) return 'jpeg'
  
  if (acceptHeader.includes('image/avif')) return 'avif'
  if (acceptHeader.includes('image/webp')) return 'webp'
  return 'jpeg'
}

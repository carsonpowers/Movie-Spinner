/**
 * Analytics API Route
 * Collects Web Vitals and custom metrics
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface Metric {
  name: string
  value: number
  id?: string
  label?: string
  rating?: string
  delta?: number
  navigationType?: string
  unit?: string
  timestamp?: number
}

export async function POST(request: NextRequest) {
  try {
    const metric: Metric = await request.json()

    // Log metric (in production, send to analytics service)
    console.log('Metric received:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: metric.timestamp || Date.now(),
    })

    // Here you would send to your analytics service
    // Examples: Google Analytics, CloudWatch, DataDog, etc.
    
    // For CloudWatch Custom Metrics:
    // await sendToCloudWatch(metric)
    
    // For Google Analytics:
    // await sendToGA4(metric)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing metric:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}

// Example CloudWatch integration
async function sendToCloudWatch(metric: Metric) {
  // Implementation would use AWS SDK to send custom metrics
  // This is a placeholder for the actual implementation
}

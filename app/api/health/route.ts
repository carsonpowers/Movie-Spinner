/**
 * Health Check API Route
 * Used by load balancers and container orchestration
 */

import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    }
  )
}

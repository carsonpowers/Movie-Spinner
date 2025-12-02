/**
 * Toggle Watched Status API Route
 * Uses Node.js runtime for firebase-admin compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { movieId } = await request.json()

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      )
    }

    const userMovieRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('movies')
      .doc(movieId)

    // Get current movie data
    const userMovieDoc = await userMovieRef.get()
    
    if (!userMovieDoc.exists) {
      return NextResponse.json(
        { error: 'Movie not found in your list' },
        { status: 404 }
      )
    }

    const currentData = userMovieDoc.data()
    const currentWatchedStatus = currentData?.watched || false

    // Toggle the watched status
    await userMovieRef.update({
      watched: !currentWatchedStatus,
    })

    return NextResponse.json(
      { success: true, watched: !currentWatchedStatus },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error toggling watched status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle watched status' },
      { status: 500 }
    )
  }
}

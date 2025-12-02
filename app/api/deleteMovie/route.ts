/**
 * Delete Movie API Route
 * Uses Node.js runtime for firebase-admin compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { auth } from '@/auth'

// Remove edge runtime - firebase-admin requires Node.js
// export const runtime = 'edge'

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('id')

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const userMovieRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('movies')
      .doc(movieId)

    // Check if user has this movie in their list
    const userMovieDoc = await userMovieRef.get()
    
    if (!userMovieDoc.exists) {
      return NextResponse.json(
        { error: 'Movie not found in your list' },
        { status: 404 }
      )
    }

    // Delete from user's subcollection
    await userMovieRef.delete()

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    )
  }
}

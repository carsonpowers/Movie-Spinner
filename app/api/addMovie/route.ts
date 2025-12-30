/**
 * Add Movie API Route
 * Uses Node.js runtime for firebase-admin compatibility
 * Supports both authenticated users and data sync for newly registered users
 */
// cSpell:ignore Firestore

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { auth } from '@/auth'

// Remove edge runtime - firebase-admin requires Node.js
// export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    
    // For anonymous users adding movies, we'll handle this client-side with localStorage
    // This endpoint requires authentication for database operations
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - use localStorage for anonymous users' },
        { status: 401 }
      )
    }

    const { movie, docId } = await request.json()

    if (!movie || !docId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const moviesRef = adminDb.collection('movies')
    const movieDocRef = moviesRef.doc(docId)
    const userMovieRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('movies')
      .doc(docId)

    // Check if movie exists in main collection
    const movieDoc = await movieDocRef.get()
    
    if (!movieDoc.exists) {
      // Movie doesn't exist, create it in main collection
      const movieData = {
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        imdbID: docId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await movieDocRef.set(movieData)
    }

    // Add movie to user's subcollection
    const userMovieData = {
      addedAt: new Date().toISOString(),
      movieRef: docId,
    }
    await userMovieRef.set(userMovieData)

    return NextResponse.json(
      { success: true, id: docId },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error adding movie:', error)
    return NextResponse.json(
      { error: 'Failed to add movie' },
      { status: 500 }
    )
  }
}

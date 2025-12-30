/**
 * Sync Movies API Route
 * Syncs localStorage movies to user's account after sign-in
 * Uses Node.js runtime for firebase-admin compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { auth } from '@/auth'

interface LocalMovie {
  id: string
  title: string
  poster?: string
  imdbId?: string
  year?: string
  watched?: boolean
  addedAt?: string
}

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

    const { movies } = await request.json() as { movies: LocalMovie[] }

    if (!movies || !Array.isArray(movies)) {
      return NextResponse.json(
        { error: 'Invalid movies data' },
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

    const results = {
      synced: 0,
      skipped: 0,
      errors: 0,
    }

    // Process each movie
    for (const movie of movies) {
      try {
        const docId = movie.imdbId || movie.id
        const moviesRef = adminDb.collection('movies')
        const movieDocRef = moviesRef.doc(docId)
        const userMovieRef = adminDb
          .collection('users')
          .doc(userId)
          .collection('movies')
          .doc(docId)

        // Check if user already has this movie
        const userMovieDoc = await userMovieRef.get()
        if (userMovieDoc.exists) {
          results.skipped++
          continue
        }

        // Check if movie exists in main collection
        const movieDoc = await movieDocRef.get()
        
        if (!movieDoc.exists) {
          // Movie doesn't exist, create it in main collection
          const movieData = {
            title: movie.title,
            year: movie.year,
            poster: movie.poster,
            imdbID: docId,
            createdAt: movie.addedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          await movieDocRef.set(movieData)
        }

        // Add movie to user's subcollection with watched status
        const userMovieData = {
          addedAt: movie.addedAt || new Date().toISOString(),
          movieRef: docId,
          watched: movie.watched || false,
        }
        await userMovieRef.set(userMovieData)
        results.synced++
      } catch (error) {
        console.error('Error syncing movie:', movie.title, error)
        results.errors++
      }
    }

    return NextResponse.json(
      { success: true, ...results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error syncing movies:', error)
    return NextResponse.json(
      { error: 'Failed to sync movies' },
      { status: 500 }
    )
  }
}

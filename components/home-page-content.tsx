/**
 * Home Page Content - Client Component
 * Wraps movie-dependent components with the MovieDataProvider
 * Handles both authenticated and anonymous user data
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MovieList from '@/components/movie/movie-list'
import Wheel from '@/components/movie/wheel'
import RightSideMenu from '@/components/layout/right-side-menu'
import ViewNavigation from '@/components/layout/bottom-navigation'
import MovieListSkeleton from '@/components/movie/movie-list-skeleton'
import {
  useMovieStore,
  useSnackbarStore,
  hasLocalMoviesToSync,
} from '@/lib/stores'
import type { Movie } from '@/lib/firebase/firestore'

interface HomePageContentProps {
  serverMovies: Movie[]
  userId?: string
}

export default function HomePageContent({
  serverMovies,
  userId,
}: HomePageContentProps) {
  const router = useRouter()
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar)
  const { localMovies, getMoviesAsMovieType, clearMovies } = useMovieStore()
  const [isLoading, setIsLoading] = useState(!userId)
  const hasSyncedRef = useRef(false)

  // Set loading to false once component mounts for anonymous users
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
    }
  }, [userId])

  // Sync localStorage data to server when user signs in
  useEffect(() => {
    const syncLocalMovies = async () => {
      if (!userId || hasSyncedRef.current || !hasLocalMoviesToSync()) {
        return
      }

      hasSyncedRef.current = true
      const localData = localMovies

      if (localData.length === 0) {
        return
      }

      try {
        const response = await fetch('/api/syncMovies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movies: localData }),
        })

        if (response.ok) {
          const result = await response.json()
          clearMovies()

          if (result.synced > 0) {
            showSnackbar(
              `Synced ${result.synced} movie${
                result.synced > 1 ? 's' : ''
              } from your guest session!`,
              'success'
            )
            // Refresh to get the updated server data
            router.refresh()
          }
        } else {
          console.error('Failed to sync movies')
          showSnackbar(
            'Failed to sync your guest movies. They are still saved locally.',
            'error'
          )
          hasSyncedRef.current = false // Allow retry
        }
      } catch (error) {
        console.error('Error syncing movies:', error)
        showSnackbar(
          'Failed to sync your guest movies. They are still saved locally.',
          'error'
        )
        hasSyncedRef.current = false // Allow retry
      }
    }

    syncLocalMovies()
  }, [userId, router, showSnackbar, clearMovies])

  // Get movies as Movie type for anonymous users
  const moviesFromStore = getMoviesAsMovieType()

  // Determine which movies to show
  const movies = userId ? serverMovies : moviesFromStore

  if (isLoading) {
    return <MovieListSkeleton count={12} />
  }

  return (
    <>
      <MovieList movies={movies} userId={userId} />
      <Wheel movies={movies} />
      <RightSideMenu userId={userId} movieCount={movies.length} />
      <ViewNavigation movieCount={movies.length} />
    </>
  )
}

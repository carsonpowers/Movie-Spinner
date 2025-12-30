/**
 * Movie Context - Centralized State Management
 * Supports both authenticated users (server) and anonymous users (Zustand store)
 */

'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useMovieStore, useSnackbarStore } from '@/lib/stores'
import type { Movie } from '@/lib/firebase/firestore'

type Severity = 'error' | 'warning' | 'info' | 'success'

interface MovieContextType {
  refresh: () => void
  showSnackbar: (message: string, severity: Severity) => void
  // Anonymous user support
  isAnonymous: boolean
  localMovies: Movie[]
  addMovieLocal: (movie: {
    title: string
    year?: string
    poster?: string
    imdbId?: string
  }) => Movie
  deleteMovieLocal: (movieId: string) => boolean
  toggleWatchedLocal: (movieId: string) => boolean | null
}

const MovieContext = createContext<MovieContextType | undefined>(undefined)

interface MovieProviderProps {
  children: ReactNode
  onSnackbar: (message: string, severity: Severity) => void
  userId?: string
}

export function MovieProvider({
  children,
  onSnackbar,
  userId,
}: MovieProviderProps) {
  const router = useRouter()
  const {
    localMovies: storeMovies,
    addMovie,
    deleteMovie,
    toggleWatched,
    getMoviesAsMovieType,
  } = useMovieStore()

  const isAnonymous = !userId
  const localMovies = getMoviesAsMovieType()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  const showSnackbar = useCallback(
    (message: string, severity: Severity) => {
      onSnackbar(message, severity)
    },
    [onSnackbar]
  )

  const addMovieLocal = useCallback(
    (movie: {
      title: string
      year?: string
      poster?: string
      imdbId?: string
    }): Movie => {
      const newMovie = addMovie({
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        imdbId: movie.imdbId,
      })
      return {
        id: newMovie.id,
        userId: 'anonymous',
        title: newMovie.title,
        poster: newMovie.poster,
        imdbId: newMovie.imdbId,
        year: newMovie.year,
        watched: newMovie.watched,
        createdAt: newMovie.createdAt,
        updatedAt: newMovie.updatedAt,
        addedAt: newMovie.addedAt,
      }
    },
    [addMovie]
  )

  const deleteMovieLocal = useCallback(
    (movieId: string): boolean => {
      return deleteMovie(movieId)
    },
    [deleteMovie]
  )

  const toggleWatchedLocal = useCallback(
    (movieId: string): boolean | null => {
      return toggleWatched(movieId)
    },
    [toggleWatched]
  )

  return (
    <MovieContext.Provider
      value={{
        refresh,
        showSnackbar,
        isAnonymous,
        localMovies,
        addMovieLocal,
        deleteMovieLocal,
        toggleWatchedLocal,
      }}
    >
      {children}
    </MovieContext.Provider>
  )
}

export function useMovieContext() {
  const context = useContext(MovieContext)
  if (!context) {
    throw new Error('useMovieContext must be used within MovieProvider')
  }
  return context
}

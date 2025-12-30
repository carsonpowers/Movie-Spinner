/**
 * Movie Context - Centralized State Management
 * Supports both authenticated users (server) and anonymous users (localStorage)
 */

'use client'

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  getLocalMovies,
  addLocalMovie,
  deleteLocalMovie,
  toggleLocalMovieWatched,
  saveLocalMovies,
  localMovieToMovie,
  type LocalMovie,
} from '@/lib/local-storage'
import type { Movie } from '@/lib/firebase/firestore'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'error' | 'warning' | 'info' | 'success'
}

interface MovieContextType {
  refresh: () => void
  showSnackbar: (message: string, severity: SnackbarState['severity']) => void
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
  refreshLocalMovies: () => void
}

const MovieContext = createContext<MovieContextType | undefined>(undefined)

interface MovieProviderProps {
  children: ReactNode
  onSnackbar: (message: string, severity: SnackbarState['severity']) => void
  userId?: string
}

export function MovieProvider({
  children,
  onSnackbar,
  userId,
}: MovieProviderProps) {
  const router = useRouter()
  const [localMovies, setLocalMovies] = useState<Movie[]>([])
  const isAnonymous = !userId

  // Load local movies on mount
  useEffect(() => {
    if (isAnonymous) {
      const movies = getLocalMovies()
      setLocalMovies(movies.map((m) => localMovieToMovie(m)))
    }
  }, [isAnonymous])

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity']) => {
      onSnackbar(message, severity)
    },
    [onSnackbar]
  )

  const refreshLocalMovies = useCallback(() => {
    const movies = getLocalMovies()
    setLocalMovies(movies.map((m) => localMovieToMovie(m)))
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('localMoviesUpdated'))
  }, [])

  const addMovieLocal = useCallback(
    (movie: {
      title: string
      year?: string
      poster?: string
      imdbId?: string
    }): Movie => {
      const newMovie = addLocalMovie({
        title: movie.title,
        year: movie.year,
        poster: movie.poster,
        imdbId: movie.imdbId,
      })
      refreshLocalMovies()
      return localMovieToMovie(newMovie)
    },
    [refreshLocalMovies]
  )

  const deleteMovieLocal = useCallback(
    (movieId: string): boolean => {
      const result = deleteLocalMovie(movieId)
      if (result) {
        refreshLocalMovies()
      }
      return result
    },
    [refreshLocalMovies]
  )

  const toggleWatchedLocal = useCallback(
    (movieId: string): boolean | null => {
      const result = toggleLocalMovieWatched(movieId)
      if (result !== null) {
        refreshLocalMovies()
      }
      return result
    },
    [refreshLocalMovies]
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
        refreshLocalMovies,
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

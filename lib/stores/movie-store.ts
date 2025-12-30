/**
 * Movie Store - Zustand store for local movie management
 * Handles movies for anonymous users via localStorage
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/lib/firebase/firestore'

interface LocalMovie {
  id: string
  title: string
  poster?: string
  imdbId?: string
  year?: string
  genre?: string
  rating?: string
  createdAt?: number
  updatedAt?: number
  addedAt?: string
  watched?: boolean
}

interface MovieState {
  localMovies: LocalMovie[]
  
  // Actions
  addMovie: (movie: Omit<LocalMovie, 'id' | 'createdAt' | 'updatedAt' | 'addedAt' | 'watched'>) => LocalMovie
  deleteMovie: (movieId: string) => boolean
  toggleWatched: (movieId: string) => boolean | null
  clearMovies: () => void
  getMoviesAsMovieType: () => Movie[]
}

/**
 * Convert LocalMovie to Movie format for components
 */
function localMovieToMovie(localMovie: LocalMovie, userId: string = 'anonymous'): Movie {
  return {
    id: localMovie.id,
    userId,
    title: localMovie.title,
    poster: localMovie.poster,
    imdbId: localMovie.imdbId,
    year: localMovie.year,
    genre: localMovie.genre,
    rating: localMovie.rating,
    createdAt: localMovie.createdAt,
    updatedAt: localMovie.updatedAt,
    addedAt: localMovie.addedAt,
    watched: localMovie.watched,
  }
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set, get) => ({
      localMovies: [],
      
      addMovie: (movie) => {
        const movies = get().localMovies
        
        // Check if movie already exists (by imdbId)
        const existing = movies.find((m) => m.imdbId === movie.imdbId)
        if (existing) {
          return existing
        }
        
        const newMovie: LocalMovie = {
          ...movie,
          id: movie.imdbId || `local-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          addedAt: new Date().toISOString(),
          watched: false,
        }
        
        set({ localMovies: [newMovie, ...movies] })
        return newMovie
      },
      
      deleteMovie: (movieId) => {
        const movies = get().localMovies
        const filteredMovies = movies.filter((m) => m.id !== movieId)
        
        if (filteredMovies.length === movies.length) {
          return false
        }
        
        set({ localMovies: filteredMovies })
        return true
      },
      
      toggleWatched: (movieId) => {
        const movies = get().localMovies
        const movieIndex = movies.findIndex((m) => m.id === movieId)
        
        if (movieIndex === -1) {
          return null
        }
        
        const updatedMovies = [...movies]
        updatedMovies[movieIndex] = {
          ...updatedMovies[movieIndex],
          watched: !updatedMovies[movieIndex].watched,
          updatedAt: Date.now(),
        }
        
        set({ localMovies: updatedMovies })
        return updatedMovies[movieIndex].watched ?? false
      },
      
      clearMovies: () => set({ localMovies: [] }),
      
      getMoviesAsMovieType: () => {
        return get().localMovies.map((m) => localMovieToMovie(m))
      },
    }),
    {
      name: 'movie-wheel-anonymous-movies',
    }
  )
)

// Helper to check if there are movies to sync
export function hasLocalMoviesToSync(): boolean {
  return useMovieStore.getState().localMovies.length > 0
}

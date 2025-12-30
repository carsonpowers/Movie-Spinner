/**
 * Local Storage Service
 * Manages movie data for anonymous users in localStorage
 */

import type { Movie } from '@/lib/firebase/firestore'

const STORAGE_KEY = 'movie-wheel-anonymous-movies'
const SYNCED_KEY = 'movie-wheel-synced'

export interface LocalMovie {
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

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Get all movies from localStorage
 */
export function getLocalMovies(): LocalMovie[] {
  if (!isBrowser()) return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading movies from localStorage:', error)
    return []
  }
}

/**
 * Save movies to localStorage
 */
export function saveLocalMovies(movies: LocalMovie[]): void {
  if (!isBrowser()) return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies))
  } catch (error) {
    console.error('Error saving movies to localStorage:', error)
  }
}

/**
 * Add a movie to localStorage
 */
export function addLocalMovie(movie: Omit<LocalMovie, 'id' | 'createdAt' | 'updatedAt' | 'addedAt'>): LocalMovie {
  const movies = getLocalMovies()
  
  // Check if movie already exists (by imdbId)
  const existingIndex = movies.findIndex(m => m.imdbId === movie.imdbId)
  if (existingIndex !== -1) {
    return movies[existingIndex]
  }

  const newMovie: LocalMovie = {
    ...movie,
    id: movie.imdbId || `local-${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    addedAt: new Date().toISOString(),
    watched: false,
  }

  movies.unshift(newMovie)
  saveLocalMovies(movies)
  return newMovie
}

/**
 * Delete a movie from localStorage
 */
export function deleteLocalMovie(movieId: string): boolean {
  const movies = getLocalMovies()
  const filteredMovies = movies.filter(m => m.id !== movieId)
  
  if (filteredMovies.length === movies.length) {
    return false
  }
  
  saveLocalMovies(filteredMovies)
  return true
}

/**
 * Toggle watched status of a movie in localStorage
 */
export function toggleLocalMovieWatched(movieId: string): boolean | null {
  const movies = getLocalMovies()
  const movieIndex = movies.findIndex(m => m.id === movieId)
  
  if (movieIndex === -1) {
    return null
  }
  
  movies[movieIndex].watched = !movies[movieIndex].watched
  movies[movieIndex].updatedAt = Date.now()
  saveLocalMovies(movies)
  return movies[movieIndex].watched
}

/**
 * Check if there are local movies to sync
 */
export function hasLocalMoviesToSync(): boolean {
  if (!isBrowser()) return false
  const movies = getLocalMovies()
  return movies.length > 0
}

/**
 * Clear all local movies (after successful sync)
 */
export function clearLocalMovies(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Mark local data as synced
 */
export function markAsSynced(): void {
  if (!isBrowser()) return
  localStorage.setItem(SYNCED_KEY, 'true')
}

/**
 * Check if local data has been synced
 */
export function hasBeenSynced(): boolean {
  if (!isBrowser()) return false
  return localStorage.getItem(SYNCED_KEY) === 'true'
}

/**
 * Clear synced flag
 */
export function clearSyncedFlag(): void {
  if (!isBrowser()) return
  localStorage.removeItem(SYNCED_KEY)
}

/**
 * Convert LocalMovie to Movie format for components
 */
export function localMovieToMovie(localMovie: LocalMovie, userId: string = 'anonymous'): Movie {
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

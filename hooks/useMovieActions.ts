/**
 * Movie Actions Hook - Centralized API operations
 * Provides consistent error handling and loading states
 * Supports both authenticated users (API) and anonymous users (localStorage)
 */

'use client'

import { useState, useCallback } from 'react'
import { useMovieContext } from '@/contexts/MovieContext'

interface UseMovieActionsOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useMovieActions(options: UseMovieActionsOptions = {}) {
  const { 
    refresh, 
    showSnackbar, 
    isAnonymous,
    toggleWatchedLocal,
    deleteMovieLocal,
    refreshLocalMovies,
  } = useMovieContext()
  const [isLoading, setIsLoading] = useState(false)

  const toggleWatched = useCallback(
    async (movieId: string) => {
      setIsLoading(true)
      try {
        if (isAnonymous) {
          // Handle locally for anonymous users
          const result = toggleWatchedLocal(movieId)
          if (result === null) {
            throw new Error('Movie not found')
          }
          options.onSuccess?.()
          return true
        }

        // Authenticated user - use API
        const response = await fetch('/api/toggleWatched', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movieId }),
        })

        if (!response.ok) {
          throw new Error('Failed to toggle watched status')
        }

        refresh()
        options.onSuccess?.()
        return true
      } catch (error) {
        console.error('Error toggling watched status:', error)
        showSnackbar('Failed to update watched status', 'error')
        options.onError?.(error as Error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [refresh, showSnackbar, options, isAnonymous, toggleWatchedLocal]
  )

  const deleteMovie = useCallback(
    async (movieId: string, movieTitle?: string) => {
      setIsLoading(true)
      try {
        if (isAnonymous) {
          // Handle locally for anonymous users
          const result = deleteMovieLocal(movieId)
          if (!result) {
            throw new Error('Movie not found')
          }
          showSnackbar(
            `${movieTitle || 'Movie'} removed successfully`,
            'success'
          )
          options.onSuccess?.()
          return true
        }

        // Authenticated user - use API
        const response = await fetch(`/api/deleteMovie?id=${movieId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete movie')
        }

        showSnackbar(
          `${movieTitle || 'Movie'} removed successfully`,
          'success'
        )
        
        // Wait for animation before refreshing
        await new Promise((resolve) => setTimeout(resolve, 300))
        refresh()
        options.onSuccess?.()
        return true
      } catch (error) {
        console.error('Error deleting movie:', error)
        showSnackbar('Failed to delete movie. Please try again.', 'error')
        options.onError?.(error as Error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [refresh, showSnackbar, options, isAnonymous, deleteMovieLocal]
  )

  return {
    toggleWatched,
    deleteMovie,
    isLoading,
  }
}

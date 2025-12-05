/**
 * Movie Context - Centralized State Management
 * Replaces global module state with React Context
 */

'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'error' | 'warning' | 'info' | 'success'
}

interface MovieContextType {
  refresh: () => void
  showSnackbar: (message: string, severity: SnackbarState['severity']) => void
}

const MovieContext = createContext<MovieContextType | undefined>(undefined)

interface MovieProviderProps {
  children: ReactNode
  onSnackbar: (message: string, severity: SnackbarState['severity']) => void
}

export function MovieProvider({ children, onSnackbar }: MovieProviderProps) {
  const router = useRouter()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity']) => {
      onSnackbar(message, severity)
    },
    [onSnackbar]
  )

  return (
    <MovieContext.Provider value={{ refresh, showSnackbar }}>
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

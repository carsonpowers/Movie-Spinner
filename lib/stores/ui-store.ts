/**
 * UI Store - Zustand store for UI state
 * Manages view mode, filters, and wheel settings
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ViewMode = 'grid' | 'table'
type WatchedFilter = 'all' | 'hideWatched' | 'onlyWatched'

interface UIState {
  // View settings
  viewMode: ViewMode
  movieSize: number
  
  // Filters
  filterText: string
  watchedFilter: WatchedFilter
  
  // Wheel settings
  isWheelVisible: boolean
  wheelFriction: number
  
  // Actions
  setViewMode: (mode: ViewMode) => void
  setMovieSize: (size: number) => void
  setFilterText: (text: string) => void
  setWatchedFilter: (filter: WatchedFilter) => void
  setIsWheelVisible: (visible: boolean) => void
  setWheelFriction: (friction: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      viewMode: 'grid',
      movieSize: 11,
      filterText: '',
      watchedFilter: 'all',
      isWheelVisible: false,
      wheelFriction: 40,
      
      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setMovieSize: (size) => {
        document.documentElement.style.setProperty('--item-size', `${size}rem`)
        set({ movieSize: size })
      },
      setFilterText: (text) => set({ filterText: text }),
      setWatchedFilter: (filter) => set({ watchedFilter: filter }),
      setIsWheelVisible: (visible) => set({ isWheelVisible: visible }),
      setWheelFriction: (friction) => set({ wheelFriction: friction }),
    }),
    {
      name: 'movie-wheel-ui',
      partialize: (state) => ({
        // Only persist these values
        viewMode: state.viewMode,
        movieSize: state.movieSize,
        watchedFilter: state.watchedFilter,
        wheelFriction: state.wheelFriction,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply movie size CSS variable on rehydration
        if (state?.movieSize) {
          document.documentElement.style.setProperty(
            '--item-size',
            `${state.movieSize}rem`
          )
        }
      },
    }
  )
)

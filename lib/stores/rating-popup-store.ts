/**
 * Rating Popup Store - Zustand store for rating popup state
 * Manages the rating popup visibility and data
 */

import { create } from 'zustand'

interface RatingPopupData {
  rating: string
  title: string
  poster?: string
  year?: string
}

interface RatingPopupState {
  isVisible: boolean
  data: RatingPopupData | null
  shouldPlayTrailer: boolean
  
  // Actions
  showPopup: (data: RatingPopupData) => void
  hidePopup: () => void
  triggerPlayTrailer: () => void
  resetPlayTrailer: () => void
}

export const useRatingPopupStore = create<RatingPopupState>((set) => ({
  isVisible: false,
  data: null,
  shouldPlayTrailer: false,
  
  showPopup: (data) => set({ isVisible: true, data, shouldPlayTrailer: false }),
  hidePopup: () => set({ isVisible: false, shouldPlayTrailer: false }),
  triggerPlayTrailer: () => set({ isVisible: false, shouldPlayTrailer: true }),
  resetPlayTrailer: () => set({ shouldPlayTrailer: false }),
}))

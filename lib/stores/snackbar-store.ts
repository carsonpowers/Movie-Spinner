/**
 * Snackbar Store - Zustand store for toast notifications
 */

import { create } from 'zustand'

type Severity = 'error' | 'warning' | 'info' | 'success'

interface SnackbarState {
  open: boolean
  message: string
  severity: Severity
  
  // Actions
  showSnackbar: (message: string, severity?: Severity) => void
  hideSnackbar: () => void
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  
  showSnackbar: (message, severity = 'info') =>
    set({
      open: true,
      message,
      severity,
    }),
    
  hideSnackbar: () =>
    set((state) => ({
      ...state,
      open: false,
    })),
}))

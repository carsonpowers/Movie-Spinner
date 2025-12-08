'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'error' | 'warning' | 'info' | 'success'
}

interface SnackbarContextType {
  showSnackbar: (
    message: string,
    severity?: 'error' | 'warning' | 'info' | 'success'
  ) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
)

function SlideUpTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction='up' />
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  })

  const showSnackbar = useCallback(
    (
      message: string,
      severity: 'error' | 'warning' | 'info' | 'success' = 'info'
    ) => {
      setSnackbar({
        open: true,
        message,
        severity,
      })
    },
    []
  )

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        TransitionComponent={SlideUpTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          bottom: '16px !important',
          left: '16px !important',
        }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            boxShadow: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const context = useContext(SnackbarContext)
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

/**
 * Global Snackbar Component
 * Uses Zustand store for state management
 */

'use client'

import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import { useSnackbarStore } from '@/lib/stores'

function SlideUpTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction='up' />
}

export default function GlobalSnackbar() {
  const { open, message, severity, hideSnackbar } = useSnackbarStore()

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={hideSnackbar}
      TransitionComponent={SlideUpTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{
        bottom: '16px !important',
        left: '16px !important',
      }}
    >
      <Alert
        onClose={hideSnackbar}
        severity={severity}
        sx={{
          width: '100%',
          boxShadow: 3,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

'use client'

import { useEffect } from 'react'
import Fab from '@mui/material/Fab'
import RefreshIcon from '@mui/icons-material/Refresh'
import HomeIcon from '@mui/icons-material/Home'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <div className='space-y-4'>
          <h1 className='text-6xl font-bold text-red-500'>Oops!</h1>
          <h2 className='text-2xl font-semibold'>Something went wrong</h2>
          <p className='text-gray-400'>
            We encountered an unexpected error. Don&apos;t worry, your data is
            safe.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className='mt-4 p-4 bg-gray-800 rounded-lg text-left'>
            <summary className='cursor-pointer text-sm font-mono text-gray-300 hover:text-white'>
              Error Details (Development Only)
            </summary>
            <pre className='mt-2 text-xs text-red-400 overflow-auto max-h-40'>
              {error.message}
            </pre>
            {error.digest && (
              <p className='mt-2 text-xs text-gray-500'>
                Error ID: {error.digest}
              </p>
            )}
          </details>
        )}

        <div className='flex gap-4 justify-center pt-4'>
          <Fab
            variant='extended'
            color='primary'
            onClick={reset}
            sx={{
              textTransform: 'none',
              px: 3,
            }}
          >
            <RefreshIcon sx={{ mr: 1 }} />
            Try Again
          </Fab>

          <Fab
            variant='extended'
            onClick={() => (window.location.href = '/')}
            sx={{
              textTransform: 'none',
              px: 3,
              bgcolor: 'rgb(75 85 99)',
              '&:hover': {
                bgcolor: 'rgb(55 65 81)',
              },
            }}
          >
            <HomeIcon sx={{ mr: 1 }} />
            Go Home
          </Fab>
        </div>
      </div>
    </div>
  )
}

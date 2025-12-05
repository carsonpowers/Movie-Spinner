'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body className='bg-black text-white'>
        <div className='flex flex-col items-center justify-center min-h-screen p-4'>
          <div className='max-w-md w-full space-y-8 text-center'>
            <div className='space-y-4'>
              <h1 className='text-6xl font-bold text-red-500'>500</h1>
              <h2 className='text-2xl font-semibold'>Critical Error</h2>
              <p className='text-gray-400'>
                Something went seriously wrong. Please refresh the page.
              </p>
            </div>

            <div className='flex gap-4 justify-center pt-4'>
              <button
                onClick={reset}
                className='px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors'
              >
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className='px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors'
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error.digest && (
              <p className='mt-4 text-xs text-gray-500'>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}

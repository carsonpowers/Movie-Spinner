/**
 * Movie List Skeleton - Loading State Component
 * Shows skeleton loaders while movies are being fetched
 */

'use client'

import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

interface MovieSkeletonProps {
  count?: number
  variant?: 'grid' | 'table'
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul
      id='movie-list-skeleton'
      className='flex p-4 flex-wrap transition-all duration-1000 ease-smooth content-start justify-start max-h-[75vh] gap-x-4'
    >
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className='flex-none h-item'
          style={{ width: 'var(--item-size)' }}
        >
          <Skeleton
            variant='rectangular'
            width='100%'
            height='calc(var(--item-size) * 1.481)'
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
            }}
            animation='wave'
          />
        </li>
      ))}
    </ul>
  )
}

export function MovieTableSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Box
      sx={{
        maxWidth: '90%',
        maxHeight: 'calc(100vh - 200px)',
        width: 'fit-content',
        overflow: 'auto',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: 1,
        p: 2,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            mb: 2,
            pb: 2,
            borderBottom:
              index < count - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}
        >
          <Skeleton
            variant='rectangular'
            width={50}
            height={74}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1,
            }}
            animation='wave'
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant='text'
              width='60%'
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                fontSize: '1rem',
              }}
              animation='wave'
            />
            <Skeleton
              variant='text'
              width='20%'
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                fontSize: '0.875rem',
              }}
              animation='wave'
            />
          </Box>
          <Skeleton
            variant='circular'
            width={40}
            height={40}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}
            animation='wave'
          />
          <Skeleton
            variant='circular'
            width={40}
            height={40}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}
            animation='wave'
          />
        </Box>
      ))}
    </Box>
  )
}

export default function MovieListSkeleton({
  count = 12,
  variant = 'grid',
}: MovieSkeletonProps) {
  return (
    <section
      id='movie-list-skeleton'
      className={`opacity-100 ${
        variant === 'grid' ? 'h-screen' : 'min-h-screen'
      } flex transition-all duration-1000 ease-smooth justify-center m-0 p-20 box-border overflow-auto`}
    >
      {variant === 'grid' ? (
        <MovieGridSkeleton count={count} />
      ) : (
        <MovieTableSkeleton count={count} />
      )}
    </section>
  )
}

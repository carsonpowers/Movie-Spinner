'use client'

import { useState } from 'react'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import SearchInput from '@/components/common/search-input'

interface AddMovieFabProps {
  userId?: string
  movieCount?: number
}

export default function AddMovieFab({
  userId,
  movieCount = 0,
}: AddMovieFabProps) {
  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Allow both authenticated and anonymous users to add movies
  return (
    <>
      {movieCount === 0 && (
        <style jsx global>{`
          @keyframes pulse-glow {
            0%,
            100% {
              box-shadow: 0 0 20px rgba(76, 175, 80, 0.6),
                0 0 40px rgba(76, 175, 80, 0.4), 0 0 60px rgba(76, 175, 80, 0.2);
            }
            50% {
              box-shadow: 0 0 30px rgba(76, 175, 80, 0.8),
                0 0 60px rgba(76, 175, 80, 0.6), 0 0 90px rgba(76, 175, 80, 0.4);
            }
          }
          @keyframes bounce-subtle {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      )}
      <Tooltip
        title='Add Movie'
        arrow
        placement='left'
        open={movieCount === 0 ? !isHovered : undefined}
        slotProps={{
          tooltip: {
            sx:
              movieCount === 0
                ? {
                    bgcolor: '#4caf50',
                    animation: isHovered
                      ? 'pulse-glow 2s ease-in-out infinite'
                      : 'bounce-subtle 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite',
                    boxShadow:
                      '0 0 20px rgba(76, 175, 80, 0.6), 0 0 40px rgba(76, 175, 80, 0.4)',
                    pointerEvents: 'none',
                    '& .MuiTooltip-arrow': {
                      color: '#4caf50',
                    },
                  }
                : undefined,
          },
        }}
      >
        <Fab
          color='primary'
          aria-label='add movie'
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            ...(movieCount === 0 && {
              bgcolor: '#4caf50',
              animation:
                'pulse-glow 2s ease-in-out infinite, bounce-subtle 3s ease-in-out infinite',
              '&:hover': {
                bgcolor: '#45a049',
                animation: 'none',
                '& svg': {
                  transform: 'rotate(90deg) scale(1.1)',
                  transition: 'transform 0.2s ease-in-out',
                },
              },
            }),
            ...((movieCount ?? 0) > 0 && {
              '&:hover': {
                '& svg': {
                  transform: 'rotate(90deg) scale(1.1)',
                  transition: 'transform 0.2s ease-in-out',
                },
              },
            }),
            '& svg': {
              transition: 'none',
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <SearchInput
        mode='add'
        open={open}
        onClose={handleClose}
        userId={userId}
      />
    </>
  )
}

'use client'

import { useState } from 'react'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import UnifiedSearchInput from '@/components/unified-search-input'

interface AddMovieFabProps {
  userId?: string
}

export default function AddMovieFab({ userId }: AddMovieFabProps) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  if (!userId) {
    return null
  }

  return (
    <>
      <Tooltip title='Add Movie' arrow placement='left'>
        <Fab
          color='primary'
          aria-label='add movie'
          onClick={handleClick}
          sx={{
            '&:hover': {
              '& svg': {
                transform: 'rotate(90deg) scale(1.1)',
                transition: 'transform 0.2s ease-in-out',
              },
            },
            '& svg': {
              transition: 'none',
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <UnifiedSearchInput
        mode='add'
        open={open}
        onClose={handleClose}
        userId={userId}
      />
    </>
  )
}

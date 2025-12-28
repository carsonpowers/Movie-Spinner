'use client'

import { useState } from 'react'
import Fab from '@mui/material/Fab'
import SearchIcon from '@mui/icons-material/Search'
import Tooltip from '@mui/material/Tooltip'
import SearchInput from '@/components/common/search-input'

export default function FilterFab() {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Tooltip title='Filter Movies' arrow placement='left'>
        <Fab
          color='secondary'
          aria-label='filter movies'
          onClick={handleClick}
          sx={{
            bgcolor: 'rgb(107 114 128 / 0.75)',
            '&:hover': {
              bgcolor: 'rgb(107 114 128 / 0.95)',
              '& svg': {
                transform: 'scale(1.1)',
                transition: 'transform 0.1s ease-in-out',
              },
            },
            '& svg': {
              transition: 'transform 0.1s ease-in-out',
            },
          }}
        >
          <SearchIcon sx={{ color: 'white' }} />
        </Fab>
      </Tooltip>
      <SearchInput mode='filter' open={open} onClose={handleClose} />
    </>
  )
}

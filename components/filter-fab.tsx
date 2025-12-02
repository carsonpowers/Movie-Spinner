'use client'

import { useState } from 'react'
import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import Box from '@mui/material/Box'
import SearchIcon from '@mui/icons-material/Search'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

export default function FilterFab() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [inputValue, setInputValue] = useState('')

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleInputChange = (_event: React.SyntheticEvent, value: string) => {
    setInputValue(value)
    // Dispatch custom event to filter movies
    window.dispatchEvent(
      new CustomEvent('filterMovies', { detail: value.toLowerCase() })
    )
  }

  const handleClear = () => {
    setInputValue('')
    window.dispatchEvent(new CustomEvent('filterMovies', { detail: '' }))
  }

  return (
    <>
      <Tooltip title='Filter Movies' arrow placement='left'>
        <Fab
          color='secondary'
          aria-label='filter movies'
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: '5rem',
            right: '1rem',
            zIndex: 1000,
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 350,
            maxWidth: '90vw',
            p: 2,
          },
        }}
      >
        <Box>
          <TextField
            fullWidth
            placeholder='Filter by title or year...'
            value={inputValue}
            onChange={(e) => handleInputChange(e as any, e.target.value)}
            autoFocus
            InputProps={{
              endAdornment: inputValue && (
                <Box
                  component='span'
                  onClick={handleClear}
                  sx={{
                    cursor: 'pointer',
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  ✕
                </Box>
              ),
            }}
          />
        </Box>
      </Menu>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import SettingsIcon from '@mui/icons-material/Settings'

export default function SettingsFab() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [movieSize, setMovieSize] = useState(11) // Default 11rem
  const [watchedFilter, setWatchedFilter] = useState<'all' | 'hideWatched' | 'onlyWatched'>('all')

  useEffect(() => {
    // Load saved movie size from localStorage
    const savedSize = localStorage.getItem('movieSize')
    if (savedSize) {
      const size = parseFloat(savedSize)
      setMovieSize(size)
      document.documentElement.style.setProperty('--item-size', `${size}rem`)
    }

    // Load watched filter preference
    const savedFilter = localStorage.getItem('watchedFilter') as 'all' | 'hideWatched' | 'onlyWatched'
    if (savedFilter && ['all', 'hideWatched', 'onlyWatched'].includes(savedFilter)) {
      setWatchedFilter(savedFilter)
      window.dispatchEvent(
        new CustomEvent('watchedFilterChange', { detail: savedFilter })
      )
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMovieSizeChange = (_event: Event, value: number | number[]) => {
    const size = Array.isArray(value) ? value[0] : value
    setMovieSize(size)
    document.documentElement.style.setProperty('--item-size', `${size}rem`)
    localStorage.setItem('movieSize', size.toString())
  }

  const handleHideWatchedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFilter = event.target.checked ? 'hideWatched' : 'all'
    setWatchedFilter(newFilter)
    localStorage.setItem('watchedFilter', newFilter)
    window.dispatchEvent(
      new CustomEvent('watchedFilterChange', { detail: newFilter })
    )
  }

  const handleOnlyWatchedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFilter = event.target.checked ? 'onlyWatched' : 'all'
    setWatchedFilter(newFilter)
    localStorage.setItem('watchedFilter', newFilter)
    window.dispatchEvent(
      new CustomEvent('watchedFilterChange', { detail: newFilter })
    )
  }

  return (
    <>
      <Tooltip title='Settings' arrow placement='left'>
        <Fab
          color='secondary'
          aria-label='settings'
          onClick={handleClick}
          sx={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1000,
            bgcolor: 'rgb(107 114 128 / 0.75)',
            '&:hover': {
              bgcolor: 'rgb(107 114 128 / 0.95)',
              '& svg': {
                transform: 'rotate(45deg) scale(1.1)',
                transition: 'transform 0.2s ease-in-out',
              },
            },
            '& svg': {
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <SettingsIcon sx={{ color: 'white' }} />
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
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxWidth: '90vw',
            p: 2,
            mt: 6,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant='body2'
              sx={{ minWidth: '2.5rem', fontWeight: 600 }}
            >
              Size
            </Typography>
            <Slider
              value={movieSize}
              onChange={handleMovieSizeChange}
              min={8.5}
              max={20}
              step={0.5}
              valueLabelDisplay='auto'
              valueLabelFormat={(value) => `${value}rem`}
              sx={{
                flex: 1,
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(107, 114, 128, 0.16)',
                  },
                },
              }}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={watchedFilter === 'hideWatched'}
                  onChange={handleHideWatchedChange}
                  size='small'
                />
              }
              label={
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  Hide Watched Movies
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={watchedFilter === 'onlyWatched'}
                  onChange={handleOnlyWatchedChange}
                  size='small'
                />
              }
              label={
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  Show Only Watched Movies
                </Typography>
              }
            />
          </Box>
        </Box>
      </Menu>
    </>
  )
}

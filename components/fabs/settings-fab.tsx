'use client'

import { useState } from 'react'
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
import { useUIStore } from '@/lib/stores'

export default function SettingsFab() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const {
    movieSize,
    viewMode,
    isWheelVisible,
    watchedFilter,
    wheelFriction,
    setMovieSize,
    setWatchedFilter,
    setWheelFriction,
  } = useUIStore()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMovieSizeChange = (_event: Event, value: number | number[]) => {
    const size = Array.isArray(value) ? value[0] : value
    setMovieSize(size)
  }

  const handleHideWatchedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFilter = event.target.checked ? 'hideWatched' : 'all'
    setWatchedFilter(newFilter)
  }

  const handleOnlyWatchedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFilter = event.target.checked ? 'onlyWatched' : 'all'
    setWatchedFilter(newFilter)
  }

  const handleWheelFrictionChange = (
    _event: Event,
    value: number | number[]
  ) => {
    const friction = Array.isArray(value) ? value[0] : value
    setWheelFriction(friction)
  }

  return (
    <>
      <Tooltip title='Settings' arrow placement='left'>
        <Fab
          color='secondary'
          aria-label='settings'
          onClick={handleClick}
          sx={{
            bgcolor: 'rgb(107 114 128 / 0.75)',
            '&:hover': {
              bgcolor: 'rgb(107 114 128 / 0.95)',
              '& svg': {
                transform: 'rotate(60deg) scale(1.1)',
                transition: 'transform 0.2s ease-in-out',
              },
            },
            '& svg': {
              transition: 'none',
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
          {viewMode === 'grid' && !isWheelVisible && (
            <>
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
            </>
          )}
          {isWheelVisible && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant='body2'
                  sx={{ minWidth: '2.5rem', fontWeight: 600 }}
                >
                  Friction
                </Typography>
                <Slider
                  value={wheelFriction}
                  onChange={handleWheelFrictionChange}
                  min={5}
                  max={100}
                  step={5}
                  valueLabelDisplay='auto'
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
            </>
          )}
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

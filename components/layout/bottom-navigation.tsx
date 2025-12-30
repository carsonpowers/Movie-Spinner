/**
 * Bottom Navigation Component - Client Component
 * Controls visibility of movie list vs wheel
 */

'use client'
import React, { useState, useEffect } from 'react'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import AlbumIcon from '@mui/icons-material/Album'
import ListIcon from '@mui/icons-material/List'
import TableChartIcon from '@mui/icons-material/TableChart'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import { showWheel, hideWheel } from '@/components/movie/wheel'
import { useSnackbarStore, useUIStore } from '@/lib/stores'

interface ViewNavigationProps {
  movieCount: number
}

const ViewNavigation = ({ movieCount }: ViewNavigationProps) => {
  const [value, setValue] = useState(1) // 0: wheel, 1: grid, 2: table
  const [isNear, setIsNear] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar)
  const { viewMode, setViewMode, setIsWheelVisible } = useUIStore()

  // Sync value state with viewMode from store
  useEffect(() => {
    if (viewMode === 'table') {
      setValue(2)
    } else {
      setValue(1)
    }
  }, [viewMode])

  useEffect(() => {
    // Detect if device is touch-enabled (mobile/tablet)
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(pointer: coarse)').matches
      )
    }
    checkTouchDevice()
  }, [])

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Check if user is trying to access wheel with less than 2 movies
    if (newValue === 0 && movieCount < 2) {
      showSnackbar('Add at least 2 movies to use the wheel', 'warning')
      return
    }

    // Toggle wheel if clicking the wheel button when it's already selected
    if (newValue === 0 && value === 0) {
      // Toggle to list view
      setValue(1)
      hideWheel()
      setViewMode('grid')
      setIsWheelVisible(false)
      return
    }

    // Update view mode based on button selection
    if (newValue === 1 || newValue === 2) {
      const newViewMode = newValue === 2 ? 'table' : 'grid'
      setViewMode(newViewMode)
      setIsWheelVisible(false)
    }

    setValue(newValue)

    if (newValue === 0) {
      showWheel()
      setIsWheelVisible(true)
    } else {
      hideWheel()
    }
  }

  return (
    <>
      <div
        className='fixed bottom-0 left-1/2 z-30 -translate-x-1/2 p-10 pb-0'
        onMouseEnter={() => setIsNear(true)}
        onMouseLeave={() => setIsNear(false)}
      >
        <Paper
          sx={{
            width: 'auto',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform:
              isTouchDevice || isNear ? 'translateY(0)' : 'translateY(50%)',
            opacity: isTouchDevice || isNear ? 1 : 0.5,
          }}
          elevation={3}
        >
          <BottomNavigation value={value} onChange={handleChange}>
            <Tooltip title='Wheel' arrow placement='top'>
              <BottomNavigationAction
                icon={<AlbumIcon />}
                aria-label='Wheel'
                sx={{
                  transition:
                    'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:active': {
                    transform: 'translateY(6px)',
                    transition: 'transform 0.1s',
                  },
                }}
              />
            </Tooltip>
            <Tooltip title='List' arrow placement='top'>
              <BottomNavigationAction
                icon={<ListIcon />}
                aria-label='List'
                sx={{
                  transition:
                    'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:active': {
                    transform: 'translateY(6px)',
                    transition: 'transform 0.1s',
                  },
                }}
              />
            </Tooltip>
            <Tooltip title='Table' arrow placement='top'>
              <BottomNavigationAction
                icon={<TableChartIcon />}
                aria-label='Table'
                sx={{
                  transition:
                    'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:active': {
                    transform: 'translateY(6px)',
                    transition: 'transform 0.1s',
                  },
                }}
              />
            </Tooltip>
          </BottomNavigation>
        </Paper>
      </div>
    </>
  )
}

export default ViewNavigation

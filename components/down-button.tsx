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
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'
import Tooltip from '@mui/material/Tooltip'
import { TransitionProps } from '@mui/material/transitions'
import { showWheel, hideWheel } from './wheel'

interface DownButtonProps {
  movieCount: number
}

interface SnackbarItem {
  id: number
  open: boolean
}

function SlideUpTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction='up' />
}

function SlideRightTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction='right' />
}

const DownButton = ({ movieCount }: DownButtonProps) => {
  const [value, setValue] = useState(1) // 0: wheel, 1: grid, 2: table
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([])
  const [nextId, setNextId] = useState(0)
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    // Load saved view preference
    const savedView = localStorage.getItem('movieView')
    if (savedView === 'table') {
      setValue(2)
      window.dispatchEvent(new CustomEvent('viewChange', { detail: 'table' }))
    }

    // Listen for view mode changes from UI component to keep button in sync
    const handleViewModeSync = (event: CustomEvent) => {
      setValue(event.detail === 'table' ? 2 : 1)
    }

    window.addEventListener('viewModeSync', handleViewModeSync as EventListener)

    // Dispatch initial wheel visibility state
    window.dispatchEvent(
      new CustomEvent('wheelVisibilityChange', {
        detail:
          savedView === 'table'
            ? 'table'
            : savedView === 'grid'
            ? 'grid'
            : 'wheel',
      })
    )

    return () => {
      window.removeEventListener(
        'viewModeSync',
        handleViewModeSync as EventListener
      )
    }
  }, [])

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Check if user is trying to access wheel with less than 2 movies
    if (newValue === 0 && movieCount < 2) {
      const newSnackbar: SnackbarItem = {
        id: nextId,
        open: true,
      }
      setSnackbars((prev) => [...prev, newSnackbar])
      setNextId((prev) => prev + 1)

      // Auto-close after 4 seconds
      setTimeout(() => {
        setSnackbars((prev) =>
          prev.map((snack) =>
            snack.id === newSnackbar.id ? { ...snack, open: false } : snack
          )
        )
        // Remove from array after exit animation completes
        setTimeout(() => {
          setSnackbars((prev) =>
            prev.filter((snack) => snack.id !== newSnackbar.id)
          )
        }, 500)
      }, 4000)
      return
    }

    // Toggle wheel if clicking the wheel button when it's already selected
    if (newValue === 0 && value === 0) {
      // Toggle to list view
      setValue(1)
      hideWheel()
      const viewMode = 'grid'
      localStorage.setItem('movieView', viewMode)
      window.dispatchEvent(new CustomEvent('viewChange', { detail: viewMode }))
      window.dispatchEvent(
        new CustomEvent('wheelVisibilityChange', { detail: viewMode })
      )
      return
    }

    // Update view mode based on button selection
    if (newValue === 1 || newValue === 2) {
      const viewMode = newValue === 2 ? 'table' : 'grid'
      localStorage.setItem('movieView', viewMode)
      window.dispatchEvent(new CustomEvent('viewChange', { detail: viewMode }))
      window.dispatchEvent(
        new CustomEvent('wheelVisibilityChange', { detail: viewMode })
      )
    }

    setValue(newValue)

    if (newValue === 0) {
      showWheel()
      window.dispatchEvent(
        new CustomEvent('wheelVisibilityChange', { detail: 'wheel' })
      )
    } else hideWheel()
  }

  return (
    <>
      <div
        className='fixed bottom-0 left-1/2 z-30 -translate-x-1/2 p-20 pb-0'
        onMouseEnter={() => setIsNear(true)}
        onMouseLeave={() => setIsNear(false)}
      >
        <Paper
          sx={{
            width: 'auto',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: isNear ? 'translateY(0)' : 'translateY(50%)',
            opacity: isNear ? 1 : 0.5,
          }}
          elevation={3}
        >
          <BottomNavigation value={value} onChange={handleChange}>
            <Tooltip title='Wheel' arrow placement='top'>
              <BottomNavigationAction
                icon={<AlbumIcon />}
                aria-label='Wheel'
                sx={{
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          TransitionComponent={
            snackbar.open ? SlideUpTransition : SlideRightTransition
          }
          sx={{
            bottom: `${16 + index * 70}px !important`,
            transition: 'bottom 0.3s ease-in-out',
          }}
        >
          <Alert
            severity='warning'
            sx={{
              width: '100%',
              boxShadow: 3,
            }}
          >
            Add at least 2 movies to use the wheel
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}

export default DownButton

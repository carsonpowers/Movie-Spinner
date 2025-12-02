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

const showWheel = () => {
  const wheelContainer = document.querySelector('#wheel')
  const movieListContainer = document.querySelector('#movie-list-container')

  movieListContainer?.classList.add('opacity-0')
  movieListContainer?.classList.remove('opacity-100')

  wheelContainer?.animate([{ transform: `translate(-50%, -25%)` }], {
    duration: 1000,
    fill: 'forwards',
    easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  })
}

const hideWheel = () => {
  const wheelContainer = document.querySelector('#wheel')
  const movieListContainer = document.querySelector('#movie-list-container')

  movieListContainer?.classList.add('opacity-100')
  movieListContainer?.classList.remove('opacity-0')

  wheelContainer?.animate([{ transform: `translate(-50%, 25%)` }], {
    duration: 1000,
    fill: 'forwards',
    easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  })
}

const DownButton = ({ movieCount }: DownButtonProps) => {
  const [value, setValue] = useState(1) // 0: wheel, 1: grid, 2: table
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([])
  const [nextId, setNextId] = useState(0)

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

    // Update view mode based on button selection
    if (newValue === 1 || newValue === 2) {
      const viewMode = newValue === 2 ? 'table' : 'grid'
      localStorage.setItem('movieView', viewMode)
      window.dispatchEvent(new CustomEvent('viewChange', { detail: viewMode }))
    }

    setValue(newValue)

    if (newValue === 0) showWheel()
    else hideWheel()
  }

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'auto',
          zIndex: 30,
        }}
        elevation={3}
      >
        <BottomNavigation value={value} onChange={handleChange}>
          <Tooltip title='Wheel' arrow placement='top'>
            <BottomNavigationAction icon={<AlbumIcon />} aria-label='Wheel' />
          </Tooltip>
          <Tooltip title='List' arrow placement='top'>
            <BottomNavigationAction icon={<ListIcon />} aria-label='List' />
          </Tooltip>
          <Tooltip title='Table' arrow placement='top'>
            <BottomNavigationAction
              icon={<TableChartIcon />}
              aria-label='Table'
            />
          </Tooltip>
        </BottomNavigation>
      </Paper>
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

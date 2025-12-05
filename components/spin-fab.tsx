'use client'

import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import LoopIcon from '@mui/icons-material/Loop'

export default function SpinFab() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [isWheelVisible, setIsWheelVisible] = useState(false)

  useEffect(() => {
    const handleWheelVisibility = (event: CustomEvent) => {
      setIsWheelVisible(event.detail === 'wheel')
    }

    window.addEventListener(
      'wheelVisibilityChange',
      handleWheelVisibility as EventListener
    )

    return () => {
      window.removeEventListener(
        'wheelVisibilityChange',
        handleWheelVisibility as EventListener
      )
    }
  }, [])

  const handleSpin = () => {
    if (isSpinning) return

    const wheelInstance = (document as any).wheelInstance
    if (!wheelInstance) return

    setIsSpinning(true)

    // Spin the wheel programmatically with random speed
    const randomSpeed = Math.floor(Math.random() * 301) + 200 // Random between 200-500
    wheelInstance.spin(-randomSpeed)

    // Reset spinning state after a delay
    setIsSpinning(false)
  }

  if (!isWheelVisible) return null

  return (
    <Tooltip title='Spin Wheel' arrow placement='left'>
      <Fab
        color='primary'
        aria-label='spin wheel'
        onClick={handleSpin}
        disabled={isSpinning}
        sx={{
          position: 'fixed',
          top: '5.5rem',
          right: '1rem',
          zIndex: 1000,
          bgcolor: 'rgb(59 130 246 / 0.75)',
          '&:hover': {
            bgcolor: 'rgb(59 130 246 / 0.95)',
            '& svg': {
              transform: 'scale(1.1) rotate(-360deg)',
              transition: 'transform 0.6s ease-in-out',
            },
          },
          '&:disabled': {
            bgcolor: 'rgb(107 114 128 / 0.5)',
          },
          '& svg': {
            transition: 'none',
          },
        }}
      >
        <LoopIcon sx={{ color: 'white' }} />
      </Fab>
    </Tooltip>
  )
}

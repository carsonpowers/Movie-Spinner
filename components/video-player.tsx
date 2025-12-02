/**
 * Video Player Component - Client Component
 * Displays full-screen video player with close button
 */

'use client'
import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import CloseIcon from '@mui/icons-material/Close'

export default function VideoPlayer() {
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false)

  useEffect(() => {
    // Observe video player visibility
    const videoPlayer = document.getElementById('trailer-player')
    if (videoPlayer) {
      const observer = new MutationObserver(() => {
        setVideoPlayerVisible(videoPlayer.style.display === 'block')
      })
      observer.observe(videoPlayer, {
        attributes: true,
        attributeFilter: ['style'],
      })

      // Cleanup
      return () => observer.disconnect()
    }
  }, [])

  const handleClose = () => {
    const videoPlayer = document.getElementById(
      'trailer-player'
    ) as HTMLVideoElement
    if (videoPlayer) {
      videoPlayer.style.display = 'none'
      videoPlayer.pause()
      setVideoPlayerVisible(false)
    }
  }

  return (
    <>
      {videoPlayerVisible && (
        <Fab
          size='medium'
          onClick={handleClose}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 2001,
            bgcolor: 'rgb(220 38 38 / 0.85)',
            '&:hover': {
              bgcolor: 'rgb(220 38 38)',
              '& svg': {
                transform: 'scale(1.1)',
                transition: 'transform 0.1s ease-in-out',
              },
            },
            boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
            '& svg': {
              transition: 'transform 0.1s ease-in-out',
            },
          }}
          aria-label='Close video'
        >
          <CloseIcon sx={{ color: 'white' }} />
        </Fab>
      )}
      <video
        id='trailer-player'
        controls
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'contain',
          backgroundColor: '#000',
          zIndex: 2000,
        }}
      />
    </>
  )
}

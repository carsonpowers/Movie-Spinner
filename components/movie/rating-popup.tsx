/**
 * Rating Popup Component
 * Displays the IMDB rating until user clicks outside or plays trailer
 * Uses a MovieListItem-style card with rating-based background color
 */

'use client'

import React, { useEffect, useState, useRef } from 'react'
import Tilt from 'react-parallax-tilt'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Fab from '@mui/material/Fab'

interface RatingPopupData {
  rating: string
  title: string
  poster?: string
  year?: string
}

export default function RatingPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [ratingData, setRatingData] = useState<RatingPopupData | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const handleDismiss = () => {
    setIsVisible(false)
    const hideEvent = new CustomEvent('hideRatingPopup')
    window.dispatchEvent(hideEvent)
  }

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    const playEvent = new CustomEvent('playTrailerFromPopup')
    window.dispatchEvent(playEvent)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only dismiss if clicking outside the popup card
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      handleDismiss()
    }
  }

  useEffect(() => {
    const handleShow = (event: CustomEvent<RatingPopupData>) => {
      setRatingData(event.detail)
      setIsVisible(true)
    }

    const handleHide = () => {
      setIsVisible(false)
    }

    window.addEventListener('showRatingPopup', handleShow as EventListener)
    window.addEventListener('hideRatingPopup', handleHide as EventListener)

    return () => {
      window.removeEventListener('showRatingPopup', handleShow as EventListener)
      window.removeEventListener('hideRatingPopup', handleHide as EventListener)
    }
  }, [])

  if (!isVisible || !ratingData) return null

  // Parse rating to determine color (green for good, yellow for average, red for bad)
  const ratingNum = parseFloat(ratingData.rating)
  const getRatingBgColor = () => {
    if (ratingNum >= 7) return 'rgba(22, 163, 74, 0.95)' // green-600
    if (ratingNum >= 5) return 'rgba(202, 138, 4, 0.95)' // yellow-600
    return 'rgba(220, 38, 38, 0.95)' // red-600
  }

  const getRatingBorderColor = () => {
    if (ratingNum >= 7) return 'rgb(34, 197, 94)' // green-500
    if (ratingNum >= 5) return 'rgb(234, 179, 8)' // yellow-500
    return 'rgb(239, 68, 68)' // red-500
  }

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 cursor-pointer'
      onClick={handleBackdropClick}
    >
      <div
        ref={popupRef}
        className='cursor-default'
        style={{
          animation: 'bounceIn 0.5s ease-out',
        }}
      >
        <Tilt
          tiltReverse={true}
          scale={1.05}
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          glareEnable={true}
          glareMaxOpacity={0.3}
          glarePosition='all'
          transitionSpeed={800}
          transitionEasing='cubic-bezier(.03,.98,.52,.99)'
          className='rounded-2xl overflow-hidden'
        >
          <div
            className='relative overflow-hidden rounded-2xl shadow-2xl'
            style={{
              width: 'min(80vw, 54vh)',
              height: 'min(80vh, 118.5vw)',
              backgroundImage: ratingData.poster
                ? `url(${ratingData.poster})`
                : undefined,
              backgroundPositionX: 'center',
              backgroundPositionY: 'top',
              backgroundSize: 'cover',
              backgroundColor: ratingData.poster ? undefined : '#1f2937',
              border: `4px solid ${getRatingBorderColor()}`,
              boxShadow: `0 0 30px ${getRatingBorderColor()}, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
            }}
          >
            {/* Rating Badge */}
            <div
              className='absolute top-6 right-6 z-10 flex flex-col items-center justify-center rounded-full shadow-lg'
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: getRatingBgColor(),
                border: `4px solid ${getRatingBorderColor()}`,
                animation: 'pulse 1s ease-in-out infinite',
              }}
            >
              <span className='text-white text-5xl font-bold leading-none'>
                {ratingData.rating}
              </span>
              <span className='text-white/80 text-base font-medium'>IMDB</span>
            </div>

            {/* Star Rating */}
            <div className='absolute top-6 left-6 z-10 flex gap-1'>
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className={`text-3xl drop-shadow-md ${
                    i < Math.round(ratingNum)
                      ? 'text-yellow-400'
                      : 'text-white/30'
                  }`}
                  style={{
                    animation:
                      i < Math.round(ratingNum)
                        ? `starPop 0.3s ease-out ${i * 0.05}s both`
                        : undefined,
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Bottom gradient overlay with title and play button */}
            <div
              className='absolute bottom-0 left-0 right-0 p-8 pt-24'
              style={{
                background: `linear-gradient(to top, ${getRatingBgColor()}, transparent)`,
              }}
            >
              {/* Play Trailer Button */}
              <div className='flex justify-center mb-6'>
                <Fab
                  size='large'
                  onClick={handlePlayTrailer}
                  title='Play Trailer'
                  aria-label='Play Trailer'
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  <PlayArrowIcon sx={{ color: 'white', fontSize: 48 }} />
                </Fab>
              </div>
              <div className='text-white text-3xl font-bebas font-normal text-center leading-tight drop-shadow-lg line-clamp-2'>
                {ratingData.title}
                {ratingData.year && (
                  <span className='text-white/80'> ({ratingData.year})</span>
                )}
              </div>
            </div>
          </div>
        </Tilt>
      </div>
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes starPop {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

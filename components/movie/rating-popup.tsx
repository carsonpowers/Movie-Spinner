/**
 * Rating Popup Component
 * Displays the IMDB rating for 3 seconds after the wheel stops
 */

'use client'

import React, { useEffect, useState } from 'react'

interface RatingPopupProps {
  rating: string
  title: string
}

export default function RatingPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [ratingData, setRatingData] = useState<RatingPopupProps | null>(null)

  useEffect(() => {
    const handleShow = (event: CustomEvent<RatingPopupProps>) => {
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
  const getRatingColor = () => {
    if (ratingNum >= 7) return 'from-green-500 to-emerald-600'
    if (ratingNum >= 5) return 'from-yellow-500 to-amber-600'
    return 'from-red-500 to-rose-600'
  }

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none'>
      <div
        className={`
          animate-bounce-in
          bg-gradient-to-br ${getRatingColor()}
          rounded-3xl
          shadow-2xl
          p-8
          text-center
          transform
          pointer-events-auto
        `}
        style={{
          animation:
            'bounceIn 0.5s ease-out, pulse 1s ease-in-out 0.5s infinite',
        }}
      >
        <div className='text-white/80 text-lg font-medium mb-2 uppercase tracking-wider'>
          IMDB Rating
        </div>
        <div className='text-white text-8xl font-bold mb-4 drop-shadow-lg'>
          {ratingData.rating}
        </div>
        <div className='text-white/90 text-xl font-medium max-w-xs truncate'>
          {ratingData.title}
        </div>
        <div className='mt-4 flex justify-center gap-1'>
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className={`text-2xl ${
                i < Math.round(ratingNum) ? 'text-yellow-300' : 'text-white/30'
              }`}
            >
              ★
            </span>
          ))}
        </div>
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
            transform: scale(0.9);
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
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}

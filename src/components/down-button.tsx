'use client'
import React, { useState } from 'react'

const DownButton = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  return (
    <button
      className='absolute bottom-2.5 left-1/2 right-1/2 w-24 h-12 transform -translate-x-1/2 z-10 border-2 border-white rounded-lg bg-black'
      onClick={({ target }) => {
        const wheelContainer = document.querySelector('#wheel')
        const wheel = document.querySelector('canvas')
        const movieListContainer = document.querySelector(
          '#movie-list-container'
        )

        if (movieListContainer?.classList.contains('opacity-0')) {
          movieListContainer?.classList.add('opacity-100')
          movieListContainer?.classList.remove('opacity-0')
        } else {
          movieListContainer?.classList.add('opacity-0')
          movieListContainer?.classList.remove('opacity-100')
        }

        if (wheel) {
          if (isAnimating) {
            wheelContainer.animate([{ transform: `translate(-50%, -25%)` }], {
              duration: 1000, // Duration in milliseconds
              fill: 'forwards', // Maintain the end state after animation
              easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
            })
            wheelContainer?.removeAttribute('style')
            target.innerHTML = '▼'
          } else {
            wheelContainer.animate([{ transform: `translate(-50%, 25%)` }], {
              duration: 1000,
              fill: 'forwards',
              easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
            })
            target.innerHTML = '▲'
            wheelContainer.style.pointerEvents = 'none'
          }
          setIsAnimating(!isAnimating)
        }
      }}
    >
      ▼
    </button>
  )
}

export default DownButton

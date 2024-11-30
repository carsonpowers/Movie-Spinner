'use client'
import { useState } from 'react'

export default function DownButton() {
  const [isAnimating, setIsAnimating] = useState(false)
  return (
    <button
      id='down-button'
      onClick={({ target }) => {
        const wheelContainer = document.querySelector('#wheel')
        const wheel = document.querySelector('canvas')
        const movieList = document.querySelector('#movie-list')
        const movieListContainer = document.querySelector(
          '#movie-list-container'
        )

        if (movieListContainer?.classList.contains('opacity-0')) {
          movieListContainer?.classList.add('opacity-100', 'translate-y-0')
          movieListContainer?.classList.remove('opacity-0', 'translate-y-1/4')
        } else {
          movieListContainer?.classList.add('opacity-0', 'translate-y-1/4')
          movieListContainer?.classList.remove('opacity-100', 'translate-y-0')
        }

        if (wheel) {
          if (isAnimating) {
            wheelContainer.animate([{ transform: `translate(-50%, -25%)` }], {
              duration: 1000, // Duration in milliseconds
              fill: 'forwards', // Maintain the end state after animation
              easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
            })
            wheelContainer?.removeAttribute('style')
            target.innerHTML = '📽️'
          } else {
            wheelContainer.animate([{ transform: `translate(-50%, 25%)` }], {
              duration: 1000,
              fill: 'forwards',
              easing: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
            })
            target.innerHTML = '🗒️'
            wheelContainer.style.pointerEvents = 'none'
          }
          setIsAnimating(!isAnimating)
        }
      }}
    >
      📽️
    </button>
  )
}

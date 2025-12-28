/**
 * Wheel Component - Client Component
 * Handles the spinning wheel animation
 */

'use client'

import { Wheel as WheelLib, type WheelItem as SpinWheelItem } from 'spin-wheel'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { easeOutElastic } from 'easing-utils'

interface Movie {
  id?: string
  title: string
  poster?: string
  year?: string
  watched?: boolean
}

interface WheelEvent {
  currentIndex: number
  rotation: number
}

// Extended WheelItem type with runtime methods
interface ExtendedWheelItem extends SpinWheelItem {
  getCenterAngle(): number
}

// Extended Wheel type with runtime properties
interface ExtendedWheel extends WheelLib {
  rotation: number
  items: ExtendedWheelItem[]
}

// Extended Document type for custom properties
interface ExtendedDocument extends Document {
  wheelInstance?: ExtendedWheel
  clicks?: HTMLAudioElement[]
}

const itemConfig = {
  imageRadius: 0.525,
  imageScale: 0.525,
  imageRotation: 0,
  backgroundColor: 'transparent',
}

let lockWheel: boolean | undefined
let moviesRef: Movie[] = []

/**
 * Calculates which wheel item the wheel will land on after spinning.
 * Uses constant angular deceleration model and spin-wheel's index formula.
 *
 * @param initialAngle - Starting angle in degrees (θ₀)
 * @param initialAngularVelocity - Starting angular velocity in deg/s (ω₀)
 * @param angularDeceleration - Angular deceleration in deg/s² (α, positive value)
 * @param itemCount - Number of items on the wheel (N)
 * @returns Integer index from 0 to itemCount - 1 representing which wheel item will be landed on
 */
const calculateWheelLandingItem = (
  initialAngle: number,
  initialAngularVelocity: number,
  angularDeceleration: number,
  itemCount: number
): number => {
  // Calculate total angular distance traveled before stopping
  // θ_total = ω₀² / (2α) - kinematic equation for constant deceleration
  const velocity = Math.abs(initialAngularVelocity)
  const totalAngularDistance = (velocity * velocity) / (2 * angularDeceleration)

  // Apply direction of rotation
  const direction = initialAngularVelocity < 0 ? -1 : 1
  const signedDistance = totalAngularDistance * direction

  // Calculate final resting angle
  const finalRotation = initialAngle + signedDistance

  // spin-wheel's formula for determining current index:
  // currentIndex = floor(((pointerAngle - rotation) mod 360) / itemAngleSize)
  // Default pointerAngle is 0 (pointing right/east/3 o'clock)
  const pointerAngle = 0
  const itemAngleSize = 360 / itemCount

  // Normalize the angle to [0, 360)
  let normalizedAngle = (pointerAngle - finalRotation) % 360
  if (normalizedAngle < 0) normalizedAngle += 360

  const itemIndex = Math.floor(normalizedAngle / itemAngleSize)

  return itemIndex
}

export const showWheel = () => {
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

export const hideWheel = () => {
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

const getWheelItems = async (movies: Movie[]) => {
  const wheelItems = movies?.map?.(toWheelItems) || []
  await renderPosterImages(wheelItems)
  return wheelItems
}

const renderPosterImages = (movies: SpinWheelItem[]) =>
  Promise.allSettled(
    movies
      .filter(({ image }) => image instanceof HTMLImageElement)
      .map(({ image }) => toDecodeImage({ image: image as HTMLImageElement }))
  )

const loadWheel = async (
  { current }: { current: HTMLElement | null },
  movies: Movie[]
): Promise<WheelLib | null> => {
  if (!current || !movies || movies.length === 0) return null

  // Load friction from localStorage or use default
  const savedFriction = localStorage.getItem('wheelFriction')
  const friction = savedFriction ? parseFloat(savedFriction) : -40

  return new WheelLib(current, {
    borderWidth: 0,
    backgroundColors: ['transparent'],
    itemLabelColors: ['transparent'],
    rotationSpeedMax: 100000,
    rotationResistance: friction,
    items: await getWheelItems(movies),
  })
}

const toWheelItems = ({ title: label, poster }: Movie) => ({
  label,
  image: poster && poster !== 'N/A' ? createImageElement(poster) : undefined,
  ...itemConfig,
})

const toDecodeImage = async ({
  image,
}: {
  image: HTMLImageElement
}): Promise<void> => {
  try {
    await image.decode()
  } catch (error) {
    console.warn('Failed to decode image:', image.src, error)
  }
}

function createImageElement(src: string): HTMLImageElement | undefined {
  if (!src || src === 'N/A') return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src
  return img
}

const initWheel = async (
  wheelContainer: React.MutableRefObject<HTMLDivElement | null>,
  movies: Movie[]
) => {
  moviesRef = movies
  const wheel = await loadWheel(wheelContainer, movies)
  if (!wheel) return

  const extendedWheel = wheel as ExtendedWheel
  extendedWheel.rotation = 90
  ;(document as ExtendedDocument).wheelInstance = extendedWheel
  wheel.onRest = onRest
  wheel.onCurrentIndexChange = makeARandomClickNoise

  // Predict landing item when wheel starts spinning
  wheel.onSpin = (event: any) => {
    const predictedIndex = calculateWheelLandingItem(
      extendedWheel.rotation,
      event.rotationSpeed,
      Math.abs(wheel.rotationResistance),
      movies.length
    )

    console.log('🎯 Predicted movie:', movies[predictedIndex]?.title)
  }

  // Listen for friction changes
  const handleFrictionChange = (event: CustomEvent) => {
    wheel.rotationResistance = event.detail
  }
  window.addEventListener(
    'wheelFrictionChange',
    handleFrictionChange as EventListener
  )
}

const onRest = ({ currentIndex }: WheelEvent) => {
  console.log('🎬 Landed on:', moviesRef[currentIndex]?.title)

  if (lockWheel) releaseWheelLock(currentIndex)
  else {
    rotateToCenterAndLockWheel(currentIndex)
    playResultSound()
    scrapeAndPlayTrailer(currentIndex)
  }
}

const makeARandomClickNoise = () => {
  const clicks = (document as ExtendedDocument).clicks
  if (clicks) {
    clicks[Math.round(Math.random() * 4)].play()
  }
}

const playResultSound = () => {
  const audio = document.querySelector('#result audio') as HTMLAudioElement
  if (audio) {
    audio.play()
  }
}

export const scrapeAndPlayTrailer = async (currentIndex: number) => {
  const movie = moviesRef[currentIndex]
  if (!movie?.id) return

  try {
    const response = await fetch(`/api/scrape-trailer?imdbId=${movie.id}`)
    const data = await response.json()

    if (data.error) {
      // Show error snackbar when no video is found
      const event = new CustomEvent('showSnackbar', {
        detail: {
          message:
            data.error === 'No video found'
              ? 'No trailer found for this movie'
              : 'Failed to load trailer',
          severity: 'warning',
        },
      })
      window.dispatchEvent(event)
      return
    }

    if (data.videoUrl) {
      const videoPlayer = document.getElementById(
        'trailer-player'
      ) as HTMLVideoElement

      if (videoPlayer) {
        // Set video source and display it
        videoPlayer.src = data.videoUrl
        videoPlayer.style.display = 'block'
        videoPlayer.play().catch((err) => {
          console.error('Error playing video:', err)
          const event = new CustomEvent('showSnackbar', {
            detail: {
              message: 'Failed to play video',
              severity: 'error',
            },
          })
          window.dispatchEvent(event)
        })

        videoPlayer.onended = () => {
          videoPlayer.style.display = 'none'
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch trailer:', error)
    const event = new CustomEvent('showSnackbar', {
      detail: {
        message: 'Failed to fetch trailer',
        severity: 'error',
      },
    })
    window.dispatchEvent(event)
  }
}

const releaseWheelLock = (currentIndex: number) => {
  lockWheel = false
  const wheel = (document as ExtendedDocument).wheelInstance
  if (wheel) {
    wheel.isInteractive = true
  }
}

const rotateToCenterAndLockWheel = (currentIndex: number) => {
  lockWheel = true
  const wheel = (document as ExtendedDocument).wheelInstance
  if (wheel) {
    wheel.isInteractive = false
    centerWheelItem({ currentIndex, type: 'elastic' })
  }
}

const centerWheelItem = ({
  currentIndex,
  type,
}: {
  currentIndex: number
  type?: string
}) => {
  const wheel = (document as ExtendedDocument).wheelInstance
  if (!wheel) return

  let spinProps: [
    number,
    number,
    boolean,
    number,
    number,
    ((n: number) => number)?
  ]
  switch (type) {
    case 'elastic':
      spinProps = [
        currentIndex,
        2000,
        true,
        0,
        getDirection(currentIndex),
        easeOutElastic,
      ]
      break
    default:
      spinProps = [currentIndex, 0, true, 0, getDirection(currentIndex)]
  }
  wheel.spinToItem(...spinProps)
}

const getDirection = (currentIndex: number) => {
  const wheel = (document as ExtendedDocument).wheelInstance
  if (!wheel) return 1

  const { items, rotation } = wheel
  const wheelAbsoluteRotation = Math.abs(rotation) % 360
  const wheelRelativeRotation =
    rotation < 0 ? wheelAbsoluteRotation : 360 - wheelAbsoluteRotation
  const itemCenterAngle = items[currentIndex].getCenterAngle()
  return itemCenterAngle > wheelRelativeRotation ? -1 : 1
}

const destroyWheel = () => {
  const wheel = (document as ExtendedDocument).wheelInstance
  if (wheel) {
    wheel.remove()
  }
}

export default function Wheel({ movies }: { movies: Movie[] }) {
  const wheelContainer = useRef<HTMLDivElement | null>(null)
  const [filterText, setFilterText] = useState('')
  const [watchedFilter, setWatchedFilter] = useState<
    'all' | 'hideWatched' | 'onlyWatched'
  >('all')

  // Filter movies based on filter text and watched status
  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        // Filter by watched status
        if (watchedFilter === 'hideWatched' && movie.watched) return false
        if (watchedFilter === 'onlyWatched' && !movie.watched) return false

        // Filter by search text
        if (!filterText) return true
        const searchText = filterText.toLowerCase()
        const titleMatch = movie.title.toLowerCase().includes(searchText)
        const yearMatch = movie.year?.includes(searchText)
        return titleMatch || yearMatch
      }),
    [movies, watchedFilter, filterText]
  )

  useEffect(() => {
    const handleFilterMovies = (event: CustomEvent) => {
      setFilterText(event.detail)
    }

    const handleWatchedFilterChange = (event: CustomEvent) => {
      setWatchedFilter(event.detail)
    }

    window.addEventListener('filterMovies', handleFilterMovies as EventListener)
    window.addEventListener(
      'watchedFilterChange',
      handleWatchedFilterChange as EventListener
    )

    return () => {
      window.removeEventListener(
        'filterMovies',
        handleFilterMovies as EventListener
      )
      window.removeEventListener(
        'watchedFilterChange',
        handleWatchedFilterChange as EventListener
      )
    }
  }, [])

  useEffect(() => {
    if (filteredMovies.length > 0) {
      initWheel(wheelContainer, filteredMovies)
      ;(document as ExtendedDocument).clicks = [
        ...document.querySelectorAll('#clicks > audio'),
      ] as HTMLAudioElement[]
    }
    return destroyWheel
  }, [filteredMovies])

  return (
    <>
      <div id='clicks'>
        <audio src='/1.mp3' preload='auto'></audio>
        <audio src='/2.mp3' preload='auto'></audio>
        <audio src='/3.mp3' preload='auto'></audio>
        <audio src='/4.mp3' preload='auto'></audio>
        <audio src='/5.mp3' preload='auto'></audio>
      </div>
      <div id='loser'>
        <audio src='/loser1.mp3' preload='auto'></audio>
      </div>
      <div id='winner'>
        <audio src='/winner1.mp3' preload='auto'></audio>
      </div>
      <div id='result'>
        <audio src='/fart-1.mp3' preload='auto'></audio>
      </div>
      <div id='wheel' ref={wheelContainer}></div>
    </>
  )
}

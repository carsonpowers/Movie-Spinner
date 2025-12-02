/**
 * Wheel Component - Client Component
 * Handles the spinning wheel animation
 */

'use client'

import { Wheel as WheelLib, type WheelItem as SpinWheelItem } from 'spin-wheel'
import React, { useEffect, useRef } from 'react'
import { easeOutElastic } from 'easing-utils'

interface Movie {
  id?: string
  title: string
  poster?: string
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

  return new WheelLib(current, {
    borderWidth: 0,
    backgroundColors: ['transparent'],
    itemLabelColors: ['transparent'],
    rotationSpeedMax: 100000,
    rotationResistance: -40,
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
}

const onRest = ({ currentIndex }: WheelEvent) => {
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

const scrapeAndPlayTrailer = async (currentIndex: number) => {
  const movie = moviesRef[currentIndex]
  if (!movie?.id) return

  try {
    const response = await fetch(`/api/scrape-trailer?imdbId=${movie.id}`)
    const data = await response.json()

    if (data.videoUrl) {
      // Open video in a new window since CORS is blocking direct playback
      window.open(data.videoUrl, '_blank', 'width=800,height=600')
    }
  } catch (error) {
    console.error('Failed to fetch trailer:', error)
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

  useEffect(() => {
    if (movies.length > 0) {
      initWheel(wheelContainer, movies)
      ;(document as ExtendedDocument).clicks = [
        ...document.querySelectorAll('#clicks > audio'),
      ] as HTMLAudioElement[]
    }
    return destroyWheel
  }, [movies])

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
      <video
        id='trailer-player'
        controls
        crossOrigin='anonymous'
        style={{
          display: 'none',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '80vw',
          maxHeight: '80vh',
          zIndex: 1000,
        }}
      />
      <div id='wheel' ref={wheelContainer}></div>
    </>
  )
}

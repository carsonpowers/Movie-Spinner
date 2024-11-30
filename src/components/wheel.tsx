'use client'

// import Image from 'next/image'
import { Wheel as wheel } from 'spin-wheel'
import React, { useEffect, useRef, useState } from 'react'
import { pipe } from 'lodash/fp'
import { easeOutElastic } from 'easing-utils'
import DownButton from './down-button'

interface WheelItem {
  currentIndex: number
  rotation: number
}

const itemConfig = {
  imageRadius: 0.525,
  imageScale: 0.525,
  imageRotation: 0,
  backgroundColor: 'transparent',
}

let wheelInstance: any
let lockWheel: boolean | undefined

const getWheelItems = async (movies: Movie[]) => {
  const wheelItems = movies?.map?.(toWheelItems)
  // render images before they are passed to the canvas (in the wheel constructor)
  await renderPosterImages(wheelItems)
  return wheelItems
}

const renderPosterImages = (movies) =>
  Promise.all(
    movies
      .filter(({ image }) => image !== undefined)
      .map(({ image }) =>
        toDecodeImage({ image } as { image: HTMLImageElement })
      )
  )

const loadWheel = async (
  { current }: { current: HTMLElement | null },
  movies: Movie[]
) =>
  new wheel(current, {
    borderWidth: 0,
    backgroundColors: ['transparent'],
    itemLabelColors: ['transparent'],
    rotationSpeedMax: 100000,
    rotationResistance: -20,
    items: await getWheelItems(movies),
  })

const toWheelItems = ({ Title: label, Year, id, Poster }) => ({
  label,
  image: Poster ? createImageElement(Poster) : undefined,
  ...itemConfig,
})

const toDecodeImage = async ({
  image,
}: {
  image: HTMLImageElement
}): Promise<void> => await image.decode()

function createImageElement(src: string): HTMLImageElement | undefined {
  if (!src) return
  const img = new Image()
  img.src = src
  return img
}

const initWheel = async (
  wheelContainer: React.MutableRefObject<null>,
  movies: Movie[]
) => {
  document.wheelInstance = await loadWheel(wheelContainer, movies)
  document.wheelInstance.onRest = onRest
  document.wheelInstance.onCurrentIndexChange = makeARandomClickNoise
}

const onRest = ({ currentIndex }: WheelItem) => {
  if (lockWheel) releaseWheelLock(currentIndex)
  else rotateToCenterAndLockWheel(currentIndex)
}

const makeARandomClickNoise = () => {
  document.clicks[Math.round(Math.random() * 4)].play()
}

const releaseWheelLock = (currentIndex: number) => {
  lockWheel = false
  document.wheelInstance.isInteractive = true
  const { label } = document.wheelInstance.items[currentIndex]
  // window.open(`http://www.imdb.com/title/${label}`, '_blank')
}

const rotateToCenterAndLockWheel = (currentIndex: number) => {
  // document.querySelectorAll('#winner > audio')[0].play()
  lockWheel = true
  document.wheelInstance.isInteractive = false
  centerWheelItem({ currentIndex, type: 'elastic' })
  // setTimeout(() => {
  //   document.wheelInstance.items = [document.wheelInstance.items[currentIndex]]
  //   centerWheelItem({ currentIndex: 0 })
  // }, 1000)
}

const centerWheelItem = ({
  currentIndex,
  type,
}: {
  currentIndex: number
  type?: string
}) => {
  let spinProps
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
  document.wheelInstance.spinToItem(...spinProps)
}

const getDirection = (currentIndex: number) => {
  const { items, rotation } = document.wheelInstance
  const wheelAbsoluteRotation = Math.abs(rotation) % 360
  const wheelRelativeRotation =
    rotation < 0 ? wheelAbsoluteRotation : 360 - wheelAbsoluteRotation
  const itemCenterAngle = items[currentIndex].getCenterAngle()
  return itemCenterAngle > wheelRelativeRotation ? -1 : 1
}

const destroyWheel = () => {
  document.wheelInstance.remove()
}

export default function Wheel({ movies }: { movies: Movie[] }) {
  const wheelContainer = useRef(null)

  useEffect(() => {
    initWheel(wheelContainer, movies)
    document.clicks = [...document.querySelectorAll('#clicks > audio')]
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
      <DownButton />
      <div id='wheel' ref={wheelContainer}></div>
    </>
  )
}

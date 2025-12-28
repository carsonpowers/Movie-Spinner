'use client'
import { useEffect, useState, useCallback, memo } from 'react'
import { useMovieActions } from '@/hooks/useMovieActions'
import Tilt from 'react-parallax-tilt'
import Fab from '@mui/material/Fab'
import VisibilityIcon from '@mui/icons-material/Visibility'
import MovieIcon from '@mui/icons-material/Movie'
import DeleteIcon from '@mui/icons-material/Delete'

export interface Movie {
  id?: string
  title: string
  year?: string
  poster?: string
  // cSpell:ignore imdb cardback
  imdbID?: string
  imdbId?: string
  watched?: boolean
}

let currentFlip: HTMLAudioElement | null = null
let currentFlippedCard: (() => void) | null = null

const ListItem = ({
  children,
  ...props
}: {
  id?: string
  title?: string
  children: React.ReactNode | ((flipHorizontally: boolean) => React.ReactNode)
  className?: string
  poster?: string
  tiltEnable?: boolean
  glareEnable?: boolean
  flipEnable?: boolean
  scale?: number
}) => {
  const [flipHorizontally, toggleFlip] = useState(false)
  const {
    id,
    title,
    className,
    poster,
    tiltEnable = true,
    glareEnable = true,
    flipEnable = true,
    scale = 1.1,
  } = props

  return (
    <li
      id={id}
      className={`flex-none transition-all duration-1000 ease-smooth cursor-pointer h-item hover:z-10 hover:transition-none hover:-translate-y-0.5 focus:-translate-y-0.5 -mt-8 first:mt-0 ${
        className || ''
      }`}
      data-id={id}
      onClick={() => {
        if (!flipEnable) return

        // If another card is flipped, flip it back
        if (currentFlippedCard && !flipHorizontally) currentFlippedCard()

        if (currentFlip) {
          currentFlip.pause()
          currentFlip.currentTime = 0
        }
        const flips = (document as any).flips
        if (flips) {
          currentFlip = flips[Math.round(Math.random() * 5)]
          currentFlip?.play()
        }

        const newFlipState = !flipHorizontally
        toggleFlip(newFlipState)

        // Update the current flipped card reference
        currentFlippedCard = newFlipState ? () => toggleFlip(false) : null
      }}
    >
      <Tilt
        tiltReverse={true}
        scale={scale}
        tiltMaxAngleX={flipHorizontally ? 1 : 15}
        tiltMaxAngleY={flipHorizontally ? 1 : 15}
        glareEnable={glareEnable}
        glareMaxOpacity={flipHorizontally ? 0.05 : 0.3}
        glarePosition='all'
        transitionSpeed={Math.floor(Math.random() * (1200 - 300 + 1)) + 300}
        flipHorizontally={flipHorizontally}
        transitionEasing='cubic-bezier(.03,.98,.52,.99)'
        tiltEnable={tiltEnable}
        className='rounded-2xl overflow-hidden hover:rounded-lg hover:transition-none'
      >
        <div
          className={`w-item h-[calc(var(--item-size)*1.481)] ${
            flipHorizontally
              ? ''
              : 'hover:transition-[width,height] hover:duration-1000 hover:ease-smooth'
          }`}
          data-flip={flipHorizontally}
          title={title}
          style={{
            backgroundImage: `url(${
              flipHorizontally ? '/cardback-01.png' : poster
            })`,
            backgroundPositionX: 'center',
            backgroundPositionY: 'top',
            backgroundSize: 'cover',
          }}
        >
          {typeof children === 'function'
            ? children(flipHorizontally)
            : children}
        </div>
      </Tilt>
    </li>
  )
}

const MovieListItem = memo((movie: Movie) => {
  const { title, year, id, poster, watched } = movie
  const [optimisticWatched, setOptimisticWatched] = useState(watched)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toggleWatched, deleteMovie, isLoading } = useMovieActions()

  useEffect(() => {
    setOptimisticWatched(watched)
  }, [watched])

  const handleToggleWatched = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      if (!id) return

      setOptimisticWatched(!optimisticWatched)
      const success = await toggleWatched(id)

      // Revert on failure
      if (!success) setOptimisticWatched(optimisticWatched)
    },
    [id, optimisticWatched, toggleWatched]
  )

  const handleRemoveMovie = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      if (!id) return

      setIsDeleting(true)
      const success = await deleteMovie(id, title)

      if (!success) setIsDeleting(false)
    },
    [id, title, deleteMovie]
  )

  // Don't render if being deleted
  if (isDeleting) {
    return (
      <li
        id={id}
        className='flex-none transition-opacity duration-300 ease-out h-item opacity-0'
        data-id={id}
        style={{ width: 'var(--item-size)' }}
      />
    )
  }

  return (
    <ListItem key={id} id={id} title={title} poster={poster}>
      {(flipHorizontally) => (
        <>
          {/* Eye indicator for watched movies */}
          {optimisticWatched && !flipHorizontally && (
            <div className='absolute top-2 left-2 z-10'>
              <div className='w-10 h-10 rounded-full bg-green-600/90 shadow-lg flex items-center justify-center text-white'>
                <VisibilityIcon />
              </div>
            </div>
          )}
          <div
            className={`absolute p-6 px-4 whitespace-normal w-full h-full text-center scale-x-[-1] origin-center grid gap-4 ${
              flipHorizontally ? '' : 'hidden'
            }`}
            data-flip={flipHorizontally}
          >
            <div>
              <label
                onClick={(e) => {
                  e.stopPropagation()
                  return false
                }}
                className='bg-black/75 py-[0.4rem] px-1 pt-[0.4rem] pb-1 rounded-lg font-bebas font-normal cursor-text shadow-[2px_2px_4px_rgba(0,0,0,0.5)] line-clamp-2-custom max-h-12'
              >
                {title}
                {year && ` (${year})`}
              </label>
            </div>
            <div className='py-2 px-0 justify-self-auto self-end flex gap-2 justify-center items-center flex-wrap'>
              <a
                href={`https://www.imdb.com/title/${id}`}
                target='_blank'
                rel='noopener noreferrer'
                onClick={(e) => e.stopPropagation()}
                title='View on IMDB'
                aria-label='View on IMDB'
              >
                <Fab
                  size='small'
                  sx={{
                    bgcolor: 'rgb(37 99 235 / 0.75)',
                    '&:hover': {
                      bgcolor: 'rgb(37 99 235 / 0.95)',
                      '& svg': {
                        transform: 'scale(1.1)',
                        transition: 'transform 0.1s ease-in-out',
                      },
                    },
                    boxShadow: '2px 0px 4px rgba(0,0,0,0.5)',
                    '& svg': {
                      transition: 'transform 0.1s ease-in-out',
                    },
                  }}
                >
                  <MovieIcon fontSize='small' sx={{ color: 'white' }} />
                </Fab>
              </a>
              <Fab
                size='small'
                onClick={handleToggleWatched}
                title={
                  optimisticWatched ? 'Mark as Unwatched' : 'Mark as Watched'
                }
                aria-label={
                  optimisticWatched ? 'Mark as Unwatched' : 'Mark as Watched'
                }
                sx={{
                  bgcolor: optimisticWatched
                    ? 'rgb(22 163 74 / 0.75)'
                    : 'rgb(75 85 99 / 0.75)',
                  '&:hover': {
                    bgcolor: optimisticWatched
                      ? 'rgb(22 163 74 / 0.95)'
                      : 'rgb(75 85 99 / 0.95)',
                    '& svg': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.1s ease-in-out',
                    },
                  },
                  boxShadow: '2px 0px 4px rgba(0,0,0,0.5)',
                  '& svg': {
                    transition: 'transform 0.1s ease-in-out',
                  },
                }}
              >
                <VisibilityIcon fontSize='small' sx={{ color: 'white' }} />
              </Fab>
              <Fab
                size='small'
                onClick={handleRemoveMovie}
                title='Remove from list'
                aria-label='Remove from list'
                sx={{
                  bgcolor: 'rgb(220 38 38 / 0.75)',
                  '&:hover': {
                    bgcolor: 'rgb(220 38 38 / 0.95)',
                    '& svg': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.1s ease-in-out',
                    },
                  },
                  boxShadow: '2px 0px 4px rgba(0,0,0,0.5)',
                  '& svg': {
                    transition: 'transform 0.1s ease-in-out',
                  },
                }}
              >
                <DeleteIcon fontSize='small' sx={{ color: 'white' }} />
              </Fab>
            </div>
          </div>
        </>
      )}
    </ListItem>
  )
})

MovieListItem.displayName = 'MovieListItem'

export default MovieListItem

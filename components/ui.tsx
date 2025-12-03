/**
 * UI Component - Client Component
 * Handles movie list display and interactions
 */

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Tilt from 'react-parallax-tilt'
import Fab from '@mui/material/Fab'
import VisibilityIcon from '@mui/icons-material/Visibility'
import MovieIcon from '@mui/icons-material/Movie'
import DeleteIcon from '@mui/icons-material/Delete'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import VideoPlayer from './video-player'

interface Movie {
  id?: string
  title: string
  year?: string
  poster?: string
  // cSpell:ignore imdb cardback
  imdbID?: string
  imdbId?: string
  watched?: boolean
}

interface SnackbarState {
  open: boolean
  message: string
  severity: 'error' | 'warning' | 'info' | 'success'
}

function SlideUpTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction='up' />
}

function SlideRightTransition(
  props: TransitionProps & { children: React.ReactElement }
) {
  return <Slide {...props} direction='right' />
}

let _refresh: () => void
let _showSnackbar: (
  message: string,
  severity: SnackbarState['severity']
) => void

const fetchMovieData = async ({
  title,
  search = false,
}: {
  title: string
  search?: boolean
}) => {
  try {
    const response = await fetch('/api/fetchMovieData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Title: title, search }),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return null
  }
}

const removeMovie = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.stopPropagation()
  const target = event.currentTarget
  const Menu = target.closest('ul')
  const LI = target.closest('li')
  const id = LI?.getAttribute('data-id')

  if (!id) {
    console.error("Couldn't find movie id")
    return
  }

  try {
    const response = await fetch(`/api/deleteMovie?id=${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete movie')
    }

    // Animate removal
    if (Menu && LI) {
      Menu.animate(
        [
          { height: `${Menu.offsetHeight}px` },
          { height: `${Menu.offsetHeight - (LI.offsetHeight + 8)}px` },
        ],
        {
          duration: 500,
          easing: 'ease-out',
          fill: 'forwards',
        }
      )

      const animation = LI.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 500,
        easing: 'ease-out',
        fill: 'forwards',
      })

      animation.onfinish = () => {
        _refresh()
      }
    }
  } catch (error) {
    console.error('Error deleting movie:', error)
  }
}

const toggleWatched = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.stopPropagation()
  const target = event.currentTarget
  const LI = target.closest('li')
  const id = LI?.getAttribute('data-id')

  if (!id) {
    console.error("Couldn't find movie id")
    return
  }

  try {
    const response = await fetch('/api/toggleWatched', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movieId: id }),
    })

    if (!response.ok) {
      throw new Error('Failed to toggle watched status')
    }

    _refresh()
  } catch (error) {
    console.error('Error toggling watched status:', error)
  }
}

let currentFlip: HTMLAudioElement | null = null

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
      className={`flex-none transition-all duration-1000 ease-smooth cursor-pointer h-item hover:z-10 hover:transition-none hover:-translate-y-0.5 focus:-translate-y-0.5 ${
        className || ''
      }`}
      data-id={id}
      onClick={() => {
        if (!flipEnable) return

        if (currentFlip) {
          currentFlip.pause()
          currentFlip.currentTime = 0
        }
        const flips = (document as any).flips
        if (flips) {
          currentFlip = flips[Math.round(Math.random() * 5)]
          currentFlip?.play()
        }
        toggleFlip(!flipHorizontally)
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

const MovieListItem = (movie: Movie) => {
  const { title, year, id, poster, watched } = movie
  const [optimisticWatched, setOptimisticWatched] = useState(watched)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setOptimisticWatched(watched)
  }, [watched])

  const handleToggleWatched = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOptimisticWatched(!optimisticWatched)
    await toggleWatched(event)
  }

  const handleRemoveMovie = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()

    // Optimistically mark as deleting for UI
    setIsDeleting(true)

    // Call the API
    try {
      const response = await fetch(`/api/deleteMovie?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete movie')
      }

      // Show success snackbar
      _showSnackbar(`${title} removed successfully`, 'success')

      // Wait for animation to complete before refreshing
      setTimeout(() => {
        _refresh()
      }, 300)
    } catch (error) {
      console.error('Error deleting movie:', error)
      // Show error snackbar
      _showSnackbar('Failed to delete movie. Please try again.', 'error')
      // If API fails, restore UI and refresh
      setIsDeleting(false)
      _refresh()
    }
  }

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
}

const MovieList = ({ children }: { children: React.ReactNode }) => (
  <ul
    id='movie-list'
    className='flex p-4 flex-wrap transition-all duration-1000 ease-smooth content-start justify-start max-h-[75vh] gap-x-4 scrollbar-thin scrollbar-thumb-purple'
  >
    {children}
  </ul>
)

const MovieTableRow = (movie: Movie) => {
  const { title, year, id, poster, watched, imdbID, imdbId } = movie
  const [optimisticWatched, setOptimisticWatched] = useState(watched)

  useEffect(() => {
    setOptimisticWatched(watched)
  }, [watched])

  const handleToggleWatched = async () => {
    setOptimisticWatched(!optimisticWatched)
    try {
      const response = await fetch('/api/toggleWatched', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId: id }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle watched status')
      }

      _refresh()
    } catch (error) {
      console.error('Error toggling watched status:', error)
      // Revert on error
      setOptimisticWatched(watched)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/deleteMovie?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete movie')
      }

      _showSnackbar(`${title} removed successfully`, 'success')
      _refresh()
    } catch (error) {
      console.error('Error deleting movie:', error)
      _showSnackbar('Failed to delete movie. Please try again.', 'error')
    }
  }

  const movieImdbId = imdbID || imdbId

  return (
    <TableRow
      key={id}
      onClick={() => {
        if (movieImdbId) {
          window.open(
            `https://www.imdb.com/title/${movieImdbId}`,
            '_blank',
            'noopener,noreferrer'
          )
        }
      }}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          cursor: movieImdbId ? 'pointer' : 'default',
        },
      }}
    >
      <TableCell>
        {poster && (
          <Image
            src={poster}
            alt={title}
            width={50}
            height={74}
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{ color: 'white' }}>{title}</TableCell>
      <TableCell sx={{ color: 'white' }}>{year}</TableCell>
      <TableCell align='center'>
        <Fab
          size='small'
          onClick={(e) => {
            e.stopPropagation()
            handleToggleWatched()
          }}
          title={optimisticWatched ? 'Mark as Unwatched' : 'Mark as Watched'}
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
      </TableCell>
      <TableCell align='center'>
        <Fab
          size='small'
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
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
      </TableCell>
    </TableRow>
  )
}

export default function UI({
  movies,
  userId,
}: {
  movies: Movie[]
  userId?: string
}) {
  const router = useRouter()
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filterText, setFilterText] = useState('')
  const [watchedFilter, setWatchedFilter] = useState<
    'all' | 'hideWatched' | 'onlyWatched'
  >('all')

  // Filter movies based on title, year, and watched status
  const filteredMovies = movies.filter((movie) => {
    // Filter by watched status
    if (watchedFilter === 'hideWatched' && movie.watched) return false
    if (watchedFilter === 'onlyWatched' && !movie.watched) return false

    // Filter by search text
    if (!filterText) return true
    const searchText = filterText.toLowerCase()
    const titleMatch = movie.title.toLowerCase().includes(searchText)
    const yearMatch = movie.year?.includes(searchText)
    return titleMatch || yearMatch
  })

  _refresh = router.refresh
  _showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity })
  }

  useEffect(() => {
    ;(document as any).flips = [...document.querySelectorAll('#flips > audio')]

    // Listen for view changes from settings
    const handleViewChange = (event: CustomEvent) => {
      setViewMode(event.detail)
    }

    // Listen for filter changes
    const handleFilterMovies = (event: CustomEvent) => {
      setFilterText(event.detail)
    }

    // Listen for watched filter changes
    const handleWatchedFilterChange = (event: CustomEvent) => {
      setWatchedFilter(event.detail)
    }

    // Listen for snackbar events from other components
    const handleShowSnackbar = (event: CustomEvent) => {
      const { message, severity } = event.detail
      setSnackbar({ open: true, message, severity })
    }

    window.addEventListener('viewChange', handleViewChange as EventListener)
    window.addEventListener('filterMovies', handleFilterMovies as EventListener)
    window.addEventListener(
      'watchedFilterChange',
      handleWatchedFilterChange as EventListener
    )
    window.addEventListener('showSnackbar', handleShowSnackbar as EventListener)
    return () => {
      window.removeEventListener(
        'viewChange',
        handleViewChange as EventListener
      )
      window.removeEventListener(
        'filterMovies',
        handleFilterMovies as EventListener
      )
      window.removeEventListener(
        'watchedFilterChange',
        handleWatchedFilterChange as EventListener
      )
      window.removeEventListener(
        'showSnackbar',
        handleShowSnackbar as EventListener
      )
    }
  }, [])

  // Sync viewMode changes back to settings
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('viewModeSync', { detail: viewMode }))
  }, [viewMode])

  return (
    <>
      <section
        id='movie-list-container'
        className={`opacity-100 ${
          viewMode === 'grid' ? 'h-screen' : 'min-h-screen'
        } flex transition-all duration-1000 ease-smooth justify-center m-0 p-20 box-border overflow-auto`}
      >
        {viewMode === 'grid' ? (
          <MovieList>
            {filteredMovies.map((movie) => (
              <MovieListItem key={movie.id} {...movie} />
            ))}
          </MovieList>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: '90%',
              maxHeight: 'calc(100vh - 200px)',
              width: 'fit-content',
              overflow: 'auto',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Table
              sx={{ minWidth: 650 }}
              stickyHeader
              aria-label='movies table'
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    }}
                  >
                    Poster
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    }}
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    }}
                  >
                    Year
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    }}
                    align='center'
                  >
                    Watched
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    }}
                    align='center'
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMovies.map((movie) => (
                  <MovieTableRow key={movie.id} {...movie} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </section>
      <div id='flips'>
        <audio src='/flip-1.mp3' preload='auto'></audio>
        <audio src='/flip-2.mp3' preload='auto'></audio>
        <audio src='/flip-3.mp3' preload='auto'></audio>
        <audio src='/flip-4.mp3' preload='auto'></audio>
        <audio src='/flip-5.mp3' preload='auto'></audio>
        <audio src='/flip-6.mp3' preload='auto'></audio>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        TransitionComponent={
          snackbar.open ? SlideUpTransition : SlideRightTransition
        }
        sx={{
          bottom: '16px !important',
          left: '16px !important',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            boxShadow: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <VideoPlayer />
    </>
  )
}

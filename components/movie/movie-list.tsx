/**
 * UI Component - Client Component
 * Handles movie list display and interactions
 */

'use client'
import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import Image from 'next/image'
import { MovieProvider } from '@/contexts/MovieContext'
import { useMovieActions } from '@/hooks/useMovieActions'
import Fab from '@mui/material/Fab'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import VideoPlayer from './video-player'
import MovieListItem, { Movie } from './movie-list-item'
import { useSnackbar } from '@/contexts/SnackbarContext'

const MovieList = ({ children }: { children: React.ReactNode }) => (
  <ul
    id='movie-list'
    className='
      flex flex-wrap w-full transition-all duration-1000 ease-smooth
      content-start justify-evenly max-h-[100vh] gap-x-4 scrollbar-thin
      scrollbar-thumb-purple overflow-y-auto p-20
    '
  >
    {children}
  </ul>
)

const MovieTableRow = memo((movie: Movie) => {
  const { title, year, id, poster, watched, imdbID, imdbId } = movie
  const [optimisticWatched, setOptimisticWatched] = useState(watched)
  const { toggleWatched, deleteMovie } = useMovieActions()

  useEffect(() => {
    setOptimisticWatched(watched)
  }, [watched])

  const handleToggleWatched = useCallback(async () => {
    if (!id) return

    setOptimisticWatched(!optimisticWatched)
    const success = await toggleWatched(id)

    if (!success) setOptimisticWatched(watched)
  }, [id, optimisticWatched, watched, toggleWatched])

  const handleDelete = useCallback(async () => {
    if (!id) return
    await deleteMovie(id, title)
  }, [id, title, deleteMovie])

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
})

MovieTableRow.displayName = 'MovieTableRow'

function UIContent({ movies, userId }: { movies: Movie[]; userId?: string }) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filterText, setFilterText] = useState('')
  const [watchedFilter, setWatchedFilter] = useState<
    'all' | 'hideWatched' | 'onlyWatched'
  >('all')
  const { showSnackbar } = useSnackbar()

  // Memoize event handlers to prevent recreation
  const handleViewChange = useCallback((event: CustomEvent) => {
    setViewMode(event.detail)
  }, [])

  const handleFilterMovies = useCallback((event: CustomEvent) => {
    setFilterText(event.detail)
  }, [])

  const handleWatchedFilterChange = useCallback((event: CustomEvent) => {
    setWatchedFilter(event.detail)
  }, [])

  const handleShowSnackbar = useCallback(
    (event: CustomEvent) => {
      const { message, severity } = event.detail
      showSnackbar(message, severity)
    },
    [showSnackbar]
  )

  // Filter movies based on title, year, and watched status
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
    ;(document as any).flips = [...document.querySelectorAll('#flips > audio')]

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
  }, [
    handleViewChange,
    handleFilterMovies,
    handleWatchedFilterChange,
    handleShowSnackbar,
  ])

  // Sync viewMode changes back to settings
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('viewModeSync', { detail: viewMode }))
  }, [viewMode])

  return (
    <>
      <section
        id='movie-list-container'
        className={`opacity-100  pt-10 ${
          viewMode === 'grid' ? 'h-screen' : 'min-h-screen'
        } flex transition-all duration-1000 ease-smooth justify-evenly m-0 box-border overflow-auto`}
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
      <VideoPlayer />
    </>
  )
}

export default function UI({
  movies,
  userId,
}: {
  movies: Movie[]
  userId?: string
}) {
  const { showSnackbar } = useSnackbar()

  return (
    <MovieProvider onSnackbar={showSnackbar}>
      <UIContent movies={movies} userId={userId} />
    </MovieProvider>
  )
}

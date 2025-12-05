'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Slide from '@mui/material/Slide'
import Tooltip from '@mui/material/Tooltip'
import { TransitionProps } from '@mui/material/transitions'

interface Movie {
  id?: string
  title: string
  year?: string
  poster?: string
  imdbID?: string
}

interface OMDBSearchResult {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

interface OMDBSearchResponse {
  Search: OMDBSearchResult[]
  totalResults: string
  Response: string
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

const fetchMovieData = async ({
  title,
}: {
  title: string
}): Promise<OMDBSearchResponse | { Search: [] }> => {
  const response = await fetch('/api/fetchMovieData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ Title: title }),
  })
  if (!response.ok) {
    // 404 is expected when no movies are found - return empty result
    if (response.status === 404) {
      return { Search: [] }
    }
    throw new Error(`Failed to fetch movie data: ${response.status}`)
  }
  const data = await response.json()
  return data
}

const addMovie = async (
  movie: Movie,
  imdbId: string,
  onSuccess?: () => void
) => {
  try {
    const response = await fetch('/api/addMovie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie, docId: imdbId }),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    onSuccess?.()
  } catch (error) {
    console.error('Error adding movie:', error)
    throw error
  }
}

interface AddMovieFabProps {
  userId?: string
}

export default function AddMovieFab({ userId }: AddMovieFabProps) {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [options, setOptions] = useState<readonly Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'error',
  })

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setInputValue('')
    setOptions([])
  }

  const handleInputChange = async (
    _event: React.SyntheticEvent,
    value: string
  ) => {
    setInputValue(value)

    if (value.length < 1) {
      setOptions([])
      return
    }

    setLoading(true)
    try {
      const data = await fetchMovieData({ title: value })
      const movieData =
        data?.Search?.map?.((movie: OMDBSearchResult) => ({
          title: movie.Title,
          year: movie.Year,
          poster: movie.Poster,
          imdbID: movie.imdbID,
        })) || []

      setOptions(movieData)
    } catch (error) {
      console.error('Error fetching movie data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to fetch movie data. Please try again.',
        severity: 'error',
      })
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (
    _event: React.SyntheticEvent,
    value: Movie | null
  ) => {
    if (value && value.imdbID && userId) {
      try {
        await addMovie(
          {
            title: value.title,
            year: value.year,
            poster: value.poster,
            userId,
          } as Movie,
          value.imdbID,
          () => {
            router.refresh()
            setSnackbar({
              open: true,
              message: `${value.title} added successfully!`,
              severity: 'success',
            })
          }
        )
        setInputValue('')
        setOptions([])
        handleClose()
      } catch (error) {
        console.error('Error adding movie:', error)
        setSnackbar({
          open: true,
          message: 'Failed to add movie. Please try again.',
          severity: 'error',
        })
      }
    }
  }

  if (!userId) {
    return null
  }

  return (
    <>
      <Tooltip title='Add Movie' arrow placement='left'>
        <Fab
          color='primary'
          aria-label='add movie'
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: 1000,
            '&:hover': {
              '& svg': {
                transform: 'scale(1.1)',
                transition: 'transform 0.1s ease-in-out',
              },
            },
            '& svg': {
              transition: 'transform 0.1s ease-in-out',
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '90vw',
            p: 2,
          },
        }}
      >
        <Box>
          <Autocomplete
            options={options}
            loading={loading}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleChange}
            getOptionLabel={(option) =>
              `${option.title}${option.year ? ` (${option.year})` : ''}`
            }
            isOptionEqualToValue={(option, value) =>
              option.imdbID === value.imdbID
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Search movies…'
                autoFocus
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color='inherit' size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
      </Menu>
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
    </>
  )
}

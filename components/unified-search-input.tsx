'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { useSnackbar } from '@/contexts/SnackbarContext'

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

interface UnifiedSearchInputProps {
  mode: 'filter' | 'add'
  open: boolean
  onClose: () => void
  userId?: string
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

export default function UnifiedSearchInput({
  mode,
  open,
  onClose,
  userId,
}: UnifiedSearchInputProps) {
  const router = useRouter()
  const [options, setOptions] = useState<readonly Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { showSnackbar } = useSnackbar()

  const searchCache = useRef<Map<string, Movie[]>>(new Map())
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Reset state when mode changes or closes
  useEffect(() => {
    if (!open) {
      setInputValue('')
      setOptions([])
      setLoading(false)
    }
  }, [open])

  const handleInputChange = useCallback(
    async (_event: React.SyntheticEvent, value: string) => {
      setInputValue(value)

      if (mode === 'filter') {
        // For filter mode, dispatch event immediately
        window.dispatchEvent(
          new CustomEvent('filterMovies', { detail: value.toLowerCase() })
        )
        return
      }

      // For add mode, do movie search with debouncing
      if (debounceTimer.current) clearTimeout(debounceTimer.current)

      if (value.length < 1) {
        setOptions([])
        setLoading(false)
        return
      }

      const cachedResults = searchCache.current.get(value.toLowerCase())
      if (cachedResults) {
        setOptions(cachedResults)
        return
      }

      setLoading(true)

      debounceTimer.current = setTimeout(async () => {
        try {
          const data = await fetchMovieData({ title: value })
          const movieData =
            data?.Search?.map?.((movie: OMDBSearchResult) => ({
              title: movie.Title,
              year: movie.Year,
              poster: movie.Poster,
              imdbID: movie.imdbID,
            })) || []

          searchCache.current.set(value.toLowerCase(), movieData)
          setOptions(movieData)
          setLoading(false)
        } catch (error) {
          console.error('Error fetching movies:', error)
          setOptions([])
          setLoading(false)
        }
      }, 300)
    },
    [mode]
  )

  const handleChange = async (
    _event: React.SyntheticEvent,
    value: Movie | null
  ) => {
    if (!value || mode !== 'add') return

    try {
      await addMovie(value, value.imdbID || value.title, () => {
        showSnackbar(`"${value.title}" has been added!`, 'success')
        router.refresh()
        onClose()
      })
    } catch (error) {
      showSnackbar('Failed to add movie. Please try again.', 'error')
    }
  }

  const handleClear = () => {
    setInputValue('')
    if (mode === 'filter') {
      window.dispatchEvent(new CustomEvent('filterMovies', { detail: '' }))
    }
  }

  const content = open ? (
    <Paper
      sx={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        width: 400,
        maxWidth: '90vw',
        p: 2,
        zIndex: 1300,
        boxShadow: 6,
        transform: open ? 'scale(1)' : 'scale(0)',
        transformOrigin: 'bottom right',
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Box>
          {mode === 'filter' ? (
            <TextField
              fullWidth
              placeholder='Filter by title or year...'
              value={inputValue}
              onChange={(e) => handleInputChange(e as any, e.target.value)}
              autoFocus
              InputProps={{
                endAdornment: inputValue && (
                  <Box
                    component='span'
                    onClick={handleClear}
                    sx={{
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    ✕
                  </Box>
                ),
              }}
            />
          ) : (
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
          )}
        </Box>
      </ClickAwayListener>
    </Paper>
  ) : null

  return typeof window !== 'undefined'
    ? createPortal(content, document.body)
    : null
}

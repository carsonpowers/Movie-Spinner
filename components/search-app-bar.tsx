'use client'

import { useState } from 'react'
import { styled, alpha } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import { handleSignIn, handleSignOut } from '@/app/actions/auth-actions'
import { Button } from '@/components/ui/base-button'

interface Movie {
  id?: string
  title: string
  year?: string
  poster?: string
  imdbID?: string
}

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

const addMovie = async (movie: Movie, docId: string) => {
  if (!docId) return
  try {
    const response = await fetch('/api/addMovie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie, docId }),
    })
    if (!response.ok) {
      throw new Error('Failed to add movie')
    }
    window.location.reload()
  } catch (error) {
    console.error('Error adding movie:', error)
  }
}

const StyledAutocomplete = styled(Autocomplete<Movie>)(({ theme }) => ({
  width: 300,
  '& .MuiOutlinedInput-root': {
    color: 'inherit',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.5),
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 2),
  },
}))

interface SearchAppBarProps {
  userId?: string
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export default function SearchAppBar({ userId, user }: SearchAppBarProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

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
    const data = await fetchMovieData({ title: value, search: true })
    const movieData =
      data?.Search?.map?.((movie: any) => ({
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster,
        imdbID: movie.imdbID,
      })) || []

    setOptions(movieData)
    setLoading(false)
  }

  const handleChange = (_event: React.SyntheticEvent, value: Movie | null) => {
    if (value && value.imdbID && userId) {
      addMovie(
        {
          title: value.title,
          year: value.year,
          poster: value.poster,
          userId,
        } as Movie,
        value.imdbID
      )
      setInputValue('')
      setOptions([])
    }
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='fixed' sx={{ zIndex: 9999 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 0, mr: 2 }}>
            {!user ? (
              <form action={handleSignIn}>
                <Button type='submit' variant='outline'>
                  Sign In
                </Button>
              </form>
            ) : (
              <>
                <Tooltip title='Open settings'>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.name || 'User'} src={user.image || ''}>
                      {!user.image && userInitials}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id='menu-appbar'
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Box>
                      <Typography variant='body2' fontWeight='bold'>
                        {user.name}
                      </Typography>
                      {user.email && (
                        <Typography variant='caption' color='text.secondary'>
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                  <Divider />
                  <form action={handleSignOut}>
                    <MenuItem
                      component='button'
                      type='submit'
                      sx={{ width: '100%', color: 'error.main' }}
                    >
                      Log out
                    </MenuItem>
                  </form>
                </Menu>
              </>
            )}
          </Box>
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Movie Wheel
          </Typography>
          {user && (
            <StyledAutocomplete
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
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
        </Toolbar>
      </AppBar>
    </Box>
  )
}

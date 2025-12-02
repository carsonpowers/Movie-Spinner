/**
 * User Panel Component - Client Component
 * Handles user authentication display and actions using Material UI menu
 */

'use client'

import { handleSignIn, handleSignOut } from '@/app/actions/auth-actions'
import { Menu, MenuItem, MenuSeparator, MenuLabel } from '@/components/ui/menu'
import { Button } from '@/components/ui/base-button'
import { useState } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'

interface UserPanelProps {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export default function UserPanel({ user }: UserPanelProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (!user) {
    return (
      <div className='fixed top-4 left-4 z-[100000]'>
        <form action={handleSignIn}>
          <Button type='submit' variant='outline'>
            Sign In
          </Button>
        </form>
      </div>
    )
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className='fixed top-4 left-4 z-[100000]'>
      <Button
        variant='outline'
        onClick={handleClick}
        className='gap-2 px-2 text-gray-500 hover:text-gray-950 transition-colors duration-300 ease-in'
      >
        <div className='size-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden'>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || 'User'}
              className='size-full object-cover'
            />
          ) : (
            <span className='text-sm font-medium'>{userInitials}</span>
          )}
        </div>
        {user.name && <div className='truncate max-w-32'>{user.name}</div>}
      </Button>

      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            style: {
              width: '14rem',
              borderRadius: '8px',
              marginTop: '4px',
            },
          },
        }}
      >
        <MenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <div className='size-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden'>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className='size-full object-cover'
                />
              ) : (
                <span className='text-sm font-medium'>{userInitials}</span>
              )}
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.name}</span>
              {user.email && (
                <span className='text-muted-foreground truncate text-xs'>
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </MenuLabel>

        <MenuSeparator />

        <form action={handleSignOut}>
          <button type='submit' style={{ all: 'unset', width: '100%' }}>
            <MenuItem
              className='w-full text-red-600 cursor-pointer'
              onClick={handleClose}
            >
              <LogoutIcon
                sx={{ fontSize: 16, marginRight: 1, color: '#dc2626' }}
              />
              Log out
            </MenuItem>
          </button>
        </form>
      </Menu>
    </div>
  )
}

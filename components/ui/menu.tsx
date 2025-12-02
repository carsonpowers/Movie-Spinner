'use client'

import * as React from 'react'
import MuiMenu, { MenuProps } from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import MuiDivider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'

// Re-export Material UI Menu components with aliases
export const Menu = ({ children, ...props }: MenuProps) => {
  return <MuiMenu {...props}>{children}</MuiMenu>
}

export const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  fontSize: '0.875rem',
  padding: '6px 8px',
  minHeight: 'auto',
}))

export const MenuSeparator = styled(MuiDivider)({
  margin: '4px -4px',
})

// Note: Material UI Menu doesn't use these patterns, but we'll keep exports for compatibility
export const MenuTrigger = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
export const MenuPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
export const MenuPositioner = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
export const MenuPopup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
export const MenuLabel = styled('div')({
  padding: '6px 8px',
  fontSize: '0.875rem',
  fontWeight: 600,
})

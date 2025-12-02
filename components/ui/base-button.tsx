'use client'

import * as React from 'react'
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'

// Map custom variants to Material UI variants
const variantMap = {
  default: 'contained',
  destructive: 'contained',
  outline: 'outlined',
  secondary: 'contained',
  ghost: 'text',
  link: 'text',
} as const

const colorMap = {
  default: 'primary',
  destructive: 'error',
  outline: 'primary',
  secondary: 'secondary',
  ghost: 'inherit',
  link: 'inherit',
} as const

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', children, sx, ...props }, ref) => {
    const muiVariant = variantMap[variant] as 'contained' | 'outlined' | 'text'
    const muiColor = colorMap[variant] as any

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        disableElevation
        sx={{
          textTransform: 'none',
          ...(variant === 'link' && {
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
            '&:hover': {
              textDecoration: 'underline',
            },
          }),
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    )
  }
)
Button.displayName = 'Button'

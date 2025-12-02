'use client'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { darkTheme } from '@/lib/theme'
import EmotionCacheProvider from './EmotionCacheProvider'

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EmotionCacheProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  )
}

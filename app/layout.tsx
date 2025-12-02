/**
 * Root Layout Component
 * Server Component with optimal performance settings
 */

import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'
import MuiThemeProvider from '@/components/MuiThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas-neue',
})

export const metadata: Metadata = {
  title: 'Movie Wheel - Spin to Pick Your Next Movie',
  description:
    'A fun way to decide what movie to watch. Add your movies and spin the wheel!',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  keywords: ['movie', 'wheel', 'spinner', 'random', 'picker'],
  authors: [{ name: 'Movie Wheel' }],
  openGraph: {
    title: 'Movie Wheel',
    description: 'Spin the wheel to pick your next movie',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movie Wheel',
    description: 'Spin the wheel to pick your next movie',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={`${inter.className} ${bebasNeue.variable}`}>
      <head>
        <link rel='preconnect' href='https://firebasestorage.googleapis.com' />
        <link
          rel='dns-prefetch'
          href='https://firebasestorage.googleapis.com'
        />
      </head>
      <body className='overflow-hidden text-white bg-black bg-crosshatch bg-cover bg-repeat'>
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  )
}

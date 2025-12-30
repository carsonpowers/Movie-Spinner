/**
 * Home Page - Server Component
 * Fetches movies server-side for optimal performance
 * Supports both authenticated users and anonymous users
 */

import { Suspense } from 'react'
import { auth } from '@/auth'
import { getUserMovies } from '@/lib/firebase/firestore'
import UserPanel from '@/components/layout/user-panel'
import MovieListSkeleton from '@/components/movie/movie-list-skeleton'
import RatingPopup from '@/components/movie/rating-popup'
import LoadingSpinner from '@/components/common/loading-spinner'
import HomePageContent from '@/components/home-page-content'

// Enable dynamic rendering for auth
export const dynamic = 'force-dynamic'

// Revalidate every 60 seconds
export const revalidate = 60

async function getMoviesForUser() {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  try {
    const movies = await getUserMovies(session.user.id)
    return movies
  } catch (error) {
    console.error('Error fetching movies:', error)
    return []
  }
}

export default async function HomePage() {
  const session = await auth()
  const serverMovies = await getMoviesForUser()

  return (
    <main className='min-h-screen bg-gradient-to-b from-gray-900 to-black'>
      <Suspense fallback={<LoadingSpinner />}>
        <UserPanel user={session?.user} />
      </Suspense>
      <Suspense fallback={<MovieListSkeleton count={12} />}>
        <HomePageContent
          serverMovies={serverMovies}
          userId={session?.user?.id}
        />
      </Suspense>
      <Suspense fallback={null}>
        <RatingPopup />
      </Suspense>
    </main>
  )
}

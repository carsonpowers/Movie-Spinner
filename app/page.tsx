/**
 * Home Page - Server Component
 * Fetches movies server-side for optimal performance
 */

import { Suspense } from 'react'
import { auth } from '@/auth'
import { getUserMovies } from '@/lib/firebase/firestore'
import UserPanel from '@/components/layout/user-panel'
import MovieList from '@/components/movie/movie-list'
import Wheel from '@/components/movie/wheel'
import RatingPopup from '@/components/movie/rating-popup'
import ViewNavigation from '@/components/layout/bottom-navigation'
import LoadingSpinner from '@/components/common/loading-spinner'
import MovieListSkeleton from '@/components/movie/movie-list-skeleton'
import RightSideMenu from '@/components/layout/right-side-menu'

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
  const movies = await getMoviesForUser()

  return (
    <main className='min-h-screen bg-gradient-to-b from-gray-900 to-black'>
      <Suspense fallback={<LoadingSpinner />}>
        <UserPanel user={session?.user} />
      </Suspense>
      <Suspense fallback={<MovieListSkeleton count={12} />}>
        <MovieList movies={movies} userId={session?.user?.id} />
      </Suspense>
      <Suspense fallback={null}>
        <Wheel movies={movies} />
        <RatingPopup />
        <RightSideMenu userId={session?.user?.id} movieCount={movies.length} />
        <ViewNavigation movieCount={movies.length} />
      </Suspense>
    </main>
  )
}

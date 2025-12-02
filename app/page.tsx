/**
 * Home Page - Server Component
 * Fetches movies server-side for optimal performance
 */

import { Suspense } from 'react'
import { auth } from '@/auth'
import { getUserMovies } from '@/lib/firebase/firestore'
import UserPanel from '@/components/user-panel'
import UI from '@/components/ui'
import Wheel from '@/components/wheel'
import DownButton from '@/components/down-button'
import LoadingSpinner from '@/components/loading-spinner'
import AddMovieFab from '@/components/add-movie-fab'
import SettingsFab from '@/components/settings-fab'
import FilterFab from '@/components/filter-fab'

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
        <UI movies={movies} userId={session?.user?.id} />
        <Wheel movies={movies} />
        <FilterFab />
        <AddMovieFab userId={session?.user?.id} />
        <SettingsFab />
        <DownButton movieCount={movies.length} />
      </Suspense>
    </main>
  )
}

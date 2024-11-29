import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Thing from '@/components/Thing'
// import { snackbar } from 'mdui/functions/snackbar.js'

const db = getFirestore(
  initializeApp({
    apiKey: 'AIzaSyB0rF3EY3uk-cspgx6VtGFlegq7Uxm6AKw',
    authDomain: 'movie-spinner-4a579.firebaseapp.com',
    projectId: 'movie-spinner-4a579',
    storageBucket: 'movie-spinner-4a579.appspot.com',
    messagingSenderId: '288775417657',
    appId: '1:288775417657:web:dd6a0ae5cd44f0748b82e8',
  })
)

async function getMovies() {
  const moviesCol = collection(db, 'movies')
  const movieSnapshot = await getDocs(moviesCol)
  const movieList = movieSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  return movieList
}

export default async function Home() {
  const movies = await getMovies()
  return <Thing movies={movies}></Thing>
}

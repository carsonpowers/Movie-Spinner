'use client'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import autocompleter from 'autocompleter'
import { useEffect, useRef } from 'react'

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

const fetchMovieData = async ({ Title }) =>
  (
    await fetch(`http://www.omdbapi.com/?apikey=44648a33&s=${Title}&type=movie`)
  ).json()

async function addMovie(movie: any) {
  const moviesCol = collection(db, 'movies')
  const thing = await addDoc(moviesCol, movie)
  console.log('thing', thing)
}

const removeMovie = async ({ target }: { target: HTMLElement }) => {
  const id = target.closest('li')?.dataset?.id
  if (!id) throw new Error("Couldn't find movie id")
  console.log('deleting', id)
  //   await deleteDoc(doc(db, 'movies', id))
}

const RemoveButton = ({ Title }) => (
  <button
    style={{
      position: 'absolute',
      right: '1rem',
    }}
    onClick={removeMovie}
    title={`Remove ${Title}`}
    aria-label={`Remove ${Title}`}
  >
    <label className='cursor-pointer'>❌</label>
  </button>
)

const ListItem = ({
  id,
  Title,
  children,
}: {
  id: string
  Title: string
  children: React.ReactNode
  key: string
}) => (
  <li
    style={{ position: 'relative' }}
    className='p-2 border border-white cursor-pointer rounded-xl m-2'
    key={id}
    data-id={id}
    title={Title}
  >
    <div style={{ display: 'flex' }}>{children}</div>
  </li>
)

const AddListItem = () => {
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      autocompleter({
        input: inputRef.current,
        fetch: async (text, update) => {
          const data = await fetchMovieData({ Title: text, Year: '' })
          console.log('data', data)

          const suggestions = data.Search
            ? data.Search.map((movie) => ({
                label: movie.Title,
                value: movie.Title,
              }))
            : []
          update(suggestions)
        },
        onSelect: (item) => {
          inputRef.current.value = item.label
        },
      })
    }
  }, [])

  return (
    <ListItem>
      <input
        ref={inputRef}
        type='text'
        placeholder='Add a movie...'
        className='w-full rounded-2xl text-center text-black'
      />
    </ListItem>
  )
}

const MovieList = ({ movies }) => {
  return (
    <ul className='list-none p-0 m-0 border border-white rounded-2xl text-1xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full'>
      {movies.map(({ id, Title, Year }) => (
        <ListItem key={id} id={id} Title={Title}>
          <label
            style={{
              display: 'block',
              maxWidth: 'calc(100% - 3rem)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
            }}
          >
            {Title}
            {` (${Year})`}
          </label>
          <RemoveButton Title={Title} />
        </ListItem>
      ))}
      <AddListItem />
    </ul>
  )
}

export default function UI({ movies }) {
  return (
    <>
      <section style={{ width: '100%' }}>
        <h2>Movies</h2>
        <div
          id='movie-list-container'
          className='flex flex-wrap justify-center border border-white'
        >
          <MovieList movies={movies} />
        </div>
        <button onClick={() => addMovie({ Title: 'test1', Year: '2021' })}>
          Add Movie
        </button>
      </section>
    </>
  )
}

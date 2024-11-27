'use client'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, deleteDoc, setDoc } from 'firebase/firestore'
import autocompleter from 'autocompleter'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Movie {
  Title: string
  imdbID: string
  Year: string
}

let _refresh

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

const fetchMovieData = async ({ Title }: { Title: string }) => {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=44648a33&s=${Title}&type=movie`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return null // or handle the error as needed
  }
}

const addMovie = async (movie: any, docId: string) => {
  if (!docId) return
  await setDoc(doc(db, 'movies', docId), movie)
  _refresh()
}

const removeMovie = async ({ target }: { target: HTMLElement }) => {
  const Menu = target.closest('ul')
  const LI = target.closest('li')
  const {
    dataset: { id },
  } = LI || {}

  if (!id) throw new Error("Couldn't find movie id")

  await deleteDoc(doc(db, 'movies', id))

  Menu?.animate(
    [
      { height: `${Menu.offsetHeight}px` },
      { height: `${Menu.offsetHeight - (LI?.offsetHeight + 8)}px` },
    ],
    {
      duration: 500, // duration in milliseconds
      easing: 'ease-out', // easing function
      fill: 'forwards', // keep the element at the end state of the animation
    }
  )

  LI.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 500, // duration in milliseconds
    easing: 'ease-out', // easing function
    fill: 'forwards', // keep the element at the end state of the animation
  }).onfinish = () => {
    LI.style = 'display:none'
    Menu.animate([{ height: `auto` }], {
      duration: 0, // duration in milliseconds
      fill: 'forwards', // keep the element at the end state of the animation
    }).onfinish = () => {
      _refresh()
    }
  }
}

const RemoveButton = ({ Title }) => (
  <button
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
    className='relative justify-between capitalize p-2 border border-white cursor-pointer rounded-xl m-2 flex'
    key={id}
    data-id={id}
    title={Title}
  >
    {children}
  </li>
)

const initAutoCompleter = (input: HTMLInputElement) => {
  autocompleter({
    input,
    showOnFocus: true,
    fetch: async (text, update) => {
      const movieData = (await fetchMovieData({ Title: text })).Search?.map?.(
        ({ Title: label, imdbID, Year }: Movie) => ({
          label,
          value: label,
          imdbID,
          Year,
        })
      ) || [{ label: 'No results found' }]
      update(movieData)
    },
    onSelect: ({ label: Title = '', Year, imdbID }: Movie) => {
      if (!imdbID) return
      input.value = Title
      input.blur()
      addMovie({ Title, Year }, imdbID)
    },
  })
}

const AddListItem = () => {
  const inputRef = useRef(null)

  useEffect(() => {
    const { current: input } = inputRef
    if (input) initAutoCompleter(input)
  }, [])

  return (
    <ListItem>
      <input
        style={{
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem',
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          outline: 'none',
        }}
        id='movie-input'
        ref={inputRef}
        type='text'
        placeholder='Add a movie...'
        className='w-full text-center text-black'
      />
    </ListItem>
  )
}

const MovieList = ({ movies }: { movies: [Movie] }) => (
  <ul
    id='movie-list'
    className='opacity-0 overflow-hidden list-none p-0 m-0 border border-white rounded-2xl text-1xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full'
    style={{ transition: 'opacity 0.5s' }}
  >
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
            flex: '1',
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

export default function UI({ movies }) {
  _refresh = useRouter()?.refresh
  return <MovieList movies={movies} />
}

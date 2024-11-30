'use client'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, deleteDoc, setDoc } from 'firebase/firestore'
import autocompleter from 'autocompleter'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

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
    const response = await fetch('/api/fetchMovieData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Title }),
    })
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
  try {
    const response = await fetch('/api/addMovie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie, docId }),
    })
    if (!response.ok) {
      throw new Error('Failed to add movie')
    }
    _refresh()
  } catch (error) {
    console.error('Error adding movie:', error)
  }
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
    id='remove-button'
    onClick={removeMovie}
    title={`Remove ${Title}`}
    aria-label={`Remove ${Title}`}
  >
    <label className='cursor-pointer'>✖️</label>
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
    minLength: 1,
    debounceWaitMs: 300,
    fetch: async (text, update) => {
      let movieData = (await fetchMovieData({ Title: text }))?.Search?.map?.(
        ({ Title: label, Poster, imdbID, Year }: Movie) => ({
          label: `${label} (${Year})`,
          value: label,
          Poster,
          imdbID,
          Year,
        })
      )
      update(movieData?.length ? movieData : [{ label: 'No results found' }])
    },
    onSelect: ({ value: Title = '', Year, Poster, imdbID }: Movie) => {
      if (!imdbID) return
      input.value = Title
      input.blur()
      addMovie({ Title, Year, Poster }, imdbID)
    },
  })
}

const MovieInputListItem = () => {
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

const MovieListItem = ({ id, Title, Year }: Movie) => (
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
        color: '#785dc8',
      }}
    >
      {Title}
      {` (${Year})`}
    </label>
    <RemoveButton Title={Title} />
  </ListItem>
)

const MovieList = ({ children }) => <ul id='movie-list'>{children}</ul>

export default function UI({ movies }: { movies: Movie[] }) {
  _refresh = useRouter()?.refresh
  return (
    <section id='movie-list-container' className='opacity-0'>
      <MovieList>
        {movies.map(MovieListItem)}
        <MovieInputListItem />
      </MovieList>
    </section>
  )
}

/**
 * Fetch Movie Data API Route
 * Fetches movie information from external API (OMDB, etc.)
 * Edge Runtime for optimal performance
 */
// cSpell:ignore OMDB maxage imdb

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Cache movie data for 24 hours
const CACHE_DURATION = 60 * 60 * 24

export async function POST(request: NextRequest) {
  try {
    const { Title, search } = await request.json()

    if (!Title && !search) {
      return NextResponse.json(
        { error: 'Movie title or search query is required' },
        { status: 400 }
      )
    }

    // Using OMDB API as an example - replace with your preferred movie API
    const apiKey = process.env.OMDB_API_KEY || process.env.MOVIE_API_KEY
    
    if (!apiKey) {
      console.error('Movie API key not configured')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // If search is true, use the search endpoint (s=), otherwise use title lookup (t=)
    const searchParam = search ? `s=${encodeURIComponent(Title)}` : `t=${encodeURIComponent(Title)}`
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&${searchParam}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: CACHE_DURATION,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.Response === 'False') {
      return NextResponse.json(
        { error: data.Error || 'Movie not found' },
        { status: 404 }
      )
    }

    // If it's a search query, return the search results directly
    if (search) {
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      })
    }

    // Transform OMDB response to our format for single movie lookup
    const movieData = {
      title: data.Title,
      year: data.Year,
      genre: data.Genre,
      rating: data.imdbRating,
      poster: data.Poster !== 'N/A' ? data.Poster : undefined,
      imdbId: data.imdbID,
      plot: data.Plot,
      director: data.Director,
      actors: data.Actors,
      runtime: data.Runtime,
    }

    return NextResponse.json(movieData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    })
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie data' },
      { status: 500 }
    )
  }
}

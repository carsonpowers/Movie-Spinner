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
    const { Title } = await request.json()

    if (!Title) {
      return NextResponse.json(
        { error: 'Movie title is required' },
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

    // Use the search endpoint to find movies by title
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(Title)}`
    
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

    // Return the search results directly
    return NextResponse.json(data, {
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

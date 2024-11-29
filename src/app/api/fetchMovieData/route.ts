
import { NextResponse } from "next/server";

// To handle a POST request to /api/fetchMovieData
export async function POST(request) {
  const { Title } = await request.json();
  if (!Title) {
    return NextResponse.json({ error: 'Missing Title' }, { status: 400 });
  }
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=44648a33&s=${Title}&type=movie`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return NextResponse.json({ error: 'Error fetching movie data' }, { status: 500 });
  }
}
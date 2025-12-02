import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imdbId = searchParams.get('imdbId')
  const proxy = searchParams.get('proxy')

  // If proxy parameter is set, proxy the actual video
  if (proxy) {
    try {
      // Get the range header from the incoming request if present
      const range = request.headers.get('range')
      
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.imdb.com/',
        'Origin': 'https://www.imdb.com',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      }
      
      // Add range header if present
      if (range) {
        headers['Range'] = range
      }
      
      const videoResponse = await fetch(proxy, { headers })
      
      if (!videoResponse.ok) {
        console.error('Video fetch failed:', videoResponse.status, videoResponse.statusText)
        return NextResponse.json({ 
          error: 'Failed to fetch video', 
          status: videoResponse.status,
          statusText: videoResponse.statusText 
        }, { status: videoResponse.status })
      }

      // Get the video stream
      const videoBuffer = await videoResponse.arrayBuffer()
      
      // Build response headers
      const responseHeaders: Record<string, string> = {
        'Content-Type': videoResponse.headers.get('content-type') || 'video/mp4',
        'Access-Control-Allow-Origin': '*',
        'Accept-Ranges': 'bytes',
      }
      
      // Pass through content-length and content-range if present
      if (videoResponse.headers.get('content-length')) {
        responseHeaders['Content-Length'] = videoResponse.headers.get('content-length')!
      }
      if (videoResponse.headers.get('content-range')) {
        responseHeaders['Content-Range'] = videoResponse.headers.get('content-range')!
      }
      
      return new NextResponse(videoBuffer, {
        status: videoResponse.status,
        headers: responseHeaders
      })
    } catch (error) {
      console.error('Error proxying video:', error)
      return NextResponse.json({ error: 'Failed to proxy video', details: String(error) }, { status: 500 })
    }
  }

  if (!imdbId) {
    return NextResponse.json({ error: 'Missing imdbId' }, { status: 400 })
  }

  try {
    const imdbUrl = `https://www.imdb.com/title/${imdbId}`
    
    // Fetch the IMDB page
    const response = await fetch(imdbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch IMDB page' }, { status: response.status })
    }

    const html = await response.text()
    
    // Extract video source using regex to find the pattern
    // Looking for video sources in the HTML
    const videoRegex = /"url":"(https:\/\/imdb-video\.media-imdb\.com\/[^"]+)"/
    const match = html.match(videoRegex)
    
    if (match && match[1]) {
      // Keep the full URL including query parameters (they contain auth tokens)
      const videoUrl = match[1].replace(/\\u0026/g, '&')
      
      return NextResponse.json({ videoUrl })
    }

    // Alternative: look for video tag src in the HTML
    const videoTagRegex = /<video[^>]*src="([^"]+)"/
    const videoTagMatch = html.match(videoTagRegex)
    
    if (videoTagMatch && videoTagMatch[1]) {
      // Keep the full URL including query parameters (they contain auth tokens)
      const videoUrl = videoTagMatch[1]
      
      return NextResponse.json({ videoUrl })
    }

    return NextResponse.json({ error: 'No video found' }, { status: 404 })
  } catch (error) {
    console.error('Error scraping trailer:', error)
    return NextResponse.json({ error: 'Failed to scrape trailer' }, { status: 500 })
  }
}

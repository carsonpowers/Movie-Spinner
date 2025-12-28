export interface OMDBRating {
  Source: string
  Value: string
}

export interface OMDBMovieData {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: OMDBRating[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: string
}

export interface OMDBErrorResponse {
  Response: 'False'
  Error: string
}

export type OMDBResponse = OMDBMovieData | OMDBErrorResponse

export type Movie = {
  id: string
  tmdbId: number
  title: string
  year: string
  genres: string
  rating: number
  director: string
  duration: string
  poster: string
  plot: string
  status: string
  actors: string[]
  watchProviders?: string[]
}
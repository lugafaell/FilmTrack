export type Movie = {
  id: string
  title: string
  year: string
  genres: string
  rating: number
  director: string
  duration: string
  poster: string
  plot: string
  status: "watched" | "watchLater"
}
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import MovieCard from "../MovieCard/MovieCard"
import type { Movie } from "../../types/types"
import "./MovieGrid.css"

const SAMPLE_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Interestelar",
    year: "2014",
    genres: "Sci-Fi, Aventura",
    rating: 4.8,
    director: "Christopher Nolan",
    duration: "2h 49m",
  },
  {
    id: 2,
    title: "Pulp Fiction",
    year: "1994",
    genres: "Crime, Drama",
    rating: 4.7,
    director: "Quentin Tarantino",
    duration: "2h 34m",
  },
  {
    id: 3,
    title: "Parasita",
    year: "2019",
    genres: "Thriller, Drama",
    rating: 4.6,
    director: "Bong Joon-ho",
    duration: "2h 12m",
  },
  {
    id: 4,
    title: "Vingadores: Ultimato",
    year: "2019",
    genres: "Ação, Aventura",
    rating: 4.5,
    director: "Irmãos Russo",
    duration: "3h 1m",
  },
  {
    id: 5,
    title: "Clube da Luta",
    year: "1999",
    genres: "Drama, Thriller",
    rating: 4.8,
    director: "David Fincher",
    duration: "2h 19m",
  },
  {
    id: 6,
    title: "Matrix",
    year: "1999",
    genres: "Sci-Fi, Ação",
    rating: 4.7,
    director: "Irmãs Wachowski",
    duration: "2h 16m",
  },
]

const MovieGrid: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMovies(SAMPLE_MOVIES)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="movie-grid">
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} index={index} />
      ))}
    </div>
  )
}

export default MovieGrid

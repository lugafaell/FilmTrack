import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Movie } from "../types/types"

export type MovieCategory = "watched" | "watchLater"

interface MovieContextType {
  movies: Movie[]
  watchedMovies: Movie[]
  watchLaterMovies: Movie[]
  activeCategory: MovieCategory
  setActiveCategory: (category: MovieCategory) => void
  isLoading: boolean
  error: string | null
  refreshMovies: () => Promise<void>
  addMovie: (movie: Movie) => void
}

const MovieContext = createContext<MovieContextType | undefined>(undefined)

export const useMovies = () => {
  const context = useContext(MovieContext)
  if (!context) {
    throw new Error("useMovies must be used within a MovieProvider")
  }
  return context
}

interface MovieProviderProps {
  children: ReactNode
}

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([])
  const [watchLaterMovies, setWatchLaterMovies] = useState<Movie[]>([])
  const [activeCategory, setActiveCategory] = useState<MovieCategory>("watched")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const movies = activeCategory === "watched" ? watchedMovies : watchLaterMovies

  const fetchMovies = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado")
      }
      
      const response = await fetch("http://localhost:3000/api/v1/movies", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar filmes: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      const moviesArray = data.data.movies
      
      if (!Array.isArray(moviesArray)) {
        throw new Error("Formato de resposta inválido")
      }
      
      const watched = []
      const watchLater = []
      
      for (const movie of moviesArray) {
        const formattedMovie = {
          id: movie._id,
          title: movie.title,
          year: movie.releaseYear?.toString() || "",
          genres: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "",
          rating: movie.userRating || 0,
          director: movie.director || "",
          duration: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "",
          poster: movie.posterUrl || "",
          plot: movie.synopsis || "",
          status: movie.status
        }
        
        if (movie.status === "watched") {
          watched.push(formattedMovie)
        } else if (movie.status === "watchLater") {
          watchLater.push(formattedMovie)
        }
      }
      
      setWatchedMovies(watched)
      setWatchLaterMovies(watchLater)
    } catch (error) {
      console.error("Erro ao buscar filmes:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const addMovie = (movie: Movie) => {
    if (movie.status === "watched") {
      setWatchedMovies(prevMovies => [...prevMovies, movie])
    } else if (movie.status === "watchLater") {
      setWatchLaterMovies(prevMovies => [...prevMovies, movie])
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  return (
    <MovieContext.Provider value={{ 
      movies, 
      watchedMovies, 
      watchLaterMovies, 
      activeCategory, 
      setActiveCategory, 
      isLoading, 
      error, 
      refreshMovies: fetchMovies, 
      addMovie 
    }}>
      {children}
    </MovieContext.Provider>
  )
}

export default MovieContext
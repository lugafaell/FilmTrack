import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Movie } from "../types/types"

export type MovieCategory = "watched" | "watchLater"

const ACTIVE_CATEGORY_KEY = "activeMovieCategory"

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
  updateMovie: (updatedMovie: Movie) => Promise<void>
  deleteMovie: (movieId: string) => Promise<void>
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
  const [activeCategory, setActiveCategory] = useState<MovieCategory>(() => {
    const savedCategory = localStorage.getItem(ACTIVE_CATEGORY_KEY) as MovieCategory | null
    return (savedCategory === "watched" || savedCategory === "watchLater") ? savedCategory : "watched"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const movies = activeCategory === "watched" ? watchedMovies : watchLaterMovies

  useEffect(() => {
    localStorage.setItem(ACTIVE_CATEGORY_KEY, activeCategory)
  }, [activeCategory])

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
        let actors: string[] = [];
        if (movie.mainCast) {
          if (Array.isArray(movie.mainCast)) {
            actors = movie.mainCast;
          } else if (typeof movie.mainCast === 'string') {
            actors = (movie.mainCast as string).split(',').map(actor => actor.trim());
          }
        }
        
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
          status: movie.status,
          actors: actors
        }
        
        if (movie.status === "watched") {
          watched.push(formattedMovie)
        } else if (movie.status === "watchLater") {
          watchLater.push(formattedMovie)
        }
      }
      
      setWatchedMovies(watched)
      setWatchLaterMovies(watchLater)
      setInitialLoadDone(true)
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

  const updateMovie = async (updatedMovie: Movie) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado")
      }
      
      let actorsArray: string[] = [];
      
      if (Array.isArray(updatedMovie.actors)) {
        actorsArray = updatedMovie.actors;
      } else if (typeof updatedMovie.actors === 'string') {
        actorsArray = (updatedMovie.actors as string).split(',').map(actor => actor.trim());
      }
      
      const movieData = {
        title: updatedMovie.title,
        releaseYear: parseInt(updatedMovie.year),
        genre: updatedMovie.genres.split(", "),
        userRating: updatedMovie.rating,
        director: updatedMovie.director,
        duration: parseInt(updatedMovie.duration.replace(/\D/g, "")),
        posterUrl: updatedMovie.poster,
        synopsis: updatedMovie.plot,
        status: updatedMovie.status,
        mainCast: actorsArray
      }

      console.log("Dados sendo enviados para o backend:", movieData);
      
      const response = await fetch(`http://localhost:3000/api/v1/movies/${updatedMovie.id}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(movieData)
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar filme: ${response.statusText}`)
      }
      
      if (updatedMovie.status === "watched") {
        setWatchedMovies(prevMovies => {
          const exists = prevMovies.some(movie => movie.id === updatedMovie.id)
          
          return exists 
            ? prevMovies.map(movie => movie.id === updatedMovie.id ? updatedMovie : movie)
            : [...prevMovies, updatedMovie]
        })
        
        setWatchLaterMovies(prevMovies => 
          prevMovies.filter(movie => movie.id !== updatedMovie.id)
        )
      } else if (updatedMovie.status === "watchLater") {
        setWatchLaterMovies(prevMovies => {
          const exists = prevMovies.some(movie => movie.id === updatedMovie.id)
          
          return exists 
            ? prevMovies.map(movie => movie.id === updatedMovie.id ? updatedMovie : movie)
            : [...prevMovies, updatedMovie]
        })
        
        setWatchedMovies(prevMovies => 
          prevMovies.filter(movie => movie.id !== updatedMovie.id)
        )
      }
    } catch (error) {
      console.error("Erro ao atualizar filme:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      throw error
    }
  }

  const deleteMovie = async (movieId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado")
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir filme: ${response.statusText}`)
      }
      
      setWatchedMovies(prevMovies => 
        prevMovies.filter(movie => movie.id !== movieId)
      )
      
      setWatchLaterMovies(prevMovies => 
        prevMovies.filter(movie => movie.id !== movieId)
      )
    } catch (error) {
      console.error("Erro ao excluir filme:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      throw error
    }
  }

  useEffect(() => {
    if (!initialLoadDone) {
      fetchMovies()
    }
  }, [initialLoadDone])

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
      addMovie,
      updateMovie,
      deleteMovie
    }}>
      {children}
    </MovieContext.Provider>
  )
}
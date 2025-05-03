import type React from "react"
import { useState, useEffect } from "react"
import MovieCard from "../MovieCard/MovieCard"
import { MovieModal } from "../MovieModal/MovieModal"
import { useMovies } from "../../context/MovieContext"
import type { Movie } from "../../types/types"
import "./MovieGrid.css"

const MovieGrid: React.FC = () => {
  const { 
    movies, 
    isLoading, 
    error, 
    activeCategory, 
    updateMovie,
    deleteMovie 
  } = useMovies()
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setSelectedMovie(null)
    }
  }

  useEffect(() => {
    setSelectedMovie(null)
    setIsModalOpen(false)
  }, [activeCategory])

  const handleCardClick = (movie: Movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const handleStatusChange = async (status: string) => {
    if (selectedMovie) {
      try {
        const updatedMovie = { 
          ...selectedMovie, 
          status: status as "watched" | "watchLater" 
        }
        await updateMovie(updatedMovie)
        setSelectedMovie(updatedMovie)
      } catch (error) {
        console.error("Erro ao atualizar status:", error)
      }
    }
  }

  const handleRatingChange = async (rating: number) => {
    if (selectedMovie) {
      try {
        const updatedMovie = { 
          ...selectedMovie, 
          rating,
          genres: selectedMovie.genres || "",
          director: selectedMovie.director || "",
          duration: selectedMovie.duration || "",
          plot: selectedMovie.plot || "",
          year: selectedMovie.year || "",
          actors: selectedMovie.actors || []
        }
        await updateMovie(updatedMovie)
        setSelectedMovie(updatedMovie)
      } catch (error) {
        console.error("Erro ao atualizar avaliação:", error)
      }
    }
  }

  const handleDeleteMovie = async () => {
    if (selectedMovie) {
      try {
        await deleteMovie(selectedMovie.id)
        handleModalOpenChange(false)
      } catch (error) {
        console.error("Erro ao excluir filme:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="movie-grid-loading">
        <div className="loading-spinner"></div>
        <p>Carregando filmes...</p>
      </div>
    )
  }
 
  if (error) {
    return (
      <div className="movie-grid-error">
        <p>Erro ao carregar filmes: {error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    )
  }
 
  if (movies.length === 0) {
    return (
      <div className="movie-grid-empty">
        <p>
          {activeCategory === "watched" 
            ? "Você ainda não tem filmes assistidos." 
            : "Você ainda não adicionou filmes para assistir depois."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="movie-grid">
        {movies.map((movie, index) => (
          <MovieCard 
            key={movie.id || `${movie.title}-${movie.year}-${index}`} 
            movie={movie} 
            index={index}
            onClick={() => handleCardClick(movie)}
          />
        ))}
      </div>

      {selectedMovie && (
        <MovieModal
          open={isModalOpen}
          onOpenChange={handleModalOpenChange}
          movie={selectedMovie}
          onStatusChange={handleStatusChange}
          onRatingChange={handleRatingChange}
          onDelete={handleDeleteMovie}
        />
      )}
    </>
  )
}

export default MovieGrid
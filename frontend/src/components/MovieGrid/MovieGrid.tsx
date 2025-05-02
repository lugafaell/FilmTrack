import type React from "react"
import MovieCard from "../MovieCard/MovieCard"
import { useMovies } from "../../context/MovieContext"
import "./MovieGrid.css"

const MovieGrid: React.FC = () => {
  const { movies, isLoading, error, activeCategory } = useMovies()

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
    <div className="movie-grid">
      {movies.map((movie, index) => {
        const uniqueKey = movie.id || `${movie.title}-${movie.year}-${index}`;
        
        return (
          <MovieCard 
            key={uniqueKey} 
            movie={movie} 
            index={index} 
          />
        );
      })}
    </div>
  )
}

export default MovieGrid
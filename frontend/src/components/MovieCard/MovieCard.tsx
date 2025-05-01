"use client"

import type React from "react"
import { useState } from "react"
import type { Movie } from "../../types/types"
import "./MovieCard.css"

interface MovieCardProps {
  movie: Movie
  index: number
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  const cardStyle = {
    animationDelay: `${index * 0.1}s`,
    animationFillMode: "both" as const,
  }

  return (
    <div
      className={`movie-card animate-fade-up ${isHovered ? "hovered" : ""}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="movie-poster">
        <img src={`/placeholder.svg?height=300&width=200&text=Filme%20${movie.id}`} alt={`Filme ${movie.id}`} />
        <div className="movie-rating">★ {movie.rating.toFixed(1)}</div>
        <div className="movie-overlay">
          <p className="movie-director">Diretor: {movie.director}</p>
          <p className="movie-duration">Duração: {movie.duration}</p>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-meta">
          {movie.year} • {movie.genres}
        </p>
      </div>
    </div>
  )
}

export default MovieCard

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "./MovieAddModal.css"

type MovieAdd = {
  id: string
  title: string
  year: string
  poster: string
  plot: string
  director: string
  actors: string
}

type MovieModalProps = {
  isOpen: boolean
  onClose: () => void
}

const sampleMovies: MovieAdd[] = [
  {
    id: "1",
    title: "Interestelar",
    year: "2014",
    poster: "/placeholder.svg?height=450&width=300",
    plot: "Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.",
    director: "Christopher Nolan",
    actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
  },
  {
    id: "2",
    title: "A Origem",
    year: "2010",
    poster: "/placeholder.svg?height=450&width=300",
    plot: "Um ladrão que rouba segredos corporativos através do uso da tecnologia de compartilhamento de sonhos, recebe a tarefa inversa de plantar uma ideia na mente de um CEO.",
    director: "Christopher Nolan",
    actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
  },
  {
    id: "3",
    title: "Pulp Fiction",
    year: "1994",
    poster: "/placeholder.svg?height=450&width=300",
    plot: "As vidas de dois assassinos da máfia, um boxeador, um gângster e sua esposa, e um par de bandidos se entrelaçam em quatro histórias de violência e redenção.",
    director: "Quentin Tarantino",
    actors: "John Travolta, Uma Thurman, Samuel L. Jackson",
  },
]

export const MovieModal: React.FC<MovieModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<MovieAdd | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [searchResults, setSearchResults] = useState<MovieAdd[]>([])

  const searchMovies = (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    const results = sampleMovies.filter((movie) => movie.title.toLowerCase().includes(term.toLowerCase()))
    setSearchResults(results)
  }

  const selectMovie = (movie: MovieAdd) => {
    setSelectedMovie(movie)
    setSearchResults([])
    setSearchTerm("")
    setRating(0)
  }

  const clearSelection = () => {
    setSelectedMovie(null)
    setRating(0)
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {selectedMovie ? `${selectedMovie.title} (${selectedMovie.year})` : "Buscar Filmes"}
          </h2>
          <button className="close-button" onClick={onClose} aria-label="Fechar">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {!selectedMovie ? (
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Digite o nome do filme..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    searchMovies(e.target.value)
                  }}
                />
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((movie) => (
                    <div key={movie.id} className="movie-result" onClick={() => selectMovie(movie)}>
                      <div className="movie-poster-small">
                        <img src={movie.poster || "/placeholder.svg"} alt={movie.title} />
                      </div>
                      <div className="movie-info-small">
                        <h3>{movie.title}</h3>
                        <p>{movie.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="movie-details">
              <div className="movie-content">
                <div className="movie-poster-add">
                  <img src={selectedMovie.poster || "/placeholder.svg"} alt={selectedMovie.title} />
                </div>

                <div className="movie-info">
                  <div className="info-section">
                    <h3>Sinopse</h3>
                    <p>{selectedMovie.plot}</p>
                  </div>

                  <div className="info-section">
                    <h3>Diretor</h3>
                    <p>{selectedMovie.director}</p>
                  </div>

                  <div className="info-section">
                    <h3>Elenco</h3>
                    <p>{selectedMovie.actors}</p>
                  </div>

                  <div className="info-section">
                    <h3>Sua Avaliação</h3>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`star ${star <= (hoveredRating || rating) ? "star-active" : ""}`}
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill={star <= (hoveredRating || rating) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="back-button" onClick={clearSelection}>
                  Voltar à Pesquisa
                </button>
                <button
                  className={`submit-button-add ${rating === 0 ? "disabled" : ""}`}
                  disabled={rating === 0}
                  onClick={() => {
                    alert(`Filme "${selectedMovie.title}" avaliado com ${rating} estrelas!`)
                    onClose()
                  }}
                >
                  Enviar Avaliação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieModal
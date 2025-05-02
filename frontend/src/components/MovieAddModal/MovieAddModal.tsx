import type React from "react"
import { useState, useEffect } from "react"
import { useMovies } from "../../context/MovieContext"
import "./MovieAddModal.css"
import type { Movie } from "../../types/types"

type TMDBMovie = {
  id: number
  title: string
  release_date: string
  poster_path: string
  overview: string
  runtime?: number
  genres?: {id: number, name: string}[]
}

type MovieStatus = "watched" | "watchLater"

type MovieModalProps = {
  isOpen: boolean
  onClose: () => void
}

const TMDB_API_KEY = "eb3a615de058de72b7f8729e24fff693"
const TMDB_API_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500"

export const MovieModal: React.FC<MovieModalProps> = ({ isOpen, onClose }) => {
  const { addMovie } = useMovies()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<{
    id: string
    title: string
    year: string
    poster: string
    plot: string
    director: string
    actors: string[]
    runtime?: number
    genres?: string[]
  } | null>(null)
  const [rating, setRating] = useState(0)
  const [numericRating, setNumericRating] = useState<string>("")
  const [status, setStatus] = useState<MovieStatus>("watched")
  const [review, setReview] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<any>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const searchMovies = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&language=pt-BR&include_adult=false`
      )
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Erro ao buscar filmes:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMovieDetails = async (movieId: number) => {
    try {
      const [movieResponse, creditsResponse] = await Promise.all([
        fetch(`${TMDB_API_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`),
        fetch(`${TMDB_API_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`)
      ])
      
      const movieData = await movieResponse.json()
      const creditsData = await creditsResponse.json()
      
      const director = creditsData.crew.find((person: { job: string }) => person.job === "Director")?.name || "Não informado"
      
      const actorsArray = creditsData.cast
        .slice(0, 3)
        .map((actor: { name: string }) => actor.name) || ["Não informado"]
      
      setSelectedMovieDetails({ ...movieData, director, actors: actorsArray })
      
      const formattedMovie = {
        id: movieId.toString(),
        title: movieData.title,
        year: movieData.release_date ? movieData.release_date.substring(0, 4) : "",
        poster: movieData.poster_path ? `${TMDB_IMAGE_URL}${movieData.poster_path}` : "/placeholder.svg?height=450&width=300",
        plot: movieData.overview || "Sinopse não disponível",
        director,
        actors: actorsArray,
        runtime: movieData.runtime || 0,
        genres: movieData.genres?.map((genre: { name: string }) => genre.name) || []
      }
      
      setSelectedMovie(formattedMovie)
    } catch (error) {
      console.error("Erro ao buscar detalhes do filme:", error)
    }
  }

  const selectMovie = (movie: TMDBMovie) => {
    fetchMovieDetails(movie.id)
    setSearchResults([])
    setSearchTerm("")
    setRating(0)
    setNumericRating("")
    setReview("")
    setErrorMessage(null)
  }

  const clearSelection = () => {
    setSelectedMovie(null)
    setSelectedMovieDetails(null)
    setRating(0)
    setNumericRating("")
    setReview("")
    setStatus("watched")
    setErrorMessage(null)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        searchMovies(value)
      } else {
        setSearchResults([])
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const handleNumericRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^(\d*\.?\d{0,1})?$/.test(value) && parseFloat(value || "0") <= 5) {
      setNumericRating(value)
      
      const numericValue = parseFloat(value || "0")
      setRating(numericValue > 0 ? Math.round(numericValue) : 0)
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as MovieStatus)
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

  useEffect(() => {
    if (status === "watchLater") {
      setRating(0)
      setNumericRating("")
      setReview("")
    }
  }, [status])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!selectedMovie) return;
    
    setSubmitLoading(true);
    setErrorMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }
      
      let releaseYear = parseInt(selectedMovie.year);
      if (isNaN(releaseYear)) {
        releaseYear = 0;
      }
      
      const duration = selectedMovie.runtime || 0;
      
      const genres = Array.isArray(selectedMovie.genres) ? selectedMovie.genres : [];
      
      let mainCast: string[] = [];
      if (Array.isArray(selectedMovie.actors)) {
        mainCast = selectedMovie.actors;
      } else if (typeof selectedMovie.actors === 'string') {
        mainCast = (selectedMovie.actors as string).split(', ').filter(actor => actor.trim());
      }
      
      const userRating = status === "watched" 
        ? parseFloat(numericRating || "0") 
        : 0;
      
      const movieData = {
        title: selectedMovie.title,
        releaseYear: releaseYear,
        synopsis: selectedMovie.plot,
        duration: duration,
        posterUrl: selectedMovie.poster,
        genre: genres,
        director: selectedMovie.director,
        mainCast: mainCast,
        status: status,
        userRating: userRating
      };
      
      const response = await fetch("http://localhost:3000/api/v1/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(movieData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erro ao adicionar filme: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      const newMovieId = result.data._id || `temp-${Date.now()}`;
      
      const newMovie: Movie = {
        id: newMovieId,
        title: selectedMovie.title,
        year: selectedMovie.year,
        genres: Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(", ") : "",
        rating: userRating,
        director: selectedMovie.director,
        duration: selectedMovie.runtime ? `${Math.floor(selectedMovie.runtime / 60)}h ${selectedMovie.runtime % 60}m` : "",
        poster: selectedMovie.poster,
        plot: selectedMovie.plot,
        status: status,
        actors: mainCast
      };
      
      addMovie(newMovie);
      
      onClose();
    } catch (error) {
      console.error("Erro ao salvar o filme:", error);
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido ao adicionar o filme");
    } finally {
      setSubmitLoading(false);
    }
  };

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
                  onChange={handleSearchInputChange}
                />
              </div>

              {isLoading && (
                <div className="loading-indicator">
                  <p>Buscando filmes...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((movie) => (
                    <div key={movie.id} className="movie-result" onClick={() => selectMovie(movie)}>
                      <div className="movie-poster-small">
                        <img 
                          src={movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : "/placeholder.svg"} 
                          alt={movie.title} 
                        />
                      </div>
                      <div className="movie-info-small">
                        <h3>{movie.title}</h3>
                        <p>{movie.release_date ? movie.release_date.substring(0, 4) : "Ano desconhecido"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && searchTerm && searchResults.length === 0 && (
                <div className="no-results">
                  <p>Nenhum filme encontrado para "{searchTerm}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="movie-details">
              <div className="movie-content">
                <div className="movie-poster-add">
                  <img src={selectedMovie.poster} alt={selectedMovie.title} />
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
                    <p>{Array.isArray(selectedMovie.actors) ? selectedMovie.actors.join(', ') : selectedMovie.actors}</p>
                  </div>

                  <div className="info-section status-section">
                    <h3>Status</h3>
                    <select 
                      value={status} 
                      onChange={handleStatusChange}
                      className="status-select"
                    >
                      <option value="watched">Assistido</option>
                      <option value="watchLater">Assistir depois</option>
                    </select>
                  </div>

                  {status === "watched" && (
                    <>
                      <div className="info-section">
                        <h3>Sua Avaliação</h3>
                        <div className="rating-container">
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
                                onClick={() => {
                                  setRating(star)
                                  setNumericRating(star.toString())
                                }}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            ))}
                          </div>
                          <div className="numeric-rating">
                            <input 
                              type="text"
                              placeholder="0.0 - 5.0"
                              value={numericRating}
                              onChange={handleNumericRatingChange}
                              className="numeric-rating-input"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {errorMessage && (
                    <div className="error-message">
                      <p>{errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button className="back-button" onClick={clearSelection}>
                  Voltar à Pesquisa
                </button>
                <button
                  className={`submit-button-add ${submitLoading ? "loading" : ""} ${
                    status === "watched" && parseFloat(numericRating || "0") === 0 ? "disabled" : ""
                  }`}
                  disabled={submitLoading || (status === "watched" && parseFloat(numericRating || "0") === 0)}
                  onClick={handleSubmit}
                >
                  {submitLoading ? "Adicionando..." : "Adicionar Filme"}
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
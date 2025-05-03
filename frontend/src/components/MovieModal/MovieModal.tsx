import type React from "react"
import { useState, useEffect } from "react"
import "./MovieModal.css"

interface MovieModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    movie: {
      id: string
      title: string
      year: string
      poster: string
      plot: string
      director: string
      actors?: string[]
      status: "watched" | "watchLater" 
      rating: number
      genres: string
      duration: string
    }
    onStatusChange: (status: string) => void
    onRatingChange: (rating: number) => void
    onDelete: () => void
  }
export function MovieModal({ open, onOpenChange, movie, onStatusChange, onRatingChange, onDelete }: MovieModalProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [currentRating, setCurrentRating] = useState<number>(movie.rating)
  const [currentStatus, setCurrentStatus] = useState<string>(movie.status)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isSavingRating, setIsSavingRating] = useState(false)

  useEffect(() => {
    setCurrentRating(movie.rating)
    setCurrentStatus(movie.status)
  }, [movie])

  if (!open) return null

  const handleRatingChange = (newRating: number, precise?: boolean) => {
    let finalRating: number;
  
    if (precise) {
      finalRating = newRating;
    } else {
      if (Math.abs(currentRating - newRating) < 0.1) {
        finalRating = Math.max(newRating - 0.5, 0);
      } else if (Math.abs(currentRating - (newRating - 0.5)) < 0.1) {
        finalRating = Math.floor(newRating);
      } else {
        finalRating = newRating;
      }
    }
  
    setCurrentRating(finalRating);
    
    if (!isEditingRating) {
      onRatingChange(finalRating);
    }
  }

  const saveStatusChanges = async () => {
    if (isSavingStatus) return;
    
    try {
      setIsSavingStatus(true);
      await onStatusChange(currentStatus);
      setIsEditingStatus(false);
    } catch (error) {
      console.error("Erro ao salvar alterações de status:", error);
    } finally {
      setIsSavingStatus(false);
    }
  }
  
  const saveRatingChanges = async () => {
    if (isSavingRating) return;
    
    try {
      setIsSavingRating(true);
      await onRatingChange(currentRating);
      setIsEditingRating(false);
    } catch (error) {
      console.error("Erro ao salvar alterações de avaliação:", error);
    } finally {
      setIsSavingRating(false);
    }
  }
  
  const handleCloseModal = () => {
    if (isSavingStatus || isSavingRating) return;
  
    if (isEditingStatus) {
      setCurrentStatus(movie.status);
      setIsEditingStatus(false);
    }
    
    if (isEditingRating) {
      setCurrentRating(movie.rating);
      setIsEditingRating(false);
    }
    
    onOpenChange(false);
  }

  const handleStatusSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setCurrentStatus(newStatus)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleRatingChange(Number.parseFloat(e.target.value), true)
  }

  const handleStarMouseMove = (e: React.MouseEvent<HTMLButtonElement>, star: number) => {
    if (!isEditingRating) return
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const x = e.clientX - rect.left
    const percent = x / width
    const partial = Math.max(0.1, Math.min(1, percent))
    const value = star - 1 + partial
    setHoverRating(value)
  }

  return (
    <>
      <div className="modal-movie-overlay" onClick={handleCloseModal}>
        <div className="modal-movie-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-movie-header">
            <h2 className="modal-movie-title">
              <svg className="movie-movie-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5l6-4.5-6-4.5z" />
              </svg>
              {movie.title} ({movie.year})
            </h2>
            <button className="close-movie-button" onClick={handleCloseModal}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
              <span className="sr-movie-only">Fechar</span>
            </button>
          </div>

          <div className="modal-movie-body">
            <div className="poster-movie-container">
              <img
                src={movie.poster || "/placeholder.svg"}
                alt={`Poster do filme ${movie.title}`}
                className="movie-movie-poster"
              />
              <div className="poster-movie-overlay"></div>
            </div>

            <div className="content-movie-container">
              <div className="info-movie-section">
                <h3 className="section-movie-title">
                  <span className="title-movie-indicator"></span>
                  Sinopse
                </h3>
                <p>{movie.plot}</p>
              </div>

              <div className="info-movie-section">
                <h3 className="section-movie-title">
                  <span className="title-movie-indicator"></span>
                  Diretor
                </h3>
                <p>{movie.director}</p>
              </div>

              <div className="info-movie-section">
                <h3 className="section-movie-title">
                  <span className="title-movie-indicator"></span>
                  Elenco
                </h3>
                <p>{movie.actors && Array.isArray(movie.actors) ? movie.actors.join(", ") : "Informação não disponível"}</p>
              </div>

              <div className="info-movie-grid">
                <div className="info-movie-section">
                  <div className="section-movie-header">
                    <h3 className="section-movie-title">
                      <span className="title-movie-indicator"></span>
                      Status
                    </h3>
                    {!isEditingStatus && (
                      <button className="edit-movie-button" onClick={() => setIsEditingStatus(true)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <select
                    className="status-movie-select"
                    value={currentStatus}
                    onChange={handleStatusSelectChange}
                    disabled={!isEditingStatus}
                  >
                    <option value="watched">Assistido</option>
                    <option value="watchLater">Assistir mais tarde</option>
                  </select>
                  
                  {isEditingStatus && (
                    <div className="button-movie-container status-actions">
                      <button 
                        className="cancel-movie-button" 
                        onClick={() => {
                          setCurrentStatus(movie.status);
                          setIsEditingStatus(false);
                        }}
                        disabled={isSavingStatus}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="save-movie-button" 
                        onClick={saveStatusChanges}
                        disabled={isSavingStatus}
                      >
                        {isSavingStatus ? "Salvando..." : "Salvar Status"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-movie-section">
                  <div className="section-movie-header">
                    <h3 className="section-movie-title">
                      <span className="title-movie-indicator"></span>
                      Sua Avaliação
                    </h3>
                    {!isEditingRating && (
                      <button className="edit-movie-button" onClick={() => setIsEditingRating(true)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="rating-movie-container">
                    <div className="stars-movie-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="star-movie-wrapper">
                          <button
                            disabled={!isEditingRating}
                            onClick={() => handleRatingChange(star)}
                            onMouseMove={(e) => handleStarMouseMove(e, star)}
                            onMouseLeave={() => isEditingRating && setHoverRating(0)}
                            className="star-movie-button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="star-outline"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>

                            <div
                              className="star-movie-fill-container"
                              style={{
                                width: `${
                                  (hoverRating
                                    ? Math.max(0, Math.min(1, hoverRating - (star - 1)))
                                    : Math.max(0, Math.min(1, currentRating - (star - 1)))) * 100
                                }%`,
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="#FFEB3B"
                                stroke="#FFEB3B"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="star-fill"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="rating-movie-value">{currentRating.toFixed(1)}</div>
                  </div>
                  {isEditingRating && (
                    <>
                      <div className="slider-movie-container">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={currentRating}
                          onChange={handleSliderChange}
                          className="rating-movie-slider"
                        />
                      </div>
                      <div className="button-movie-container rating-actions">
                        <button 
                          className="cancel-movie-button" 
                          onClick={() => {
                            setCurrentRating(movie.rating);
                            setIsEditingRating(false);
                          }}
                          disabled={isSavingRating}
                        >
                          Cancelar
                        </button>
                        <button 
                          className="save-movie-button" 
                          onClick={saveRatingChanges}
                          disabled={isSavingRating}
                        >
                          {isSavingRating ? "Salvando..." : "Salvar Avaliação"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-movie-footer">
            <div className="button-movie-container">
              <button 
                className="delete-movie-button" 
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSavingStatus || isSavingRating}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Excluir Filme
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="alert-movie-overlay">
          <div className="alert-movie-dialog">
            <div className="alert-movie-header">
              <h3 className="alert-movie-title">Tem certeza?</h3>
              <p className="alert-movie-description">
                Esta ação não pode ser desfeita. Isso removerá o filme "{movie.title}" da sua lista.
              </p>
            </div>
            <div className="alert-movie-footer">
              <button className="cancel-movie-button" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </button>
              <button
                className="confirm-movie-button"
                onClick={() => {
                  onDelete()
                  setDeleteDialogOpen(false)
                  onOpenChange(false)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
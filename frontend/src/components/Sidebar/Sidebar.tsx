import type React from "react"
import "./Sidebar.css"
import { useMovies, MovieCategory } from "../../context/MovieContext"
import { useMemo } from "react"

const Sidebar: React.FC = () => {
  const { 
    watchedMovies, 
    activeCategory, 
    setActiveCategory 
  } = useMovies()

  const statistics = useMemo(() => {
    const totalMovies = watchedMovies.length

    const genreCounts: Record<string, number> = {}
    
    watchedMovies.forEach(movie => {
      const genres = movie.genres.split(", ")
      genres.forEach(genre => {
        if (genre.trim()) {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1
        }
      })
    })
    
    let favoriteGenre = "Nenhum"
    let maxCount = 0
    
    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count
        favoriteGenre = genre
      }
    })

    const totalMinutes = watchedMovies.reduce((total, movie) => {
      if (!movie.duration) return total
      
      const match = movie.duration.match(/(\d+)h\s*(\d+)m/)
      
      if (match) {
        const hours = parseInt(match[1], 10) || 0
        const minutes = parseInt(match[2], 10) || 0
        return total + (hours * 60 + minutes)
      }
      
      return total
    }, 0)
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const watchTime = `${hours}h ${minutes}m`

    return {
      totalMovies,
      favoriteGenre,
      watchTime
    }
  }, [watchedMovies])

  const handleCategoryChange = (category: MovieCategory) => {
    setActiveCategory(category)
  }

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <button 
          className={`nav-button ${activeCategory === "watched" ? "active" : ""}`}
          onClick={() => handleCategoryChange("watched")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2z"></path>
            <rect x="7" y="7" width="3" height="10"></rect>
            <rect x="14" y="7" width="3" height="10"></rect>
          </svg>
          Filmes Assistidos
        </button>
        <button 
          className={`nav-button ${activeCategory === "watchLater" ? "active" : ""}`}
          onClick={() => handleCategoryChange("watchLater")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Assistir Depois
        </button>
        <button className="nav-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Estatísticas
        </button>
      </nav>

      <div className="stats-panel">
        <h3 className="stats-title">Estatísticas Rápidas</h3>
        <div className="stats-list">
          <div className="stats-item">
            <span>Total de filmes:</span>
            <span className="stats-value">{statistics.totalMovies}</span>
          </div>
          <div className="stats-item">
            <span>Gênero favorito:</span>
            <span className="stats-value">{statistics.favoriteGenre}</span>
          </div>
          <div className="stats-item">
            <span>Tempo assistido:</span>
            <span className="stats-value">{statistics.watchTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
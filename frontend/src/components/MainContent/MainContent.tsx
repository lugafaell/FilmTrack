import type React from "react"
import { useState } from "react"
import MovieGrid from "../MovieGrid/MovieGrid"
import MovieModal from "../MovieAddModal/MovieAddModal"
import "./MainContent.css"

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="main-content">
      <div className="content-header">
        <h2 className="content-title animate-float">
          Meus Filmes
          <svg
            className="sparkle-icon"
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
            <path d="M12 3v3m0 12v3m-9-9H6m12 0h3m-2.646-6.364l-2.121 2.121m-7.072 7.072l-2.121 2.121m0-11.314l2.121 2.121m7.072 7.072l2.121 2.121"></path>
          </svg>
        </h2>
        <button className="add-button animate-pulse-subtle" onClick={openModal}>
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Adicionar Filme
        </button>
      </div>
      <div className="search-filter">
        <div className="search-container">
          <svg
            className="search-icon"
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" className="search-input" placeholder="Buscar filmes..." />
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            Todos
          </button>
          <button
            className={`tab ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            Favoritos
          </button>
        </div>
      </div>
      <MovieGrid />

      {isModalOpen && <MovieModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  )
}

export default MainContent
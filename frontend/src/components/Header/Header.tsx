import type React from "react"
import { useNavigate } from 'react-router-dom'
import "./Header.css"

const Header: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
   }

  return (
    <header className="header animate-fade-down">
      <div className="header-container">
        <h1 className="logo">
          FilmTrack
          <span className="logo-underline"></span>
        </h1>

        <div className="header-actions">
          <button className="logout-button" onClick={handleLogout}>
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sair
          </button>

          <div className="avatar">
            <img src="/placeholder.svg?height=40&width=40" alt="Avatar do usuário" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

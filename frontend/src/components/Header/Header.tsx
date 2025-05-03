import type React from "react"
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import "./Header.css"

interface HeaderProps {
  onUserProfileClick: () => void
}

const getRandomColor = () => {
  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
    '#F97316',
    '#06B6D4'
  ];
 
  return colors[Math.floor(Math.random() * colors.length)];
}

const Header: React.FC<HeaderProps> = ({ onUserProfileClick }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [userInitial, setUserInitial] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData.name && userData.name.length > 0) {
          setUserInitial(userData.name.charAt(0).toUpperCase());
          setAvatarColor(getRandomColor());
        }
      } catch (error) {
        console.error('Erro ao analisar dados do usuário:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
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
          <div
            className="avatar"
            onClick={onUserProfileClick}
            style={{
              cursor: 'pointer',
              backgroundColor: avatarColor,
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
          >
            {userInitial || '?'}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
import type React from "react"
import { useState } from "react"
import Header from "../../components/Header/Header"
import Sidebar from "../../components/Sidebar/Sidebar"
import MainContent from "../../components/MainContent/MainContent"
import { UserSidebar } from "../../components/UserSidebar/UserSidebar"
import { MovieProvider } from "../../context/MovieContext"
import "./HomePage.css"

const HomePage: React.FC = () => {
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false)

  const toggleUserSidebar = () => {
    setIsUserSidebarOpen(!isUserSidebarOpen)
  }

  const closeUserSidebar = () => {
    setIsUserSidebarOpen(false)
  }

  return (
    <MovieProvider>
      <div className="app">
        <Header onUserProfileClick={toggleUserSidebar} />
        <main className="main-container">
          <div className="main-grid">
            <Sidebar />
            <MainContent />
          </div>
        </main>
        
        <UserSidebar 
          isControlled={true} 
          isOpenExternal={isUserSidebarOpen} 
          onCloseExternal={closeUserSidebar} 
        />
      </div>
    </MovieProvider>
  )
}

export default HomePage
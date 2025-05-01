import type React from "react"
import Header from "../../components/Header/Header"
import Sidebar from "../../components/Sidebar/Sidebar"
import MainContent from "../../components/MainContent/MainContent"
import "./HomePage.css"

const HomePage: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-container">
        <div className="main-grid">
          <Sidebar />
          <MainContent />
        </div>
      </main>
    </div>
  )
}

export default HomePage
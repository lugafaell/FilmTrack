import type React from "react"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Header from "../../components/Header/Header"
import Sidebar from "../../components/Sidebar/Sidebar"
import MainContent from "../../components/MainContent/MainContent"
import { UserSidebar } from "../../components/UserSidebar/UserSidebar"
import NotificationModal from "../../components/NotificationModal/NotificationModal"
import { MovieProvider } from "../../context/MovieContext"
import "./HomePage.css"

interface Notification {
  _id: string
  title: string
  message: string
  createdAt: string
  image?: string
  type: string
  isRead: boolean
  metadata?: {
    director?: string
    platform?: string
  }
}

const HomePage: React.FC = () => {
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchNotifications = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < 60000) {
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:3000/api/v1/notification', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.unreadCount || 
        response.data.data.notifications.filter((n: { isRead: any }) => !n.isRead).length);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  }, [lastFetchTime]);

  useEffect(() => {
    if (isNotificationModalOpen) {
      fetchNotifications(true);
    }
  }, [isNotificationModalOpen, fetchNotifications]);

  const toggleUserSidebar = () => {
    setIsUserSidebarOpen(!isUserSidebarOpen)
  }

  const closeUserSidebar = () => {
    setIsUserSidebarOpen(false)
  }

  const toggleNotificationModal = () => {
    setIsNotificationModalOpen(!isNotificationModalOpen)
  }

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false)
  }

  const handleNotificationsUpdate = (newUnreadCount: number) => {
    setUnreadCount(newUnreadCount);
  }

  return (
    <MovieProvider>
      <div className="app">
        <Header 
          onUserProfileClick={toggleUserSidebar} 
          onNotificationClick={toggleNotificationModal}
        />
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
        
        <NotificationModal
          isControlled={true}
          isOpenExternal={isNotificationModalOpen}
          onCloseExternal={closeNotificationModal}
          onToggleExternal={toggleNotificationModal}
          newNotificationsCount={unreadCount}
          onNotificationsUpdate={handleNotificationsUpdate}
          forceRefresh={fetchNotifications}
          renderButton={false}
        />
      </div>
    </MovieProvider>
  )
}

export default HomePage
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
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
  const pollingIntervalRef = useRef<number | null>(null)

  const fetchNotifications = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < 10000) {
      return notifications;
    }
    
    try {
      const response = await axios.get('http://localhost:3000/api/v1/notification', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const fetchedNotifications = response.data.data.notifications;
      const newUnreadCount = response.data.unreadCount || 
        fetchedNotifications.filter((n: { isRead: any }) => !n.isRead).length;
      
      setNotifications(fetchedNotifications);
      setUnreadCount(newUnreadCount);
      setLastFetchTime(now);
      
      return fetchedNotifications;
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      return notifications;
    }
  }, [lastFetchTime, notifications]);

  useEffect(() => {
    fetchNotifications(true);

    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

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
    if (!isNotificationModalOpen) {
      fetchNotifications(true);
    }
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
          externalNotifications={notifications}
        />
      </div>
    </MovieProvider>
  )
}

export default HomePage
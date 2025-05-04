import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import "./NotificationModal.css"

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

interface NotificationSectionProps {
  title?: string
  notifications: Notification[]
  icon?: React.ReactNode
  showTitle?: boolean
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

interface NotificationModalProps {
  isControlled?: boolean
  isOpenExternal?: boolean
  onCloseExternal?: () => void
  onToggleExternal?: () => void
  newNotificationsCount?: number
  onNotificationsUpdate?: (count: number) => void
  renderButton?: boolean
  forceRefresh?: (force?: boolean) => Promise<void>
  externalNotifications?: Notification[]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Ontem";
  } else {
    return `${diffDays} dias atrás`;
  }
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  isControlled = false,
  isOpenExternal = false,
  onCloseExternal,
  onToggleExternal,
  newNotificationsCount: externalCount,
  onNotificationsUpdate,
  renderButton = true,
  forceRefresh,
  externalNotifications
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const fetchNotifications = useCallback(async (force = false) => {
    if (!force && !isInitialLoad && notifications.length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      if (forceRefresh) {
        await forceRefresh(force);
        if (externalNotifications) {
          setNotifications(externalNotifications);
          setUnreadCount(externalNotifications.filter(n => !n.isRead).length);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }
      }

      const response = await axios.get('http://localhost:3000/api/v1/notification', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.unreadCount || 
        response.data.data.notifications.filter((n: { isRead: any }) => !n.isRead).length);
      setLoading(false);
      setIsInitialLoad(false);
    } catch (err) {
      setError('Erro ao carregar notificações');
      setLoading(false);
      setIsInitialLoad(false);
      console.error('Erro ao buscar notificações:', err);
    }
  }, [forceRefresh, externalNotifications, notifications.length, isInitialLoad]);

  useEffect(() => {
    if (externalNotifications && externalNotifications.length > 0) {
      setNotifications(externalNotifications);
      const newUnreadCount = externalNotifications.filter(n => !n.isRead).length;
      setUnreadCount(newUnreadCount);
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [externalNotifications]);

  useEffect(() => {
    const isOpen = isControlled ? isOpenExternal : isOpenInternal;
    
    if (isOpen && isInitialLoad) {
      fetchNotifications(true);
    }
  }, [isControlled, isOpenExternal, isOpenInternal, fetchNotifications, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad && !externalNotifications) {
      fetchNotifications(true);
    }
  }, [fetchNotifications, externalNotifications, isInitialLoad]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/notification/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      if (wasUnread) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        
        if (onNotificationsUpdate) {
          onNotificationsUpdate(newUnreadCount);
        }
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, [notifications, unreadCount, onNotificationsUpdate]);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch('http://localhost:3000/api/v1/notification/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
      if (onNotificationsUpdate) {
        onNotificationsUpdate(0);
      }
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
    }
  }, [onNotificationsUpdate]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/notification/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const deletedNotification = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      
      if (deletedNotification && !deletedNotification.isRead) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        
        if (onNotificationsUpdate) {
          onNotificationsUpdate(newUnreadCount);
        }
      }
    } catch (err) {
      console.error('Erro ao excluir notificação:', err);
    }
  }, [notifications, unreadCount, onNotificationsUpdate]);

  const watchlistNotifications = notifications.filter(n => n.type === 'watch_reminder');
  const newReleasesNotifications = notifications.filter(n => n.type === 'release');
  const streamingNotifications = notifications.filter(n => n.type === 'streaming');

  const totalNotifications = notifications.length;
  
  const newNotifications = externalCount !== undefined ? externalCount : unreadCount;

  const isOpen = isControlled ? isOpenExternal : isOpenInternal;
  
  const openModal = () => {
    if (isControlled && onToggleExternal) {
      onToggleExternal();
    } else {
      setIsOpenInternal(true);
    }
  };
  
  const closeModal = () => {
    if (isControlled && onCloseExternal) {
      onCloseExternal();
    } else {
      setIsOpenInternal(false);
    }
  };

  const renderNotificationButton = () => (
    <div className="notification-container">
      <button className="notification-button" onClick={openModal}>
        <svg
          className="bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {newNotifications > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="notification-badge"
          >
            {newNotifications}
          </motion.div>
        )}
      </button>
    </div>
  );

  if (isControlled && !isOpen && !renderButton) {
    return null;
  }

  if (!isOpen) {
    return renderButton ? renderNotificationButton() : null;
  }

  return (
    <div className="notification-container">
      {!isControlled && renderButton && renderNotificationButton()}

      <div className="modal-backdrop" onClick={closeModal}>
        <motion.div
          className="notification-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title">
              <motion.div
                initial={{ rotate: -30 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <svg
                  className="bell-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Notificações ({totalNotifications})
              </motion.span>
            </div>
            <div className="modal-actions">
              <button 
                className="mark-all-read-button" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Marcar todas como lidas
              </button>
              <button className="close-button" onClick={closeModal}>
                <svg
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
          </div>

          <div className="tabs-container">
            <div className="tabs-list">
              <button
                className={`tab-button ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Todas
              </button>
              <button
                className={`tab-button ${activeTab === "watchlist" ? "active" : ""}`}
                onClick={() => setActiveTab("watchlist")}
              >
                <svg
                  className="tab-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Watchlist</span>
              </button>
              <button
                className={`tab-button ${activeTab === "releases" ? "active" : ""}`}
                onClick={() => setActiveTab("releases")}
              >
                <svg
                  className="tab-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Lançamentos</span>
              </button>
              <button
                className={`tab-button ${activeTab === "streaming" ? "active" : ""}`}
                onClick={() => setActiveTab("streaming")}
              >
                <svg
                  className="tab-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <span>Streaming</span>
              </button>
            </div>

            <div className="tabs-content">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Carregando notificações...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button onClick={() => fetchNotifications(true)}>Tentar novamente</button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === "all" && (
                    <motion.div
                      key="all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="tab-panel"
                    >
                      {totalNotifications === 0 ? (
                        <div className="empty-notifications">Nenhuma notificação</div>
                      ) : (
                        <>
                          {watchlistNotifications.length > 0 && (
                            <NotificationSection
                              title="Sua Watchlist"
                              icon={
                                <svg
                                  className="section-icon"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              }
                              notifications={watchlistNotifications}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          )}
                          
                          {newReleasesNotifications.length > 0 && (
                            <NotificationSection
                              title="Novos Lançamentos"
                              icon={
                                <svg
                                  className="section-icon"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                              }
                              notifications={newReleasesNotifications}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          )}
                          
                          {streamingNotifications.length > 0 && (
                            <NotificationSection
                              title="Disponível para Streaming"
                              icon={
                                <svg
                                  className="section-icon"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                </svg>
                              }
                              notifications={streamingNotifications}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          )}
                        </>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "watchlist" && (
                    <motion.div
                      key="watchlist"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="tab-panel"
                    >
                      <NotificationSection 
                        notifications={watchlistNotifications} 
                        showTitle={false} 
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    </motion.div>
                  )}

                  {activeTab === "releases" && (
                    <motion.div
                      key="releases"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="tab-panel"
                    >
                      <NotificationSection 
                        notifications={newReleasesNotifications} 
                        showTitle={false} 
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    </motion.div>
                  )}

                  {activeTab === "streaming" && (
                    <motion.div
                      key="streaming"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="tab-panel"
                    >
                      <NotificationSection 
                        notifications={streamingNotifications} 
                        showTitle={false} 
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const NotificationSection: React.FC<NotificationSectionProps> = ({ 
  title, 
  notifications, 
  icon, 
  showTitle = true,
  onMarkAsRead,
  onDelete
}) => {
  if (notifications.length === 0) {
    return <div className="empty-notifications">Nenhuma notificação</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="notification-section"
    >
      {showTitle && title && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="section-title"
        >
          {icon}
          <h3>{title}</h3>
        </motion.div>
      )}

      <div className="notification-list">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`notification-item ${!notification.isRead ? "notification-new" : ""}`}
            onClick={() => {
              if (!notification.isRead) {
                onMarkAsRead(notification._id);
              }
            }}
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              src={notification.image || "https://via.placeholder.com/100x60"}
              alt={notification.title}
              className="notification-image"
            />
            <div className="notification-content">
              <div className="notification-header">
                <h4 className="notification-title">{notification.title}</h4>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification._id);
                  }}
                >
                  <svg
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
                </motion.button>
              </div>
              <p className="notification-message">{notification.message}</p>
              <div className="notification-footer">
                <span className="notification-date">{formatDate(notification.createdAt)}</span>
                {!notification.isRead && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                    className="new-badge"
                  >
                    Novo
                  </motion.div>
                )}
                {notification.metadata?.director && (
                  <span className="notification-metadata">
                    Diretor: {notification.metadata.director}
                  </span>
                )}
                {notification.metadata?.platform && (
                  <span className="notification-metadata">
                    Plataforma: {notification.metadata.platform}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default NotificationModal
import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
  onNotificationsUpdate,
  renderButton = true,
  forceRefresh,
  externalNotifications
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
  
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async (force = false) => {
    if (!force && !isInitialLoad && notifications.length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      if (forceRefresh) {
        await forceRefresh(force);
        if (externalNotifications) {
          const filteredNotifications = externalNotifications.filter(
            notification => !deletedNotificationIds.has(notification._id)
          );
          setNotifications(filteredNotifications);
          setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);
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
      
      const notificationsData = response.data.data.notifications || [];
      
      const filteredNotifications = notificationsData.filter(
        (notification: Notification) => !deletedNotificationIds.has(notification._id)
      );
      
      setNotifications(filteredNotifications);
      setUnreadCount(response.data.unreadCount || 
        filteredNotifications.filter((n: { isRead: any }) => !n.isRead).length);
      setLoading(false);
      setIsInitialLoad(false);
      setPendingDeletions(new Set());
    } catch (err) {
      setError('Erro ao carregar notificações');
      setLoading(false);
      setIsInitialLoad(false);
      console.error('Erro ao buscar notificações:', err);
    }
  }, [forceRefresh, externalNotifications, notifications.length, isInitialLoad, deletedNotificationIds]);

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
    if (pendingDeletions.has(id)) {
      return;
    }
    
    try {
      setPendingDeletions(prev => new Set([...prev, id]));
      
      const deletedNotification = notifications.find(n => n._id === id);
      const isLastNotification = notifications.length <= 1;
      
      const updatedNotifications = notifications.filter(notification => notification._id !== id);
      setNotifications(updatedNotifications);
      
      setDeletedNotificationIds(prev => new Set([...prev, id]));
      
      if (deletedNotification && !deletedNotification.isRead) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        
        if (onNotificationsUpdate) {
          onNotificationsUpdate(newUnreadCount);
        }
      }
      
      await axios.delete(`http://localhost:3000/api/v1/notification/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch((error: unknown) => {
        const isAxiosError = (err: unknown): err is { response?: { status: number } } => {
          return typeof err === 'object' && err !== null && 'response' in err;
        };
        
        if (isAxiosError(error) && error.response && error.response.status === 404) {
          console.log(`Notificação ${id} já não existe no servidor`);
          return { status: 'success' };
        }
        throw error;
      });
      
      if (isLastNotification) {
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Erro ao excluir notificação:', err);
      
      const isAxiosError = (err: unknown): err is { response?: { status: number } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };

      if (isAxiosError(err) && err.response && err.response.status === 404) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        setDeletedNotificationIds(prev => new Set([...prev, id]));
      } else {
        fetchNotifications(true);
      }
    } finally {
      setPendingDeletions(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [notifications, unreadCount, onNotificationsUpdate, fetchNotifications, pendingDeletions]);

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

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const displayedNotifications = notifications
    .filter(n => !pendingDeletions.has(n._id) && !deletedNotificationIds.has(n._id));
  
  const isEmptyState = !loading && !error && displayedNotifications.length === 0;

  return (
    <div className="notification-container">
      {renderButton && (
        <button className="notification-button" onClick={openModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          Notificações
          {unreadNotifications > 0 && (
            <span className="notification-badge">{unreadNotifications}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="modal-overlay-notifi">
          <div className="notification-modal">
            <div className="modal-header-notifi">
              <h2>Notificações</h2>
              <button className="close-button" onClick={closeModal}>
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
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            <div className="modal-content-notifi">
              {loading ? (
                <div className="loading-indicator">
                  <p>Carregando notificações...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={() => fetchNotifications(true)}>Tentar novamente</button>
                </div>
              ) : isEmptyState ? (
                <p className="no-notifications">Nenhuma notificação</p>
              ) : (
                <>
                  <div className="mark-all-container">
                    <button 
                      className="mark-all-button" 
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="notifications-list">
                    {displayedNotifications.map((notification, index) => (
                      <div
                        key={notification._id}
                        className={`notification-item ${notification.isRead ? "read" : ""}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="notification-header">
                          <h3>{notification.title}</h3>
                          <span className="notification-time">{formatDate(notification.createdAt)}</span>
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        {(notification.metadata?.director || notification.metadata?.platform) && (
                          <div className="notification-metadata">
                            {notification.metadata.director && (
                              <span>Diretor: {notification.metadata.director}</span>
                            )}
                            {notification.metadata.platform && (
                              <span>Plataforma: {notification.metadata.platform}</span>
                            )}
                          </div>
                        )}
                        <div className="notification-actions">
                          {!notification.isRead && (
                            <button className="action-button-notifi" onClick={() => markAsRead(notification._id)}>
                              Marcar como lida
                            </button>
                          )}
                          <button 
                            className="action-button-notifi" 
                            onClick={() => deleteNotification(notification._id)}
                            disabled={pendingDeletions.has(notification._id)}
                          >
                            {pendingDeletions.has(notification._id) ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer-notifi">
              <button className="close-modal-button-notifi" onClick={closeModal}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationModal
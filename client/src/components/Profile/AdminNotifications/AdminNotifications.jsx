import React, { useState, useEffect } from 'react';
import { getNotificationConfig } from '../../../config/notificationConfig';
import { useNavigate } from 'react-router-dom';
import '../Notifications/notifications.css';
import { useAcademy } from '../../contexts/AcademyProvider';

export const AdminNotifications = () => {
  const navigate = useNavigate();
  const { getAdminNotifications, markNotificationAsRead, deleteNotification } = useAcademy();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = { limit: 50 };
      if (filter === 'unread') params.read = false;
      const data = await getAdminNotifications(params);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      }
      const config = getNotificationConfig(notification.type);
      navigate(config.route);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatTime = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Току що';
    if (diff < 3600) return `Преди ${Math.floor(diff / 60)} мин.`;
    if (diff < 86400) return `Преди ${Math.floor(diff / 3600)} ч.`;
    return `Преди ${Math.floor(diff / 86400)} дни`;
  };

  return (
    <div className="notifications-page-wrapper">
      <div className="notifications-page-header">
        <h1>Админ Нотификации</h1>
        {unreadCount > 0 && <span className="notifications-page-badge">{unreadCount} нови</span>}
      </div>

      <div className="notifications-page-toolbar">
        <div className="notifications-page-filters">
          <button className={`notifications-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Всички</button>
          <button className={`notifications-filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Непрочетени ({unreadCount})</button>
        </div>
      </div>

      <div className="notifications-page-list">
        {isLoading ? (
          <div className="notifications-page-loading"><div className="spinner"></div><p>Зареждане...</p></div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => {
            const config = getNotificationConfig(notification.type);
            return (
              <div key={notification.id} className={`notif-page-item ${notification.read ? 'read' : 'unread'}`} onClick={() => handleClick(notification)}>
                <div className="notif-page-item-icon" style={{ backgroundColor: config.color }}>{config.icon}</div>
                <div className="notif-page-item-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notif-page-item-time">{formatTime(notification.createdAt)}</span>
                </div>
                <div className="notif-page-item-actions">
                  {!notification.read && <div className="notif-page-dot" style={{ backgroundColor: config.color }}></div>}
                  <button className="notif-page-delete" onClick={(e) => handleDelete(notification.id, e)} title="Изтрий">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="notifications-page-empty">
            <span className="empty-icon">🔔</span>
            <h3>Няма нотификации</h3>
          </div>
        )}
      </div>
    </div>
  );
};
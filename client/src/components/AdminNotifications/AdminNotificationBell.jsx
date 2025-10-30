// src/components/AdminNotifications/AdminNotificationBell.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import { useNavigate } from 'react-router-dom';
import { getNotificationConfig } from '../../config/notificationConfig';
import { NotificationItem } from './NotificationItem/NotificationItem';
import './adminNotificationBell.css';

export const AdminNotificationBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getAdminNotifications, markNotificationAsRead } = useAcademy();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminNotifications({ limit: 10, read: false });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // 🔥 АВТОМАТИЧНА НАВИГАЦИЯ БАЗИРАНА НА CONFIG
      const config = getNotificationConfig(notification.type);
      navigate(config.route);
      
      setIsOpen(false);
      
      // Refresh след маркиране като прочетено
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return t('AdminNotificationBell.justNow');
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('AdminNotificationBell.minutesAgo')}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('AdminNotificationBell.hoursAgo')}`;
    return `${Math.floor(diffInSeconds / 86400)} ${t('AdminNotificationBell.daysAgo')}`;
  };

  return (
    <div className="admin-notification-bell" ref={dropdownRef}>
      {/* BELL ICON */}
      <button 
        className="admin-notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg 
          className="admin-notification-bell-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="admin-notification-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="admin-notification-bell-dropdown">
          <div className="admin-notification-bell-header">
            <h3>{t('AdminNotificationBell.title')}</h3>
            {unreadCount > 0 && (
              <span className="admin-notification-bell-count">
                {unreadCount} {t('AdminNotificationBell.new')}
              </span>
            )}
          </div>

          <div className="admin-notification-bell-list">
            {isLoading ? (
              <div className="admin-notification-bell-loading">
                <div className="admin-notification-bell-spinner"></div>
                <p>{t('AdminNotificationBell.loading')}</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  formatTimeAgo={formatTimeAgo}
                />
              ))
            ) : (
              <div className="admin-notification-bell-empty">
                <span className="admin-notification-bell-empty-icon">🔔</span>
                <p>{t('AdminNotificationBell.noNotifications')}</p>
              </div>
            )}
          </div>

          <div className="admin-notification-bell-footer">
            <button 
              className="admin-notification-bell-view-all"
              onClick={() => {
                navigate('/profile/notifications');
                setIsOpen(false);
              }}
            >
              {t('AdminNotificationBell.viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
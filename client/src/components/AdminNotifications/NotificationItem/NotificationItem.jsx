// src/components/AdminNotifications/NotificationItem/NotificationItem.jsx

import React from 'react';
import './notificationItem.css';
import { getNotificationConfig } from '../../../config/notificationConfig';

export const NotificationItem = ({ notification, onClick, formatTimeAgo,onDelete }) => {
  const config = getNotificationConfig(notification.type);
 const handleDelete = (e) => {
    e.stopPropagation(); 
    if (onDelete) {
      onDelete(notification.id);
    }
  };
  return (
    <div
      className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${config.priority}`}
      onClick={() => onClick(notification)}
      style={{ '--notification-color': config.color }}
    >
      <div className="notification-item-icon" style={{ backgroundColor: config.color }}>
        {config.icon}
      </div>
    
      <div className="notification-item-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-item-time">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
  {onDelete && (
          <button 
            className="notification-item-delete"
            onClick={handleDelete}
            title="Изтрий"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        )}
      {!notification.read && (
        <div className="notification-item-dot" style={{ backgroundColor: config.color }}></div>
      )}
    </div>
  );
};
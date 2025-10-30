// src/components/AdminNotifications/NotificationItem/NotificationItem.jsx

import React from 'react';
import './notificationItem.css';
import { getNotificationConfig } from '../../../config/notificationConfig';

export const NotificationItem = ({ notification, onClick, formatTimeAgo }) => {
  const config = getNotificationConfig(notification.type);

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

      {!notification.read && (
        <div className="notification-item-dot" style={{ backgroundColor: config.color }}></div>
      )}
    </div>
  );
};

import { useTranslation } from 'react-i18next';
import './digiBridgeChatMessage.css';

export const DigiBridgeChatMessage = ({ message, isOwn }) => {
  const { t } = useTranslation();

  // Форматиране на времето
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Форматиране на размера на файл
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`digibridge-chat-message ${isOwn ? 'digibridge-chat-message-own' : 'digibridge-chat-message-other'}`}>
      
      {/* Avatar за съобщения от другия */}
      {!isOwn && (
        <div className="digibridge-chat-message-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}

      <div className="digibridge-chat-message-content">
        
        {/* Име на изпращача (само за съобщения от другия) */}
        {!isOwn && (
          <div className="digibridge-chat-message-sender">
            {message.senderName}
          </div>
        )}

        {/* Bubble със съобщението */}
        <div className="digibridge-chat-message-bubble">
          
          {/* ТЕКСТОВО СЪОБЩЕНИЕ */}
          {message.type === 'text' && (
            <p className="digibridge-chat-message-text">
              {message.message}
            </p>
          )}

          {/* ИЗОБРАЖЕНИЕ */}
          {message.type === 'image' && (
            <div className="digibridge-chat-message-image-wrapper">
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="digibridge-chat-message-image-link"
              >
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName || 'Image'}
                  className="digibridge-chat-message-image"
                  loading="lazy"
                />
                <div className="digibridge-chat-message-image-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              </a>
              {message.message && message.message !== '📷 Изображение' && (
                <p className="digibridge-chat-message-caption">{message.message}</p>
              )}
            </div>
          )}

          {/* ФАЙЛ */}
          {message.type === 'file' && (
            <a 
              href={message.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="digibridge-chat-message-file"
            >
              <div className="digibridge-chat-message-file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <div className="digibridge-chat-message-file-info">
                <div className="digibridge-chat-message-file-name">
                  {message.fileName || 'Файл'}
                </div>
                <div className="digibridge-chat-message-file-size">
                  {message.fileSize && formatFileSize(message.fileSize)}
                </div>
              </div>
              <div className="digibridge-chat-message-file-download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
            </a>
          )}

          {/* Време */}
          <div className="digibridge-chat-message-time">
            {formatTime(message.timestamp)}
            {isOwn && message.read && (
              <svg 
                className="digibridge-chat-message-read-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12"/>
                <polyline points="20 6 9 17 4 12" transform="translate(3, 0)"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
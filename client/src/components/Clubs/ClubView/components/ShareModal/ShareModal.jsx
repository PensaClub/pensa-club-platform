import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faLink,
  faCheck,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faTwitter,
  faLinkedin,
  faWhatsapp,
  faTelegram
} from '@fortawesome/free-brands-svg-icons';
import './shareModal.css';

export const ShareModal = ({ isOpen, onClose, club }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentUrl] = useState(window.location.href);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const shareData = {
    title: `${club.name} - Pensa Club`,
    text: club.shortDescription || `Разгледайте ${club.name} в ${club.location.city}`,
    url: currentUrl
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Грешка при споделяне:', err);
        }
      }
    }
  };

  // Copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Грешка при копиране:', err);
      // Fallback за стари браузъри
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Social platform share URLs
  const getShareUrl = (platform) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(shareData.title);
    const encodedText = encodeURIComponent(shareData.text);

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      
      case 'telegram':
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      
      case 'email':
        return `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
      
      default:
        return '';
    }
  };

  const handleSocialShare = (platform) => {
    const url = getShareUrl(platform);
    if (platform === 'email') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: faFacebook,
      color: '#1877f2',
      bgColor: '#e3f2fd'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: faTwitter,
      color: '#1da1f2',
      bgColor: '#e1f5fe'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: faLinkedin,
      color: '#0077b5',
      bgColor: '#e3f2fd'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: faWhatsapp,
      color: '#25d366',
      bgColor: '#e8f5e8'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: faTelegram,
      color: '#0088cc',
      bgColor: '#e1f5fe'
    },
    {
      id: 'email',
      name: 'Имейл',
      icon: faEnvelope,
      color: '#6b7280',
      bgColor: '#f3f4f6'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>Споделете клуба</h3>
            <p>Разкажете на приятелите си за {club.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          
          {/* Native Share (mobile only) */}
          {navigator.share && (
            <div className="native-share-section">
              <button className="native-share-btn" onClick={handleNativeShare}>
                <FontAwesomeIcon icon={faLink} />
                <span>Споделете</span>
              </button>
            </div>
          )}

          {/* Social Platforms */}
          <div className="social-platforms">
            <h4>Изберете платформа</h4>
            <div className="platforms-grid">
              {socialPlatforms.map(platform => (
                <button
                  key={platform.id}
                  className="platform-btn"
                  onClick={() => handleSocialShare(platform.id)}
                  style={{
                    backgroundColor: platform.bgColor,
                    '--hover-color': platform.color
                  }}
                >
                  <div className="platform-icon" style={{ color: platform.color }}>
                    <FontAwesomeIcon icon={platform.icon} />
                  </div>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="copy-section">
            <h4>Или копирайте връзката</h4>
            <div className="copy-container">
              <div className="url-display">
                <span className="url-text">{currentUrl}</span>
              </div>
              <button 
                className={`copy-btn ${copySuccess ? 'success' : ''}`}
                onClick={handleCopyLink}
              >
                <FontAwesomeIcon icon={copySuccess ? faCheck : faLink} />
                <span>{copySuccess ? 'Копирано!' : 'Копирай'}</span>
              </button>
            </div>
          </div>

          {/* Club Preview */}
          <div className="share-preview">
            <h4>Преглед</h4>
            <div className="preview-card">
              {club.images && club.images.featured && (
                <div className="preview-image">
                  <img src={club.images.featured} alt={club.name} />
                </div>
              )}
              <div className="preview-content">
                <h5>{club.name}</h5>
                <p>{club.shortDescription}</p>
                <div className="preview-location">
                  <FontAwesomeIcon icon={faLink} />
                  <span>{club.location.city}, {club.location.region}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
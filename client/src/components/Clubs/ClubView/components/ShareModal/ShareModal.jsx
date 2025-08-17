import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faLink,
    faEnvelope,
    faCheck,
    faShare
} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebook,
    faTwitter,
    faLinkedin,
    faWhatsapp,
    faTelegram
} from '@fortawesome/free-brands-svg-icons';
import './shareModal.css';

const ShareModal = ({ isOpen, onClose, club }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !club) return null;

    const shareUrl = window.location.href;
    const shareTitle = `${club.name} - Клуб за пенсионери`;
    const shareText = club.shortDescription || `Разгледайте ${club.name} в ${club.location.city}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Грешка при копиране:', err);
        }
    };

    const shareLinks = [
        {
            name: 'Facebook',
            icon: faFacebook,
            color: '#1877f2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: faTwitter,
            color: '#1da1f2',
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        },
        {
            name: 'LinkedIn',
            icon: faLinkedin,
            color: '#0077b5',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'WhatsApp',
            icon: faWhatsapp,
            color: '#25d366',
            url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
        },
        {
            name: 'Telegram',
            icon: faTelegram,
            color: '#0088cc',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        },
        {
            name: 'Email',
            icon: faEnvelope,
            color: '#ea4335',
            url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
        }
    ];

    const handleShareClick = (url) => {
        window.open(url, '_blank', 'width=600,height=400');
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h3>
                        <FontAwesomeIcon icon={faShare} />
                        Споделете клуба
                    </h3>
                    <button className="share-modal-close" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="share-modal-content">
                    <div className="share-club-info">
                        <h4>{club.name}</h4>
                        <p>{club.location.city}</p>
                    </div>

                    <div className="share-options">
                        {shareLinks.map((link) => (
                            <button
                                key={link.name}
                                className="share-option"
                                onClick={() => handleShareClick(link.url)}
                                style={{ '--share-color': link.color }}
                            >
                                <FontAwesomeIcon icon={link.icon} />
                                <span>{link.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="share-url-section">
                        <label>Копирайте линка:</label>
                        <div className="share-url-container">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="share-url-input"
                            />
                            <button
                                className={`share-copy-btn ${copied ? 'copied' : ''}`}
                                onClick={copyToClipboard}
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faLink} />
                                {copied ? 'Копирано!' : 'Копирай'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
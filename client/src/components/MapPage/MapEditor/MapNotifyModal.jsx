import './mapNotifyModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { t } from 'i18next';

export const MapNotifyModal = ({ onClose }) => {

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
                </button>
                {/* <img src={src} alt={alt} className="image-modal-img" /> */}
                <div className="login-prompt">
                    {/* <p>{alt}</p> */}
                    <p>
                        {t('notify_modal.part1')} <Link to="/sign-up">{t('notify_modal.part2')}</Link> {t('notify_modal.part3')}
                    </p>

                </div>
            </div>
        </div>
    )
}
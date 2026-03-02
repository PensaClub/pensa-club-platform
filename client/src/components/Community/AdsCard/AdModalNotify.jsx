import './adModalNotify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdModalNotify = ({onClose }) => {
    const { t } = useTranslation('community')
    return (
        <div className="image-modal-overlay-ads" onClick={onClose}>
            <div className="image-modal-content-ads" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
                </button>
                {/* <img src={src} alt={alt} className="image-modal-img" /> */}
                <div className="login-prompt">
                    {/* <p>{alt}</p> */}
                    {t('community.login_to_view')} <Link to="/sign-up">{t('community.login')}</Link>, {t('community.to_see_details')}.
                </div>
            </div>
        </div>
    )
}

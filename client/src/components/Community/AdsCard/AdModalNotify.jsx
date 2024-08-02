import './adModalNotify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export const AdModalNotify = ({onClose }) => {

    return (
        <div className="image-modal-overlay-ads" onClick={onClose}>
            <div className="image-modal-content-ads" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
                </button>
                {/* <img src={src} alt={alt} className="image-modal-img" /> */}
                <div className="login-prompt">
                    {/* <p>{alt}</p> */}
                    <p>Моля, <Link to="/sign-up">логнете се</Link>, за да видите подробности.</p>
                </div>
            </div>
        </div>
    )
}

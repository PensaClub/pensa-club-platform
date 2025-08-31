import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEdit, 
    faTrash, 
    faUsers, 
    faMapMarkerAlt,
    faSpinner,
    faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import './myClubsCard.css';
const MyClubsCard = ({ club, onView, onEdit, onDelete, isOwner }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDelete(club);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting club:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="myclubscard-wrapper">
                <div className="myclubscard-container">
                    <div className="myclubscard-header">
                        <img
                            src={club.mainImage || club.logo || '/images/placeholder-club.jpg'}
                            alt={club.name}
                            className="myclubscard-image"
                            onError={(e) => {
                                e.target.src = '/images/placeholder-club.jpg';
                            }}
                        />
                        <div className="myclubscard-overlay">
                            <div className="myclubscard-actions">
                                <button
                                    className="myclubscard-action-btn myclubscard-action-btn--view"
                                    onClick={() => onView(club)}
                                    title="Преглед на клуб"
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                {isOwner && (
                                    <>
                                        <button
                                            className="myclubscard-action-btn myclubscard-action-btn--edit"
                                            onClick={() => onEdit(club)}
                                            title="Редактирай клуб"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="myclubscard-action-btn myclubscard-action-btn--delete"
                                            onClick={handleDeleteClick}
                                            title="Изтрий клуб"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <FontAwesomeIcon icon={faSpinner} spin />
                                            ) : (
                                                <FontAwesomeIcon icon={faTrash} />
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="myclubscard-content">
                        <h3 className="myclubscard-title">{club.name}</h3>
                        <p className="myclubscard-description">
                            {club.shortDescription || 'Няма налично описание'}
                        </p>
                        
                        <div className="myclubscard-meta">
                            {club.location?.city && (
                                <div className="myclubscard-meta-item">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    <span>{club.location.city}</span>
                                </div>
                            )}
                            
                            <div className="myclubscard-meta-item">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{club.membership?.totalMembers || 0} членове</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="myclubscard-modal-overlay">
                    <div className="myclubscard-modal">
                        <div className="myclubscard-modal-header">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="myclubscard-modal-icon" />
                            <h3>Потвърдете изтриването</h3>
                        </div>
                        <div className="myclubscard-modal-body">
                            <p>Сигурни ли сте, че искате да изтриете клуб <strong>"{club.name}"</strong>?</p>
                            <p>Това действие е необратимо и ще изтрие всички данни за клуба.</p>
                        </div>
                        <div className="myclubscard-modal-footer">
                            <button 
                                className="myclubscard-modal-btn myclubscard-modal-btn--cancel"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                Откажи
                            </button>
                            <button 
                                className="myclubscard-modal-btn myclubscard-modal-btn--delete"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Изтриване...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTrash} />
                                        Изтрий
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyClubsCard;
// DraftInitiatives/DraftCard/DraftCard.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faTrash,
    faCalendarAlt,
    faFileText,
    faImage,
    faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import './draftCard.css';

const DraftCard = ({ draft, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Неизвестна дата';
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text, maxLength = 120) => {
        if (!text) return 'Няма описание';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="draft-card">
            <div className="draft-card-header">
                {draft.mainImage?.src ? (
                    <div className="draft-image">
                        <img src={draft.mainImage.src} alt={draft.title || 'Draft'} />
                        <div className="draft-image-overlay">
                            <FontAwesomeIcon icon={faImage} />
                        </div>
                    </div>
                ) : (
                    <div className="draft-placeholder">
                        <FontAwesomeIcon icon={faFileText} className="placeholder-icon" />
                    </div>
                )}

                <div className="draft-status-badge">
                    Чернова
                </div>
            </div>

            <div className="draft-card-content">
                <h3 className="draft-title">
                    {draft.title || 'Неназована инициатива'}
                </h3>

                <p className="draft-description">
                    {truncateText(draft.shortDescription)}
                </p>

                <div className="draft-meta">
                    <div className="draft-meta-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Създадена: {formatDate(draft.createdAt)}</span>
                    </div>

                    {draft.location?.address && (
                        <div className="draft-meta-item">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{draft.location.address}</span>
                        </div>
                    )}
                </div>

                <div className="draft-progress">
                    <div className="progress-label">Прогрес на попълване</div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${calculateProgress(draft)}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">{calculateProgress(draft)}%</span>
                </div>
            </div>

            <div className="draft-card-actions">
                <button
                    className="draft-action-btn edit-btn"
                    onClick={() => onEdit(draft.id)}
                    title="Редактирай"
                >
                    <FontAwesomeIcon icon={faEdit} />
                    Редактирай
                </button>

                <button
                    className="draft-action-btn delete-btn"
                    onClick={onDelete}
                    title="Изтрий"
                >
                    <FontAwesomeIcon icon={faTrash} />
                    Изтрий
                </button>
            </div>
        </div>
    );
};

// Функция за изчисляване на прогреса на попълване
const calculateProgress = (draft) => {
    const fields = [
        'title',
        'shortDescription',
        'detailedDescription',
        'location',
        'startDate',
        'expectedBudget'
    ];

    let filledFields = 0;

    fields.forEach(field => {
        if (draft[field]) {
            if (field === 'location' && draft[field].address) {
                filledFields++;
            } else if (field !== 'location') {
                filledFields++;
            }
        }
    });

    return Math.round((filledFields / fields.length) * 100);
};

export default DraftCard;
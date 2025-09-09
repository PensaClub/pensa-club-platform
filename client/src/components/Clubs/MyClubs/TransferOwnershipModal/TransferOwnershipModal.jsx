import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faExchangeAlt,
    faSpinner,
    faExclamationTriangle,
    faUser,
    faEnvelope,
    faUserTie
} from '@fortawesome/free-solid-svg-icons';
import './transferOwnershipModal.css';

const TransferOwnershipModal = ({ 
    isOpen, 
    onClose, 
    onTransfer, 
    club, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState({
        newOwnerEmail: '',
        newOwnerFirstName: '',
        newOwnerLastName: ''
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors = {};

        // Email валидация
        if (!formData.newOwnerEmail) {
            newErrors.newOwnerEmail = 'Имейлът е задължителен';
        } else if (!/\S+@\S+\.\S+/.test(formData.newOwnerEmail)) {
            newErrors.newOwnerEmail = 'Невалиден имейл формат';
        }

        // Имената не са задължителни, но ако са попълнени, трябва да са поне 2 символа
        if (formData.newOwnerFirstName && formData.newOwnerFirstName.trim().length < 2) {
            newErrors.newOwnerFirstName = 'Първото име трябва да е поне 2 символа';
        }

        if (formData.newOwnerLastName && formData.newOwnerLastName.trim().length < 2) {
            newErrors.newOwnerLastName = 'Фамилията трябва да е поне 2 символа';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Изчисти грешката за това поле
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        // Изпрати само имейла към API-то
        onTransfer(formData.newOwnerEmail);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="transfer-ownership-modal-overlay" onClick={handleBackdropClick}>
            <div className="transfer-ownership-modal">
                <div className="transfer-ownership-modal-header">
                    <div className="transfer-ownership-modal-title-section">
                        <FontAwesomeIcon icon={faExchangeAlt} className="transfer-ownership-modal-icon" />
                        <div>
                            <h3>Прехвърляне на собственост</h3>
                            <p>Клуб: <strong>{club?.name}</strong></p>
                        </div>
                    </div>
                    <button
                        className="transfer-ownership-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="transfer-ownership-modal-body">
                    <div className="transfer-ownership-warning">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <div>
                            <h4>Внимание!</h4>
                            <p>
                                След прехвърляне на собствеността клубът няма да се показва повече във вашия профил. 
                                Новият собственик ще има пълен контрол върху клуба.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="transfer-ownership-form">
                        <div className="transfer-ownership-form-group">
                            <label className="transfer-ownership-form-label required">
                                <FontAwesomeIcon icon={faEnvelope} />
                                Имейл на новия собственик
                            </label>
                            <input
                                type="email"
                                className={`transfer-ownership-form-input ${errors.newOwnerEmail ? 'error' : ''}`}
                                placeholder="example@email.com"
                                value={formData.newOwnerEmail}
                                onChange={(e) => handleInputChange('newOwnerEmail', e.target.value)}
                                disabled={isLoading}
                            />
                            {errors.newOwnerEmail && (
                                <span className="transfer-ownership-form-error">
                                    {errors.newOwnerEmail}
                                </span>
                            )}
                        </div>

                        <div className="transfer-ownership-form-row">
                            <div className="transfer-ownership-form-group">
                                <label className="transfer-ownership-form-label">
                                    <FontAwesomeIcon icon={faUser} />
                                    Първо име (незадължително)
                                </label>
                                <input
                                    type="text"
                                    className={`transfer-ownership-form-input ${errors.newOwnerFirstName ? 'error' : ''}`}
                                    placeholder="Първо име"
                                    value={formData.newOwnerFirstName}
                                    onChange={(e) => handleInputChange('newOwnerFirstName', e.target.value)}
                                    disabled={isLoading}
                                />
                                {errors.newOwnerFirstName && (
                                    <span className="transfer-ownership-form-error">
                                        {errors.newOwnerFirstName}
                                    </span>
                                )}
                            </div>

                            <div className="transfer-ownership-form-group">
                                <label className="transfer-ownership-form-label">
                                    <FontAwesomeIcon icon={faUserTie} />
                                    Фамилия (незадължително)
                                </label>
                                <input
                                    type="text"
                                    className={`transfer-ownership-form-input ${errors.newOwnerLastName ? 'error' : ''}`}
                                    placeholder="Фамилия"
                                    value={formData.newOwnerLastName}
                                    onChange={(e) => handleInputChange('newOwnerLastName', e.target.value)}
                                    disabled={isLoading}
                                />
                                {errors.newOwnerLastName && (
                                    <span className="transfer-ownership-form-error">
                                        {errors.newOwnerLastName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="transfer-ownership-note">
                            <p><small>
                                * Имената се използват само за по-лесна идентификация. 
                                Към API-то се изпраща само имейл адресът.
                            </small></p>
                        </div>
                    </form>
                </div>

                <div className="transfer-ownership-modal-footer">
                    <button
                        type="button"
                        className="transfer-ownership-btn transfer-ownership-btn--cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Откажи
                    </button>
                    <button
                        type="submit"
                        className="transfer-ownership-btn transfer-ownership-btn--transfer"
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.newOwnerEmail}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Прехвърляне...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faExchangeAlt} />
                                Прехвърли собствеността
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferOwnershipModal;
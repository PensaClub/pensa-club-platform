import React from 'react';
import './delete.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export const DeleteAd = ({ isOpen, onClose, onDelete, adName, adImage}) => {

    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleDelete = () => {
       
        onDelete();
        onClose();
    };

    return (
        <div className="delete-modal-overlay">
            <div className="delete-modal-content">
                <button className="delete-close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} style={{ color: '#000000' }} />
                </button>
                <h3>{t('ads.delete_ad')} </h3>
                <h3>{adName} ?</h3> 
                
                <div className="ad-details">
                    <img src={adImage} alt="Ad Image" className="ad-image" />
                </div>
                <div className="ads-btns">
                    <button className="ads-btn red" onClick={handleDelete}>{t('ads.delete')}</button>
                    <button className="ads-btn green" onClick={onClose}>{t('ads.cancel_btn')}</button>
                </div>
            </div>
        </div>
    );
};
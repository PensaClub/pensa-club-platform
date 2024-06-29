import React, { useState } from 'react';
import './adsCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


const ImageModal = ({ src, alt, onClose }) => (
    <div className="image-modal-overlay" onClick={onClose}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={onClose}>  <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} /></button>
            <img src={src} alt={alt} className="image-modal-img" />
        </div>
    </div>
);

export const AdsCard = ({ ads }) => {
    const [modalImage, setModalImage] = useState(null);

    const handleImageClick = (image) => {
        setModalImage(image);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    return (
        <>
            <section className="ads-main">
                {ads.map(ad => (
                    <div key={ad.id} className="ads-card">
                        <div className="img-ads" onClick={() => handleImageClick(ad.image)}>
                            <img src={ad.image} alt={ad.title} />
                            <p>{ad.type}</p>
                        </div>
                        <div className="ads-info">
                            <h3 className="title-card">{ad.title}</h3>
                            <div className="subinfo-ads">
                                <p>{ad.item}</p>
                                <p>{ad.city}</p>
                                <p className='ads-exp'>{new Date(ad.created_date).toLocaleDateString('bg-BG', { month: 'long' })}</p>
                            </div>
                            <p className="ads-data">Валидна до: {new Date(ad.expiry_date).toLocaleDateString('bg-BG')}</p>
                            <div className="ads-user-info">
                                <img src="/images/homePage/avatar2.png" alt={ad.user_name} />
                                <p>{ad.user_name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
            {modalImage && (
                <ImageModal
                    src={modalImage}
                    alt="Ad Image"
                    onClose={closeModal}
                />
            )}
        </>
    );
}

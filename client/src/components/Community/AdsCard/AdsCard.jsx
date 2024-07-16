import React, { useState } from 'react';
import './adsCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { AdsCardSkeleton } from '../AdsCardSkeleton/AdsCardSkeleton';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { AdModalNotify } from './AdModalNotify';

const ImageModal = ({ src, alt, onClose }) => (
    <div className="image-modal-overlay" onClick={onClose}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={onClose}>  <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} /></button>
            <img src={src} alt={alt} className="image-modal-img" />
        </div>
    </div>
);

export const AdsCard = ({ ads, isLoading }) => {
    const{isAuthentication}=useAuthContext();
    console.error(isAuthentication)
    const [modalImage, setModalImage] = useState(null);
    const [open,setOpen] =useState(false)
    const { t } = useTranslation();
    const navigate=useNavigate()
    if (isLoading) {
        return (
            <section className="ads-main">
                {Array(3).fill().map((_, index) => (
                    <AdsCardSkeleton key={index} />
                ))}
            </section>
        );
    }

    const handleImageClick = (image) => {
        setModalImage(image);
    };
    const handleAdClick= (ad) => {
        if(isAuthentication) {
            navigate(`/ads/${ad.adId}`)
        }else{
            setOpen(true);
        }
    }
    const closeModal = () => {
        setModalImage(null);
    };
    const closeNotify=()=>{
        setOpen(false)
    }

    return (
        <>
            <section className="ads-main">
                {ads.result.map(ad => (
                    <div key={ad.adId} className="ads-card" >
                        <div className="img-ads" onClick={() => handleImageClick(ad.images[0].imageURL)}>
                            <img src={ad.images[0].imageURL} alt={ad.summary} />
                            <p>{t(`search-criteria.${ad.category}`)}</p>
                        </div>
                        <div className="ads-info" onClick={()=>handleAdClick(ad)}>
                            <h3 className="title-card">{ad.summary}</h3>
                            <div className="subinfo-ads">
                                {ad.tags.length > 0 && ad.tags.map(tag => (<p key={(tag)+1}>{"#"}{tag}</p>))}
                                <p>{ad.adTown}</p> {/* here is*/}
                                {/* <p className='ads-exp'>{new Date(ad.creationDate).toLocaleDateString('bg-BG', { month: 'long' })}</p> */}
                            </div>
                            <p className="ads-data">{t('community.validate_until')} : {new Date(ad.expirationDate).toLocaleDateString('bg-BG')}</p>
                            <div className="ads-user-info">
                                <img src={ad.account.details.imageURL || 'images/homePage/avatar2.png'} alt={ad.account.details.username} />
                                <p>{ad.account.details.username}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
            {open && !isAuthentication && (
                <AdModalNotify
                    onClose={closeNotify}
                />
            )}
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

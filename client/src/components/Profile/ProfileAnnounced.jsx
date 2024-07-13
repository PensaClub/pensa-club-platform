import React, { useEffect, useState } from 'react';
import './profile.css';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/UserContext';
import { useCommunityContext } from '../contexts/CommunityContext';
import { DeleteAd } from '../Community/AdPage/DeleteAd/DeleteAd';

const getMonthFromDate = (dateString, language) => {
    const date = new Date(dateString);
    return date.toLocaleString(language, { month: 'long' });
};

const getCategoryTranslation = (category, t) => {
    return t(`search-criteria.${category}`);
};

const formatDate = (dateString, language, t) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = getMonthFromDate(dateString, language);
    const year = date.getFullYear();

    if (language === 'bg-BG') {
        return `${day} ${t(`months.${month.toLowerCase()}`)} ${year}`;
    } else {
        return `${day} ${month} ${year}`;
    }
};

export const ProfileAnnounced = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const { getMyAds, deleteAd } = useCommunityContext();
    const { profileData } = useAuthContext();
    const [ads, setAds] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);

    useEffect(() => {
        const fetchAds = async () => {
            if (!profileData || !profileData.email) {
                console.error('Profile data or email is missing');
                return;
            }

            try {
                const result = await getMyAds(profileData.email);
                setAds(result.mappedAds);
            } catch (error) {
                console.error('Failed to fetch ads', error);
            }
        };

        fetchAds();
    }, [profileData.email]);

    const handleDeleteClick = (ad) => {
        setSelectedAd(ad);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteAd = async () => {
        if (selectedAd) {
            try {
                await deleteAd(selectedAd.adId);
                setAds(ads.filter(ad => ad.adId !== selectedAd.adId));
            } catch (error) {
                console.error('Failed to delete ad', error);
            }
            setIsDeleteModalOpen(false);
           setSelectedAd(null);
        }
    };

    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedAd(null);
      
    };

    return (
        <>
            {ads.length > 0 ? (
                ads.map(ad => (
                    <div className={`announced ${ad.approved ? '' : 'pending'}`} key={ad.adId}>
                        <p className={ad.approved ? 'view-more' : 'pending-approval'}>
                            {ad.approved ? t('ads.view_more') : t('ads.pending_approval')}
                        </p>
                        <section className='profile-data ads'>
                            <div className='avatar-announced'>
                                <img src={ad.images[0]?.imageURL || "/images/sign-up/avatar.jpg"} alt="Ad photo" />
                                <p>{getCategoryTranslation(ad.category, t)}</p>
                            </div>
                            <div className='user-data user-data-ads'>
                                <h3>{ad.summary}</h3>
                                <div className='ads-elipse'>
                                    <p className='elipse'>{getCategoryTranslation(ad.category, t)}</p>
                                    <p className='elipse'>{ad.adTown}</p>
                                    <p className='elipse'>{getMonthFromDate(ad.creationDate, currentLanguage)}</p>
                                </div>
                                <p>{t('ads.valid_until')}: {formatDate(ad.expirationDate, currentLanguage, t)}</p>
                                <div className='ads-btns'>
                                <button 
                                className={'ads-btn red'}  
                                >{t('ads.edit')}
                                </button>
                                    <button
                                     className={'ads-btn green'} 
                                      onClick={() => handleDeleteClick(ad)}>
                                        {t('ads.delete')}
                                        </button>
                                </div>
                            </div>
                        </section>
                    </div>
                ))
            ) : (
                <h4 className='no-ads'>{t('ads.no_ads')}</h4>
            )}
            <DeleteAd
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModal}
                onDelete={handleDeleteAd}
                adName={selectedAd?.summary}
                adImage={selectedAd?.images[0]?.imageURL || "/images/sign-up/avatar.jpg"}
            />
        </>
    );
}

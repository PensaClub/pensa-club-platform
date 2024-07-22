import React, { useEffect, useState } from 'react';
import './profile.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useCommunityContext } from '../contexts/CommunityContext';
import { DeleteAd } from '../Community/AdPage/DeleteAd/DeleteAd';
import { differenceInDays } from 'date-fns';

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
 
const cutToFirstWord = (text) => {
    if (!text) return '';
    const firstSpaceIndex = text.indexOf(' ');
    return firstSpaceIndex !== -1 ? text.substring(0, firstSpaceIndex) : text;
};

export const ProfileAnnounced = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;
    const navigate = useNavigate();
    const { getMyAds, deleteAd, updateExpirationDate, fetchTowns, regions } = useCommunityContext();
    const { profileData } = useAuthContext();
    const [ads, setAds] = useState([]);
    const [townNames, setTownNames] = useState({});
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
                setAds(result.ads);
            } catch (error) {
                console.error('Failed to fetch ads', error);
            }
        };
 
        fetchAds();
    }, [profileData.email]);
 
    const getAdTownValue = (language, town) => {
        return language === 'bg' ? town.bg : town.en;
    };
 
    useEffect(() => {
        const loadTownNames = async () => {
            const newTownNames = {};
            await Promise.all(
                ads.map(async (ad) => {
                    const townsData = await fetchTowns(Number(ad.adRegion), Number(ad.adSubregion));
                    const town = townsData.find(town => town.id === Number(ad.adTown));
                    if (town) {
                        newTownNames[ad.adId] = getAdTownValue(currentLanguage, town);
                    }
                })
            );
            setTownNames(newTownNames);
        };
 
        if (ads.length > 0) {
            loadTownNames();
        }
    }, [ads, currentLanguage, regions]);
 
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
 
    const handleEditClick = (ad) => {
        setSelectedAd(ad);
        navigate(`/ad/edit/${ad.adId}`)
    }

    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedAd(null);
    };
 
    const handleRefreshClick = async (adId) => {
        try {
            await updateExpirationDate(adId);
            const updatedAds = await getMyAds(profileData.email);
            setAds(updatedAds.mappedAds);
        } catch (error) {
            console.error('Failed to update expiration date', error);
        }
    };
 
    return (
        <>
            {ads.length > 0 ? (
                ads.map(ad => {
                    const daysUntilExpiration = differenceInDays(new Date(ad.expirationDate), new Date());
 
                    return (
                        <div className={`announced ${ad.status}`} key={ad.adId}>
                            <p className={
                                ad.status === 'approved' ? 'view-more' :
                                ad.status === 'pending' ? 'pending-approval' :
                                ad.status === 'denied' ? 'pending-approval' : ''
                            }>
                                {ad.status === 'approved' ? t('ads.view_more') :
                                ad.status === 'pending' ? t('ads.pending_approval') :
                                ad.status === 'denied' ? t('ads.denied') : ''}
                            </p>
                            <section className='profile-data ads'>
                                <div className='avatar-announced'>
                                    <img src={ad.images[0]?.imageURL || "/images/sign-up/avatar.jpg"} alt="Ad photo" />
                                    <p>{getCategoryTranslation(ad.category, t)}</p>
                                </div>
                                <div className='user-data user-data-ads'>
                                    <h3>{ad.summary}</h3>
                                    <div className='ads-data-elipse'>
                                        <p className='elipse price'>{townNames[ad.adId] || ad.adTown}</p>
                                        {ad.extraFields.price && (
                                        <p className='elipse price'> {ad.extraFields.price} {t('ads.price_lv')} </p>
                                    )}
                                        </div>
                                    <div className='ads-elipse'>
                                        <p className='elipse'>{getCategoryTranslation(ad.category, t)}</p>
                                        <p className='elipse'>{cutToFirstWord(ad.summary)}</p>
                                        <p className='elipse'>{getMonthFromDate(ad.creationDate, currentLanguage)}</p>
                                    </div>
                                    <p>{t('ads.valid_until')}: {formatDate(ad.expirationDate, currentLanguage, t)}</p>
                                </div>
                            </section>
                            <div className='ads-btns'>
                                <button className={'ads-btn red'} onClick={() => handleEditClick(ad)}
                                    >
                                    {t('ads.edit')}
                                </button>
                                <button
                                    className={'ads-btn green'}
                                    onClick={() => handleDeleteClick(ad)}>
                                    {t('ads.delete')}
                                </button>
                            </div>
                            {ad.status === 'denied' && (
                                <p className='admin-comment'>{t('ads.admin_comment')}: {ad.adminComment}</p>
                            )}
                            {daysUntilExpiration <= 7 && (
                                <p className='refresh'>
                                    {t('ads.refresh')}
                                    <span
                                        className="refresh-here"
                                        onClick={() => handleRefreshClick(ad.adId)}
                                    >
                                        {t('ads.refresh_here')}
                                    </span>
                                </p>
                            )}
                        </div>
                    )
                })
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
import React, { useEffect, useState } from 'react';
import './profile.css';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/UserContext';
import { useCommunityContext } from '../contexts/CommunityContext';

export const ProfileAnnounced = ( ) => {
    const { t, i18n } = useTranslation();
//   const currentLanguage = i18n.language;
    const { getMyAds } = useCommunityContext();
    const { profileData } = useAuthContext();
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAds = async () => {
            if (!profileData || !profileData.email) {
                console.error('Profile data or email is missing');
                return;
            }

            setIsLoading(true);

            try {
                const result = await getMyAds(profileData.email);
                setAds(result.mappedAds);
            } catch (error) {
                console.error('Failed to fetch ads', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAds();
    }, [profileData.email]);
   
   
    return (
        <>
            {isLoading ? (
                <p>Loading...</p>
            ) : ads.length > 0 ? (
                ads.map(ad => (
                    <div className='announced' key={ad.adId}>
                        <p className='view-more'>{t('ads.view_more')}</p>
                        <section className='profile-data ads'>
                            <div className='avatar-announced'>
                                <img src={ad.images[0]?.imageURL || "/images/sign-up/avatar.jpg"} alt="User avatar" />
                                {/* <p>  {currentLanguage === 'bg' ? ad.category.bg : ad.category.en}</p> */}
                                <p>{ad.category}</p>
                            </div>
                            <div className='user-data user-data-ads'>
                                <h3>{ad.summary}</h3>
                                <div className='ads-elipse'>
                                    <p className='elipse'>{ad.category}</p>
                                    <p className='elipse'>{ad.adTown}</p>
                                    <p className='elipse'>{ad.creationDate}</p>
                                </div>
                                <p>Валидна до: {ad.expirationDate}</p>
                                <div className='ads-btns'>
                                    <button className='ads-btn red'>{t('ads.edit')}</button>
                                    <button className='ads-btn green'>{t('ads.delete')}</button>
                                </div>
                            </div>
                        </section>
                    </div>
                ))
            ) : (
                <h4 className='no-ads'>{t('ads.no_ads')}</h4>
            )}
        </>
    );
}

import React, { useEffect, useState } from 'react';
import './profile.css';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/UserContext';
import { useCommunityContext } from '../contexts/CommunityContext';

export const ProfileAnnounced = () => {
    const { t } = useTranslation();
    const { getMyAds } = useCommunityContext();
    const { profileData } = useAuthContext();
    const [ads, setAds] = useState([]);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const result = await getMyAds(profileData.email);
                setAds(result);
                console.log(result)
            } catch (error) {
                console.error('Failed to fetch ads', error);
            }
        };

        fetchAds();
    }, []);

    return (
        <>
            {ads.length > 0 ? (
                ads.map(ad => (
                    <div className='announced' key={ad.id}>
                        <p className='view-more'>{t('ads.view_more')}</p>
                        <section className='profile-data ads'>
                            <div className='avatar-announced'>
                                <img src={ad.imageUrl || "/images/sign-up/avatar.jpg"} alt="User avatar" />
                                <p>продавам</p>
                            </div>
                            <div className='user-data user-data-ads'>
                                <h3>{ad.title}</h3>
                                <div className='ads-elipse'>
                                    <p className='elipse'>{ad.category}</p>
                                    <p className='elipse'>{ad.location}</p>
                                    <p className='elipse'>{ad.date}</p>
                                </div>
                                <p>Валидна до: </p>
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

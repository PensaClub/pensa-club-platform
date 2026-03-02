import { useEffect, useState } from 'react';
import './flyout.css';
import { useCommunityContext } from '../contexts/CommunityContext';
import { useTranslation } from 'react-i18next';

export const Flyout = ({ isOpen, onClose, ad, handleApprove, handleReject }) => {
    const [selectedImage, setSelectedImage] = useState(ad.images[0].imageURL);
    const [regionName, setRegionName] = useState('');
    const [subregionName, setSubregionName] = useState('');
    const [townName, setTownName] = useState('');
    const { t } = useTranslation(['admin', 'auth']);

    const { regions, fetchSubregions, subregions, fetchTowns } = useCommunityContext();
    const { i18n } = useTranslation(['admin', 'auth']);
    const currentLanguage = i18n.language;
    useEffect(() => {
        if (ad && ad.images && ad.images.length > 0) {
            setSelectedImage(ad.images[0].imageURL);
        }
    }, [ad]);
    useEffect(() => {
        fetchSubregions(Number(ad.adRegion))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    useEffect(() => {
        const fetchNames = async () => {
            const region = regions.find(region => region.id === Number(ad.adRegion));
            const regionName = region ? (currentLanguage === 'bg' ? region.bg : region.en) : '';
            setRegionName(regionName);

            const subregionList = subregions[ad.adRegion];
            const subregion = subregionList ? subregionList.find(subregion => subregion.id === Number(ad.adSubregion)) : null;
            const subregionName = subregion ? (currentLanguage === 'bg' ? subregion.bg : subregion.en) : '';
            setSubregionName(subregionName);

            try {
                const towns = await fetchTowns(ad.adRegion, ad.adSubregion);
                const town = towns.find(town => town.id === Number(ad.adTown));
                const townName = town ? (currentLanguage === 'bg' ? town.bg : town.en) : '';
                setTownName(townName);
            } catch (error) {
                console.error('Error fetching names:', error);
            }
        };

        fetchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ad.adRegion, ad.adSubregion, ad.adTown, currentLanguage, subregions]);

    return (
        <div className={`flyout-container ${isOpen ? 'open' : ''}`}>
            <div className="flyout-header">
                <h3>Ad Details</h3>
                <button className="flyout-close" onClick={onClose}>&times;</button>
            </div>
            <div className="flyout-body">
                <div className="flyout-desc">
                    <h4>{ad.summary}</h4>
                    <div className="category-flyout">
                        <p><strong>{t('admin.category')}:</strong> {t(`search-criteria.${ad.category}`)}</p>
                    </div>
                    <div className="desc-flyout-ad">
                        <p><strong>{t('admin.description')}:</strong> {ad.description}</p>
                    </div>
                    <div className="regions-flyout">
                        <div className="region-flyout">
                            <p><strong>{t('admin.region')}:</strong></p>
                            <h5>{regionName}</h5>
                        </div>
                        <div className="subregion-flyout">
                            <p><strong>{t('admin.subregion')} :</strong> </p>
                            <h5>{subregionName}</h5>
                        </div>
                        <div className="town-flyout">
                            <p><strong>{t('admin.town')}:</strong> </p>
                            <h5>{townName}</h5>
                        </div>
                    </div>
                    <div className="address-flyout">
                        <p><strong>{t('admin.address')}:</strong> {ad.street}</p>

                    </div>
                    <div className="tags-flyout">
                    {ad.tags.length > 0 && <p><strong>{t('admin.tags')}:</strong> {ad.tags.join(', ')}</p>}
                    </div>

                    {ad.extraFields.price && (
                    <div className="price-flyout">
                        
                        <p><strong>{t('admin.price')}:</strong> {ad.extraFields.price} лв.</p>
                    </div>

                    )}
                    {ad.extraFields.eventStartDate && (
                    <div className="start-date-flyout">

                        <p><strong>{t('admin.event_start_date')}:</strong> {ad.extraFields.eventStartDate}</p>
                    </div>

                    )}
                    {ad.extraFields.eventEndDate && (
                    <div className="end-date-flyout">

                        <p><strong>{t('admin.event_end_date')}:</strong> {ad.extraFields.eventEndDate}</p>
                    </div>

                    )}
                </div>

                <div className="flyout-preview">
                    <img src={selectedImage} alt="Preview" />
                </div>
                <div className="flyout-thumbnails">
                    {ad.images.map((image, index) => (
                        <img
                            key={index}
                            src={image.imageURL}
                            alt={`Thumbnail ${index}`}
                            className="flyout-thumbnail"
                            onClick={() => setSelectedImage(image.imageURL)}
                        />
                    ))}
                </div>
                <div className="flyout-buttons">
                    <button className="flyout-approve" onClick={() => handleApprove(ad.adId)}>
                        {t('admin.approve')}
                    </button>
                    <button className="flyout-reject" onClick={() => handleReject(ad.adId)}>
                    {t('admin.reject')}

                    </button>
                </div>
            </div>
        </div>
    );
};

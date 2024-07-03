import './createAd.css';
import '../../communityPage.css';
import { CommunityFooter } from '../../CommunityFooter/CommunityFooter';
import { HeaderCommunity } from '../../HeaderCommunity/HeaderCommunity';
import '../../CommunityFooter/communityFooter.css';
import { useCommunityContext } from '../../../contexts/CommunityContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useFormCreate } from '../../../hooks/useFormCreate';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../contexts/UserContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateAd = () => {
    const { t, i18n } = useTranslation();
    const [settlements, setSettlements] = useState([]);
    const { searchCriteria, createAd } = useCommunityContext();
    const { profileData } = useAuthContext();
 
    const currentLanguage = i18n.language;
    const navigate=useNavigate()
    const getEmailPrefix = (email) => {
        return email.split('@')[0];
    }

    const emailPrefix = getEmailPrefix(profileData.email);

    const getAdTownValue = (language, settlement) => {
        if (!settlement) return '';
        return language === 'bg' ? settlement.bg : settlement.en;
    };


    const initialValues = {
        summary: '',
        category: 'recommend',
        description: '',
        adTown: '',
        adAddress: `${profileData.details.settlement}, ул. ${profileData.details.street}, ${profileData.details.streetNumber}`,
        // useOtherCity: false
    };

    const handleNavigate = () => {
        navigate('/craigslist')
    }

    useEffect(() => {
        const fetchData = async () => {
            const addressId = JSON.parse(localStorage.getItem('addressId'));
            if (addressId) {
                try {
                    const response = await fetch(`/regions-data/region-${addressId.regionId}/towns/towns-${addressId.municipalityId}.json`);
                    const data = await response.json();
                    // console.log(data, "blabla");
                    setSettlements(data);
                    const settlement = data.find(settlement => settlement.id === addressId.settlementId);

                    if (settlement) {
                        setValues((state) => ({
                            ...state,
                            adTown: getAdTownValue(currentLanguage, settlement)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to load data', error);//to implement notification 
                }
            }
        };

        fetchData();
    }, [currentLanguage]);


    const { onChangeHandler, onBlurHandler, values, onSubmit, setValues, errors, images, handleImageChange } = useFormCreate(initialValues, async (formData) => {
        try {
            await createAd(formData);
            console.log('Ad created successfully');//to implement notification 
        } catch (error) {
            console.error('Error creating ad:', error); //to implementnotification
        }
    }, emailPrefix);

    return (
        <>
            <section className="ad-community-background">
                <HeaderCommunity />
                <section className="create-ad-main">
                    <div className="ad-card-create">
                        <h2 className="ad--card-title">Публикувай обява</h2>
                        <div className="ad-create-form">
                            <form onSubmit={onSubmit}>
                                <div className="ad-info-desc">
                                    <div className="form-group">
                                        <label htmlFor="summary">Име на обявата</label>
                                        <input
                                            type="text"
                                            id="summary"
                                            name="summary"
                                            value={values.adTitle}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                        />
                                        {errors.summary && <p className="error">{errors.summary}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="category">Категория</label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={values.category}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                        >
                                            {searchCriteria.searchCriteria?.map((criteria) => (
                                                <option key={criteria.value} value={criteria.value}>
                                                    {t(criteria.name)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="error">{errors.category}</p>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Описание</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={values.description}
                                        onChange={onChangeHandler}
                                        onBlur={onBlurHandler}
                                        required
                                    />
                                    {errors.description && <p className="error">{errors.description}</p>}
                                </div>
                                <div className="address-check">
                                    <div className="ad-address">
                                        <div className="form-group">
                                            <label htmlFor="adTown">Град</label>
                                            {<input
                                                type="text"
                                                id="adTown"
                                                name="adTown"
                                                value={values.adTown}
                                                onChange={onChangeHandler}
                                                onBlur={onBlurHandler}
                                                required
                                                disabled={!values.useOtherCity}
                                            />}
                                            {errors.adTown && <p className="error">{errors.adTown}</p>}
                                        </div>
                                        <div className="checkbox-group useOtherCity">
                                            <input
                                                type="checkbox"
                                                id="useOtherCity"
                                                name="useOtherCity"
                                                checked={values.useOtherCity}
                                                onChange={(e) => setValues((state) => ({ ...state, useOtherCity: e.target.checked }))}
                                            />
                                            <label htmlFor="useOtherCity">Искам да избера друг град</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="adAddress">Адрес</label>
                                        <input
                                            type="text"
                                            id="adAddress"
                                            name="adAddress"
                                            value={values.adAddress}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                        />
                                        {errors.adAddress && <p className="error">{errors.adAddress}</p>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Добави снимки</label>
                                    <div className="image-upload-container">
                                        {images.map((image, index) => (
                                            <div key={index} className="image-upload">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    multiple
                                                />
                                                {image ? (
                                                    <img src={image} alt={`Upload ${index + 1}`} />
                                                ) : (
                                                    <FontAwesomeIcon icon={faPlus} className="plus-icon-ad" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="button-group">
                                    <button type="submit" className="publish-button">Публикувай</button>
                                    <button type="button" className="cancel-button" onClick={handleNavigate}>Откажи</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                <CommunityFooter />
            </section>
        </>
    );
};

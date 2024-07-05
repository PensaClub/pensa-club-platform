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
import DatePicker from 'react-datepicker';
import { v4 } from 'uuid';

export const CreateAd = () => {
    const { t, i18n } = useTranslation();
    // eslint-disable-next-line no-unused-vars
    const [settlements, setSettlements] = useState([]);
    const { searchCriteria, createAd } = useCommunityContext();
    const { profileData } = useAuthContext();

    const currentLanguage = i18n.language;
    const navigate = useNavigate()
    const getEmailPrefix = (email) => {
        return email.split('@')[0];
    }

    const emailPrefix = getEmailPrefix(profileData.email);

    const getAdTownValue = (language, settlement) => {
        if (!settlement) return '';
        return language === 'bg' ? settlement.bg : settlement.en;
    };

    const initialValues = {
        adId: v4(),
        summary: '',
        category: '',
        description: '',
        adTown: getAdTownValue(currentLanguage, profileData.details.settlement),
        adAddress: `${profileData.details.settlement}, ул. ${profileData.details.street}, ${profileData.details.streetNumber}`,
        useOtherCity: false,
        price: '',
        startCourse: null,
        endCourse: null,
        priceCourse: '',
        startTours: null,
        endTours: null,
        priceTours: '',
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
                    setSettlements(data);
                    const settlement = data.find(settlement => settlement.id === addressId.settlementId);

                    if (settlement) {
                        setValues((state) => ({
                            ...state,
                            adTown: getAdTownValue(currentLanguage, settlement)
                        }));
                    }
                } catch (error) {
                    console.error('Failed to load data', error);
                }
            }
        };

        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLanguage]);

    const { onChangeHandler, onBlurHandler, values, onSubmit, setValues, errors, images, handleImageChange } = useFormCreate(initialValues, async (formData) => {
        try {
            await createAd(formData);

        } catch (error) {
            console.error('Error creating ad:', error);
        }
    }, emailPrefix);

    return (
        <>
            <section className="ad-community-background">
                <HeaderCommunity />
                <section className="create-ad-main">
                    <div className="ad-card-create">
                        <h2 className="ad--card-title">{t('ads.publish_ad')}</h2>
                        <div className="ad-create-form">
                            <form onSubmit={onSubmit}>
                                <div className="ad-info-desc">
                                    <div className="form-group">
                                        <label htmlFor="summary">{t('ads.summary')}</label>
                                        <input
                                            type="text"
                                            id="summary"
                                            name="summary"
                                            value={values.summary}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                        />
                                        <p className='desc-sub-text'>{t('ads.sub_text-one')}</p>

                                        {errors.summary && <p className="error">{errors.summary}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="category">{t('ads.category_ad')}</label>
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
                                {values.category === 'sell' && (
                                    <div className="form-group">
                                        <label htmlFor="price">{t('ads.price')}</label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={values.price}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            placeholder='0'
                                            required
                                        />
                                        {errors.price && <p className="error">{errors.price}</p>}
                                    </div>
                                )}
                                {values.category === 'courses' && (
                                    <div className="additional-fields-price">
                                        <div className="form-group">
                                            <label htmlFor="startCourse">{t('ads.start_course')}</label>
                                            <DatePicker
                                                selected={values.startCourse}
                                                onChange={(date) => setValues((state) => ({ ...state, startCourse: date }))}
                                                onBlur={onBlurHandler}
                                                dateFormat="dd/MM/yyyy"
                                                id="startCourse"
                                                name="startCourse"
                                            />
                                            {errors.startCourse && <p className="error">{errors.startCourse}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="endCourse">{t('ads.end_course')}</label>
                                            <DatePicker
                                                selected={values.endCourse}
                                                onChange={(date) => setValues((state) => ({ ...state, endCourse: date }))}
                                                onBlur={onBlurHandler}
                                                dateFormat="dd/MM/yyyy"
                                                id="endCourse"
                                                name="endCourse"
                                            />
                                            {errors.endCourse && <p className="error">{errors.endCourse}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="priceCourse">{t('ads.price_course')}</label>
                                            <input
                                                type="number"
                                                id="priceCourse"
                                                name="priceCourse"
                                                value={values.priceCourse}
                                                onChange={onChangeHandler}
                                                onBlur={onBlurHandler}
                                                placeholder='0'
                                                required
                                            />
                                            {errors.priceCourse && <p className="error">{errors.priceCourse}</p>}
                                        </div>
                                    </div>
                                )}
                                {values.category === 'tours' && (
                                    <div className="additional-fields-price">
                                        <div className="form-group">
                                            <label htmlFor="startTours">{t('ads.start_tours')}</label>
                                            <DatePicker
                                                selected={values.startTours}
                                                onChange={(date) => setValues((state) => ({ ...state, startTours: date }))}
                                                onBlur={onBlurHandler}
                                                dateFormat="dd/MM/yyyy"
                                                id="startTours"
                                                name="startTours"
                                            />
                                            {errors.startTours && <p className="error">{errors.startTours}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="endTours">{t('ads.end_tours')}</label>
                                            <DatePicker
                                                selected={values.endTours}
                                                onChange={(date) => setValues((state) => ({ ...state, endTours: date }))}
                                                onBlur={onBlurHandler}
                                                dateFormat="dd/MM/yyyy"
                                                id="endTours"
                                                name="endTours"
                                            />
                                            {errors.endTours && <p className="error">{errors.endTours}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="priceTours">{t('ads.price_tours')}</label>
                                            <input
                                                type="number"
                                                id="priceTours"
                                                name="priceTours"
                                                value={values.priceTours}
                                                onChange={onChangeHandler}
                                                onBlur={onBlurHandler}
                                                placeholder='0'
                                                required
                                            />
                                            {errors.priceTours && <p className="error">{errors.priceTours}</p>}
                                        </div>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label htmlFor="description">{t('ads.description')}</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={values.description}
                                        onChange={onChangeHandler}
                                        onBlur={onBlurHandler}
                                        required
                                    />
                                    <p className='desc-sub-text'>{t('ads.sub_text-two')}</p>

                                    {errors.description && <p className="error">{errors.description}</p>}
                                </div>
                                <div className="address-check">
                                    <div className="ad-address">
                                        <div className="form-group">
                                            <label htmlFor="adTown">{t('ads.ad_town')}</label>
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
                                            <label htmlFor="useOtherCity">{t('ads.use_other_city')}</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="adAddress">{t('ads.ad_address')}</label>
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
                                    <label>{t('ads.add_photos')}</label>
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
                                    <button type="submit" className="publish-button">{t('ads.publish_btn')}</button>
                                    <button type="button" className="cancel-button" onClick={handleNavigate}>{t('ads.cancel_btn')}</button>
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

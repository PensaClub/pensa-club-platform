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
    const [fieldDefinitions, setFieldDefinitions] = useState({});
    const { searchCriteria, createAd } = useCommunityContext();
    const { profileData } = useAuthContext();

    const currentLanguage = i18n.language;
    const navigate = useNavigate();
    const getEmailPrefix = (email) => {
        return email.split('@')[0];
    }

    const emailPrefix = getEmailPrefix(profileData.email);

    const getAdTownValue = (language, settlement) => {
        if (!settlement || !settlement.bg || !settlement.en) return '';
        return language === 'bg' ? settlement.bg : settlement.en;
    };

    const initialValues = {
        adId: v4(),
        summary: '',
        category: 'donate',
        description: '',
        adTown: profileData.details.settlement ? getAdTownValue(currentLanguage, profileData.details.settlement) : '',
        street: `${profileData.details.settlement}, ул. ${profileData.details.street}, ${profileData.details.streetNumber}`,
        useOtherCity: false,
        extraFields: {
            price: '',
            eventStartDate: null,
            eventEndDate: null,
        },
    };

    const handleNavigate = () => {
        navigate('/craigslist');
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

    useEffect(() => {
        const loadFieldDefinitions = async () => {
            try {
                const response = await fetch('/fieldDefinitions.json');
                const data = await response.json();
                setFieldDefinitions(data);
            } catch (error) {
                console.error('Failed to load field definitions', error);
            }
        };

        loadFieldDefinitions();
    }, []);

    const { onChangeHandler, onBlurHandler, values, onSubmit, setValues, errors, images, handleImageChange } = useFormCreate(initialValues, async (formData) => {
        try {
            await createAd(formData);

        } catch (error) {
            console.error('Error creating ad:', error);
        }
    }, emailPrefix);

    const renderFields = () => {
        const fields = fieldDefinitions.fields?.[values.category] || [];
        return fields.length > 0 ? (
          <div className="additional-fields-price">
            {fields.map((field, index) => (
              <div key={index} className="form-group">
                <label htmlFor={field.name}>{t(`ads.${field.subname}`)}</label>
                {field.type === 'date' ? (
                  <DatePicker
                    selected={values.extraFields[field.name]}
                    onChange={(date) => setValues((state) => ({
                      ...state,
                      extraFields: { ...state.extraFields, [field.name]: date },
                    }))}
                    onBlur={onBlurHandler}
                    dateFormat="yyyy-MM-dd"
                    id={field.name}
                    name={field.name}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={values.extraFields[field.name] || ''}
                    onChange={onChangeHandler}
                    onBlur={onBlurHandler}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                {errors.extraFields && errors.extraFields[field.name] && (
                  <p className="error">{errors.extraFields[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        ) : null;
      };
      
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
                                {renderFields()}
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
                                            <input
                                                type="text"
                                                id="adTown"
                                                name="adTown"
                                                value={values.adTown}
                                                onChange={onChangeHandler}
                                                onBlur={onBlurHandler}
                                                required
                                                disabled={!values.useOtherCity}
                                            />
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
                                        <label htmlFor="street">{t('ads.ad_address')}</label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="street"
                                            value={values.street}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                        />
                                        {errors.street && <p className="error">{errors.street}</p>}
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

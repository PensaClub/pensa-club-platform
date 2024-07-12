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
import { TagInput } from './TagInput';

export const CreateAd = () => {
    const { t, i18n } = useTranslation();
    const [fieldDefinitions, setFieldDefinitions] = useState({});
    const [towns, setTowns] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTown, setSelectedTown] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedSubregion, setSelectedSubregion] = useState('');
    const { regions, subregions, fetchSubregions, fetchTowns, searchCriteria, createAd } = useCommunityContext();
    const { profileData } = useAuthContext();

    const currentLanguage = i18n.language;
    const navigate = useNavigate();
    const getEmailPrefix = (email) => email.split('@')[0];

    const emailPrefix = getEmailPrefix(profileData.email);

    const getAdTownValue = (language, settlement) => {
        if (!settlement || !settlement.bg || !settlement.en) return '';
        return language === 'bg' ? settlement.bg : settlement.en;
    };

    const getAdRegionValue = (language, regionId) => {
        const region = regions.find(region => region.id === regionId);
        if (!region) return '';
        return language === 'bg' ? region.bg : region.en;
    };

    const getAdSubregionValue = (language, regionId, subregionId) => {
        const subregionList = subregions[regionId];
        if (!subregionList) return '';
        const subregion = subregionList.find(subregion => subregion.id === subregionId);

        if (!subregion) return '';
        return language === 'bg' ? subregion.bg : subregion.en;
    };

    const initialValues = {
        adId: v4(),
        summary: '',
        category: 'donate',
        description: '',
        adRegion: profileData.details.region || '',
        adSubregion: profileData.details.subregion || '',
        adTown: profileData.details.settlement ? getAdTownValue(currentLanguage, profileData.details.settlement) : '',
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

    // useEffect(() => {
    //     fetchRegions();
    // }, []);

    useEffect(() => {
        if (selectedRegion) {
            fetchSubregions(selectedRegion);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedRegion && selectedSubregion) {
            fetchTowns(selectedRegion, selectedSubregion).then(setTowns);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion, selectedSubregion]);

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
    useEffect(() => {
        const fetchData = async () => {
            const addressId = JSON.parse(localStorage.getItem('addressId'));
            if (addressId) {
                try {
                    const region = regions.find(region => region.id === addressId.regionId);

                    if (!subregions[addressId.regionId] || subregions[addressId.regionId].length === 0) {
                        await fetchSubregions(addressId.regionId);
                    }

                    const subregion = (subregions[addressId.regionId] || []).find(subregion => subregion.id === addressId.municipalityId);

                    let townList = settlements;
                    if (!townList.length) {
                        const townResponse = await fetch(`/regions-data/region-${addressId.regionId}/towns/towns-${addressId.municipalityId}.json`);
                        townList = await townResponse.json();
                        setSettlements(townList);
                    }

                    const town = townList.find(settlement => settlement.id === addressId.settlementId);

                    if (region && subregion && town) {
                        setSelectedRegion(prev => prev || addressId.regionId);
                        setSelectedSubregion(prev => prev || addressId.municipalityId);
                        setSelectedTown(prev => prev || town.id);
                        setValues((state) => ({
                            ...state,
                            adRegion: addressId.regionId ? getAdRegionValue(currentLanguage, addressId.regionId) : state.adRegion,
                            adSubregion: addressId.municipalityId ? getAdSubregionValue(currentLanguage, addressId.regionId, addressId.municipalityId) : state.adSubregion,
                            adTown: town ? getAdTownValue(currentLanguage, town) : state.adTown,
                        }));
                    }
                } catch (error) {
                    console.error('Failed to load data', error);
                }
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLanguage, regions, subregions]);

    useEffect(() => {
        if (selectedRegion && selectedSubregion) {
            fetchTowns(selectedRegion, selectedSubregion).then(setSettlements);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubregion, selectedRegion]);

    const handleNavigate = () => navigate('/craigslist');

    const { onChangeHandler, onBlurHandler, values, onSubmit, setValues, errors, images, handleImageChange } = useFormCreate(initialValues, async (formData) => {
        const region = regions.find(region => region.id === Number(formData.adRegion));
        const subregion = subregions[selectedRegion]?.find(subregion => subregion.id === Number(formData.adSubregion));
        const town = towns.find(town => town.id === Number(formData.adTown));

        const regionName = region ? region[currentLanguage] : profileData.details.region;
        const subregionName = subregion ? subregion[currentLanguage] : getAdSubregionValue(currentLanguage, selectedRegion, selectedSubregion)
        const townName = town ? town[currentLanguage] : profileData.details.settlement;
        const updatedFormData = {
            ...formData,
            adRegion: regionName,
            adSubregion: subregionName,
            adTown: townName,
            tags
        };

        try {
            await createAd(updatedFormData);
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
                                selected={values[field.name]}
                                onChange={(date) => setValues((state) => ({ ...state, [field.name]: date }))}
                                onBlur={onBlurHandler}
                                dateFormat="dd/MM/yyyy"
                                id={field.name}
                                name={field.name}
                                required={field.required}
                            />
                        ) : (
                            <input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={values[field.name] || ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                placeholder={field.placeholder}
                                required={field.required}
                            />
                        )}
                        {errors[field.name] && <p className="error">{errors[field.name]}</p>}
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
                                <TagInput tags={tags} setTags={setTags} t={t}/>
                                <div className="address-check">
                                    <div className="ad-address">
                                        <div className="ad-regions">
                                            <div className="form-group">
                                                <label htmlFor="adRegion">{t('ads.ad_region')}</label>
                                                <select
                                                    id="adRegion"
                                                    name="adRegion"
                                                    value={selectedRegion}
                                                    onChange={(e) => {
                                                        setSelectedRegion(e.target.value);
                                                        setValues((state) => ({ ...state, adRegion: e.target.value, adSubregion: '', adTown: '' }));
                                                    }}
                                                    onBlur={onBlurHandler}
                                                    required
                                                    disabled={!values.useOtherCity}
                                                >
                                                    <option value="">{t('community.select_region')}</option>
                                                    {regions.map((region) => (
                                                        <option key={region.id} value={region.id}>
                                                            {currentLanguage === 'bg' ? region.bg : region.en}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.adRegion && <p className="error">{errors.adRegion}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="adSubregion">{t('ads.ad_municipality')}</label>
                                                <select
                                                    id="adSubregion"
                                                    name="adSubregion"
                                                    value={selectedSubregion}
                                                    onChange={(e) => {
                                                        setSelectedSubregion(e.target.value);
                                                        setValues((state) => ({ ...state, adSubregion: e.target.value, adTown: '' }));
                                                    }}
                                                    onBlur={onBlurHandler}
                                                    required
                                                    disabled={!values.useOtherCity || !selectedRegion}
                                                >
                                                    <option value="">{t('community.select_municipality')}</option>
                                                    {selectedRegion && subregions[selectedRegion]?.map((subregion) => (
                                                        <option key={subregion.id} value={subregion.id}>
                                                            {currentLanguage === 'bg' ? subregion.bg : subregion.en}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.adSubregion && <p className="error">{errors.adSubregion}</p>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="adTown">{t('ads.ad_town')}</label>
                                                <select
                                                    id="adTown"
                                                    name="adTown"
                                                    value={selectedTown}
                                                    onChange={(e) => {
                                                        setSelectedTown(e.target.value);
                                                        setValues((state) => ({ ...state, adTown: e.target.value }));
                                                    }}
                                                    onBlur={onBlurHandler}
                                                    required
                                                    disabled={!values.useOtherCity || !selectedSubregion}
                                                >
                                                    <option value="">{t('ads.select_town')}</option>
                                                    {selectedSubregion && settlements.map((town) => (
                                                        <option key={town.id} value={town.id}>
                                                            {currentLanguage === 'bg' ? town.bg : town.en}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.adTown && <p className="error">{errors.adTown}</p>}
                                            </div>
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
                                            disabled={!values.useOtherCity}
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

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { handleReset, validateField, trimObjectStrings } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';


const ProfileAddress = () => {

    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const initialFormState = {
        region: profileData.details.region || '',
        regionId: profileData.details.regionId || '',
        municipality: profileData.details.municipality || '',
        municipalityId: profileData.details.municipalityId || '',
        settlement: profileData.details.settlement || '',
        settlementId: profileData.details.settlementId || '',
        district: profileData.details.district || '',
        block: profileData.details.block || '',
        street: profileData.details.street || '',
        streetNumber: profileData.details.streetNumber || '',
    };

    const { profileData, onEditProfileDataSubmit } = useContext(UserContext);
    const navigate = useNavigate();
    const [form, setForm] = useState(initialFormState);
    const [regions, setRegions] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [errors, setErrors] = useState({});

    let currRegion;
    let currMunicipality;
    let currSettlement;


    //     useEffect(() => {
    //         const loadRegions = async () => {
    //             try {
    //                 const response = await fetch('/regions.json');
    //                 const data = await response.json();

    //                 setRegions(data);
    //             } catch (error) {
    //                 console.error('Failed to load regions data', error);
    //             }
    //         };
    //         loadRegions();
    //     }, []);

    //     const handleRegionChange = async (e) => {
    //         const regionId = e.target.value;

    //         setForm({ ...form, region: regionId, municipality: '', settlement: '' });
    //         setMunicipalities([]);
    //         setSettlements([]);

    //         try {
    //             const response = await fetch(`/regions-data/region-${regionId}/subregions-${regionId}.json`);

    //             const data = await response.json();

    //             setMunicipalities(data);
    //         } catch (error) {
    //             console.error('Failed to load municipalities data', error);
    //         }
    //     };




    useEffect(() => {
        const loadRegions = async () => {
            try {
                const response = await fetch('/regions.json');
                const data = await response.json();
                setRegions(data);
            } catch (error) {
                console.error('Failed to load regions data', error);
            }
        };
        const loadMunicipalities = async () => {
            let regionId;
            const regionName = form.region;
            const region = regions.filter((region) => region.bg == regionName);
            console.log(region[0]);
            if (region[0]) {
                regionId = region[0].id;
            }
            setForm({ ...form, regionId });

            try {
                if (regionId) {
                    const response = await fetch(
                        `/regions-data/region-${regionId}/subregions-${regionId}.json`
                    );

                    const data = await response.json();
                    setMunicipalities(data);
                } else {
                    console.log('No regionId');
                }
            } catch (error) {
                console.error('Failed to load municipalities data', error);
            }
        };

        const loadSettlements = async () => {
            const municipalityName = form.municipality;
            console.log(municipalityName);
            const municipalityId = await municipalities.filter((municipality) => municipality.bg == municipalityName)[0].id;
            console.log(municipalityId);
            setForm({ ...form, municipalityId });

            try {
                const response = await fetch(
                    `/regions-data/region-${form.regionId}/towns/towns-${municipalityId}.json`
                );
                const data = await response.json();
                setSettlements(data);
            } catch (error) {
                console.error('Failed to load settlements data', error);
            }
        };

        const setSettlemntId = async () => {
            const settlementName = form.settlement;
            console.log(settlementName);
            const settlementId = await settlements.filter((settlement) => settlement.bg === settlementName)[0].id;
            console.log(settlementId);
            setForm({ ...form, settlementId });
        }

        loadRegions()
            .then(() => loadMunicipalities())
            .then(() => loadSettlements())
            .then(() => setSettlemntId)
            .then(console.log(form))
            .catch((err) => console.log(err));
    }, []);


    const handleRegionChange = async (e) => {
        const regionId = e.target.value;
        const currRegion = regions.filter((region) => region.id == regionId);
        const regionName = currRegion[0].bg;


        setForm({
            ...form,
            regionId: regionId,
            region: regionName,
            municipality: '',
            settlement: '',
        });
        setMunicipalities([]);
        setSettlements([]);

        try {
            const response = await fetch(
                `/regions-data/region-${form.regionId}/subregions-${form.regionId}.json`
            );

            const data = await response.json();


            setMunicipalities(data);
        } catch (error) {
            console.error('Failed to load municipalities data', error);
        }
    };

    const handleMunicipalityChange = async (e) => {
        const municipalityId = e.target.value;
        const currMunicipality = municipalities.filter(
            (municipality) => municipality.id == municipalityId
        );
        const municipalityName = currMunicipality[0].bg;

        setForm({
            ...form,
            municipalityId: municipalityId,
            municipality: municipalityName,
            settlement: '',
        });
        setSettlements([]);

        try {
            const response = await fetch(
                `/regions-data/region-${form.regionId}/towns/towns-${form.municipalityId}.json`
            );
            const data = await response.json();
            setSettlements(data);
        } catch (error) {
            console.error('Failed to load settlements data', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedForm = trimObjectStrings(form);
        setForm(trimmedForm);

        const validationErrors = {};
        let isValid = true;

        Object.keys(trimmedForm).forEach((field) => {
            const value = trimmedForm[field];
            const error = validateField(field, value, trimmedForm, t);
            if (error) {
                isValid = false;
                validationErrors[field] = error;
            }
        });

        setErrors(validationErrors);

        if (isValid) {
            console.log('Form Submitted:', trimmedForm);
            try {
                const updatedDataArr = Object.entries(form).filter(
                    ([key, value]) => initialFormState[key] !== value
                );
                const updatedData = Object.fromEntries(updatedDataArr);
                onEditProfileDataSubmit(updatedData);
                console.log('Address Submitted:', updatedData);
                navigate('/profile');
            } catch (error) {
                console.log(`Error Profile Address Submit Component: ${error.message}`);
            }
        }

    };

    const onBlurHandler = (e) => {
        const { name, value } = e.target;

        const error = validateField(name, value, form, t);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

    }
    const handleResetForm = () => {
        handleReset(setForm, initialFormState);
    };
        return (
            <form onSubmit={handleSubmit} className="profile-form">
                <h3>{t('profile.address_form')}</h3>

                <label>
                    {t('profile.region')}: <span>*</span>
                    <select name="region" value={form.region} onChange={handleRegionChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.region ? '#BB1D3D' : '' }}
                    >
                        <option value="">{t('profile.select_region')}</option>
                        {regions.map((region, index) => (
                            <option key={index} value={region.id}>
                                {currentLanguage === 'bg' && `${region.bg}`}
                                {currentLanguage === 'en' && `${region.en}`}
                            </option>
                        ))}
                    </select>
                    {errors.region && <span className="error">{errors.region}</span>}
                </label>
                <label>
                    {t('profile.municipality')}: <span>*</span>
                    <select name="municipality" value={form.municipality} onChange={handleMunicipalityChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.municipality ? '#BB1D3D' : '' }}
                    >
                        <option value="">{t('profile.select_municipality')}</option>
                        {municipalities.map((municipality, index) => (
                            <option key={index} value={municipality.id}>
                                {currentLanguage === 'bg' && `${municipality.bg}`}
                                {currentLanguage === 'en' && `${municipality.en}`}
                            </option>
                        ))}
                    </select>
                    {errors.municipality && <span className="error">{errors.municipality}</span>}
                </label>
                <label>
                    {t('profile.settlement')}: <span>*</span>
                    <select name="settlement" value={form.settlement} onChange={handleInputChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.settlement ? '#BB1D3D' : '' }}
                    >
                        <option value="">{t('profile.select_settlement')}</option>
                        {settlements.map((settlement, index) => (
                            <option key={index} value={settlement.id}>
                                {currentLanguage === 'bg' && `${settlement.bg}`}
                                {currentLanguage === 'en' && `${settlement.en}`}
                            </option>
                        ))}
                    </select>
                    {errors.settlement && <span className="error">{errors.settlement}</span>}
                </label>
                <label>
                    {t('profile.district')}:
                    <input type="text" name="district" value={form.district} onChange={handleInputChange} />
                    {errors.district && <span className="error">{errors.district}</span>}
                </label>
                <label>
                    {t('profile.block')}:
                    <input type="text" name="block" value={form.block} onChange={handleInputChange} />
                    {errors.block && <span className="error">{errors.block}</span>}
                </label>
                <label>
                    {t('profile.street')}: <span>*</span>
                    <input type="text" name="street" value={form.street} onChange={handleInputChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.street ? '#BB1D3D' : '' }}
                    />
                    {errors.street && <span className="error">{errors.street}</span>}
                </label>
                <label>
                    {t('profile.street_number')}:
                    <input type="text" name="streetNumber" value={form.streetNumber} onChange={handleInputChange} onBlur={onBlurHandler}
                        style={{ borderColor: errors.streetNumber ? '#BB1D3D' : '' }}
                    />
                    {errors.streetNumber && <span className="error">{errors.streetNumber}</span>}
                </label>
                <span className="required-fields">{t('profile.required_fields')}</span>
                <div className="btn-inline">
                    <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                    <button type="submit" className="btn-general btn-red" onClick={handleResetForm}>{t('profile.close_btn')}</button>
                </div>
            </form>
        )
    };

export default ProfileAddress;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { handleReset } from '../../utils/profile';

const ProfileAddress= () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const navigate = useNavigate();

    const [form, setForm] = useState({
        region: '',
        municipality: '',
        settlement: '',
        district: '',
        block: '',
        street: '',
        streetNumber: ''
    });
    const [regions, setRegions] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [errors, setErrors] = useState({});

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
        loadRegions();
    }, []);

    const handleRegionChange = async (e) => {
        const regionId = e.target.value;

        setForm({ ...form, region: regionId, municipality: '', settlement: '' });
        setMunicipalities([]);
        setSettlements([]);

        try {
            const response = await fetch(`/regions-data/region-${regionId}/subregions-${regionId}.json`);

            const data = await response.json();

            setMunicipalities(data);
        } catch (error) {
            console.error('Failed to load municipalities data', error);
        }
    };

    const handleMunicipalityChange = async (e) => {
        const municipalityId = e.target.value;
        setForm({ ...form, municipality: municipalityId, settlement: '' });
        setSettlements([]);

        try {
            const response = await fetch(`/regions-data/region-${form.region}/towns/towns-${municipalityId}.json`);
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

        const trimmedForm = {};
        for (const key in form) {
            if (form.hasOwnProperty(key)) {
                trimmedForm[key] = typeof form[key] === 'string' ? form[key].trim() : form[key];
            }
        }
        setForm(trimmedForm);

        const isValid = Object.keys(trimmedForm).every((field) => {
            const value = trimmedForm[field];
            validateField(field, value);
            return !errors[field];
        });

        if (isValid) {
            console.log('Form Submitted:', trimmedForm);
            navigate('/profile');
        }
    };

    const onBlurHandler = (e) => {
        const { name, value } = e.target;
        validateField(name, value);

    };

    const handleResetForm = () => {
        handleReset(setForm, form = []);
    };
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'region':
                if (!value) error = t('profile.region_required');
                break;
            case 'municipality':
                if (!value) error = t('profile.municipality_required');
                break;
            case 'settlement':
                if (!value) error = t('profile.settlement_required');
                break;
            case 'street':
                if (!value) error = t('profile.street_required');
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
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
    );
};

export default ProfileAddress;

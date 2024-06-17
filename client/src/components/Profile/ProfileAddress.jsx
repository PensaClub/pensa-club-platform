import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileAddress= () => {
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

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'region':
                if (!value) error = 'Регионът е задължителен';
                break;
            case 'municipality':
                if (!value) error = 'Общината е задължителна';
                break;
            case 'settlement':
                if (!value) error = 'Населеното място е задължително';
                break;
            case 'street':
                if (!value) error = 'Улицата е задължителна';
                break;
            case 'streetNumber':
                if (!value) error = 'Номерът на улицата е задължителен';
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };


    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <h3>Адресна форма</h3>
                
            <label>
                Област (Region): <span>*</span>
                <select name="region" value={form.region} onChange={handleRegionChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.region ? '#BB1D3D' : '' }}
                >
                    <option value="">Изберете регион</option>
                    {regions.map((region, index) => (
                        <option key={index} value={region.id}>{region.bg}</option>
                    ))}
                </select>
                {errors.region && <span className="error">{errors.region}</span>}
            </label>
            <label>
                Oбщина (Municipality): <span>*</span>
                <select name="municipality" value={form.municipality} onChange={handleMunicipalityChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.municipality ? '#BB1D3D' : '' }}
                >
                    <option value="">Изберете община</option>
                    {municipalities.map((municipality, index) => (
                        <option key={index} value={municipality.id}>{municipality.bg}</option>
                    ))}
                </select>
                {errors.municipality && <span className="error">{errors.municipality}</span>}
            </label>
            <label>
                Населено място (Settlement): <span>*</span>
                <select name="settlement" value={form.settlement} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.settlement ? '#BB1D3D' : '' }}
                >
                    <option value="">Избетере населено място</option>
                    {settlements.map((settlement, index) => (
                        <option key={index} value={settlement.id}>{settlement.bg}</option>
                    ))}
                </select>
                {errors.settlement && <span className="error">{errors.settlement}</span>}
            </label>
            <label>
                Квартал (District):
                <input type="text" name="district" value={form.district} onChange={handleInputChange} />
                {errors.district && <span className="error">{errors.district}</span>}
            </label>
            <label>
                Блок (Block):
                <input type="text" name="block" value={form.block} onChange={handleInputChange} />
                {errors.block && <span className="error">{errors.block}</span>}
            </label>
            <label>
                Улица (Street): <span>*</span>
                <input type="text" name="street" value={form.street} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.street ? '#BB1D3D' : '' }}
                />
                {errors.street && <span className="error">{errors.street}</span>}
            </label>
            <label>
                Номер улица (Street Number): <span>*</span>
                <input type="text" name="streetNumber" value={form.streetNumber} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.streetNumber ? '#BB1D3D' : '' }}
                />
                {errors.streetNumber && <span className="error">{errors.streetNumber}</span>}
            </label>
            <span className="required-fields">Полетата с * са задължителни!</span>
            <button className="btn-general btn-green btn-profile" type="submit">Запази</button>
        </form>
    );
};

export default ProfileAddress;

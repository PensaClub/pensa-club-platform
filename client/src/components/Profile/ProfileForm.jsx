import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfileForm = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
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
            const response = await fetch(`/region-${regionId}/towns/subregions-${regionId}.json`);
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
        const response = await fetch(`/region-${form.region}/towns/towns-${municipalityId}.json`);
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
        if (validateForm()) {
            console.log('Form Submitted:', form);
        }
    };

    const validateForm = () => {
        return form.region && form.municipality && form.settlement && form.district && form.block && form.street && form.streetNumber;
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <h3>Попълнете данните си</h3>
            
                <div className="avatar">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <Link to="#" className="change-avatar-link">Смени снимка</Link>
                </div>
                <div className="user-data">
                    <div>
                        <label htmlFor="username">Потребителско име: <span>*</span></label>
                        <input type="text" id="username" name="username" />
                    </div>
                   
                    <div>

                        <label htmlFor="firstName">Име:</label>
                        <input type="text" id="firstName" name="firstName" />
                    </div>
                    <div>
                        <label htmlFor="lastName">Фамилия:</label>
                        <input type="text" id="lastName" name="lastName" />
                    </div>
                

                <div>
                    <label htmlFor="phoneNumber">Телефон: <span>*</span></label>
                    <input type="text" id="phoneNumber" name="phoneNumber" />
                </div>
              
            </div>

            <label>
                Област (Region): <span>*</span>
                <select name="region" value={form.region} onChange={handleRegionChange} required>
                    <option value="">Изберете регион</option>
                    {regions.map((region, index) => (
                        <option key={index} value={region.id}>{region.bg}</option>
                    ))}
                </select>
            </label>
            <label>
                Oбщина (Municipality): <span>*</span>
                <select name="municipality" value={form.municipality} onChange={handleMunicipalityChange} required>
                    <option value="">Изберете община</option>
                    {municipalities.map((municipality, index) => (
                        <option key={index} value={municipality.id}>{municipality.bg}</option>
                    ))}
                </select>
            </label>
            <label>
                Населено място (Settlement): <span>*</span>
                <select name="settlement" value={form.settlement} onChange={handleInputChange} required>
                    <option value="">Избетере населено място</option>
                    {settlements.map((settlement, index) => (
                        <option key={index} value={settlement.id}>{settlement.bg}</option>
                    ))}
                </select>
            </label>
            <label>
                Квартал (District):
                <input type="text" name="district" value={form.district} onChange={handleInputChange} required />
            </label>
            <label>
                Блок (Block): <span>*</span>
                <input type="text" name="block" value={form.block} onChange={handleInputChange} required />
            </label>
            <label>
                Улица (Street): <span>*</span>
                <input type="text" name="street" value={form.street} onChange={handleInputChange} required />
            </label>
            <label>
                Номер улица (Street Number): <span>*</span>
                <input type="text" name="streetNumber" value={form.streetNumber} onChange={handleInputChange} required />
            </label>
            <button className="btn-general btn-green btn-profile" type="submit">Запази</button>
        </form>
    );
};

export default ProfileForm;

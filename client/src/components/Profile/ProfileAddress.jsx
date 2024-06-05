import React, { useState, useEffect } from 'react';


const ProfileAddress= () => {
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

    useEffect(() => {
        const loadRegions = async () => {
            try {
                const response = await import('../client/regions-data/regions.json');
                setRegions(response.default);
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
            const response = await import(`../client/regions-data/region-${regionId}/towns/subregions-${regionId}.json`);
            setMunicipalities(response.default);
        } catch (error) {
            console.error('Failed to load municipalities data', error);
        }
    };

    const handleMunicipalityChange = async (e) => {
        const municipalityId = e.target.value;
        setForm({ ...form, municipality: municipalityId, settlement: '' });
        setSettlements([]);

        try {
            const response = await import(`../client/regions-data/region-${form.region}/towns/towns-${municipalityId}.json`);
            setSettlements(response.default);
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
            <h3>Адресна форма</h3>
                
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
                Блок (Block): 
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
            <span className="required-fields">Полетата с * са задължителни!</span>
            <button className="btn-general btn-green btn-profile" type="submit">Запази</button>
        </form>
    );
};

export default ProfileAddress;

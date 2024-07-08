import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { handleReset, validateField, trimObjectStrings } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';

import { loadData } from '../../utils/loadData';
import { useMappingContext } from '../contexts/MapContext';

const ProfileAddress = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { profileData, onEditProfileDataSubmit, addressId } = useContext(UserContext);

  const [regions, setRegions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [errors, setErrors] = useState({});
  const { onAllUsers,  } = useMappingContext();

  const initialFormState = {
    region: profileData.details.region || '',
    regionId: addressId.regionId || '',
    municipality: profileData.details.municipality || '',
    municipalityId: addressId.municipalityId || '',
    settlement: profileData.details.settlement || '',
    settlementId: addressId.settlementId || '',
    district: profileData.details.district || '',
    block: profileData.details.block || '',
    street: profileData.details.street || '',
    streetNumber: profileData.details.streetNumber || '',
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    loadData('/regions.json')
      .then((data) => setRegions(data))
      .catch((err) => console.error(err.message));

    loadData(`/regions-data/region-${form.regionId}/subregions-${form.regionId}.json`)
      .then((data) => setMunicipalities(data))
      .catch((err) => console.error(err.message));

    loadData(`/regions-data/region-${form.regionId}/towns/towns-${form.municipalityId}.json`)
      .then((data) => setSettlements(data))
      .catch((err) => console.error(err.message));
  }, [form.municipalityId, form.regionId]);

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    const currRegion = regions.filter((region) => region.id === regionId);
    const regionName = currRegion[0].bg;

    setForm({
      ...form,
      regionId: regionId,
      region: regionName,
      municipalityId: '',
      municipality: '',
      settlementId: '',
      settlement: '',
    });
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
    const currMunicipality = municipalities.filter((municipality) => municipality.id === municipalityId);
    const municipalityName = currMunicipality[0].bg;

    setForm({
      ...form,
      municipalityId: municipalityId,
      municipality: municipalityName,
      settlementId: '',
      settlement: '',
    });
    setSettlements([]);

    try {
      const response = await fetch(`/regions-data/region-${form.regionId}/towns/towns-${municipalityId}.json`);
      const data = await response.json();
      setSettlements(data);
    } catch (error) {
      console.error('Failed to load settlements data', error);
    }
  };

  const handleSettlementChange = async (e) => {
    const settlementId = e.target.value;
    const currSettlement = settlements.filter((settlement) => settlement.id === settlementId);
    const settlementName = currSettlement[0].bg;

    setForm({
      ...form,
      settlementId: settlementId,
      settlement: settlementName,
    });
    setSettlements([]);

    try {
      const response = await fetch(`/regions-data/region-${form.regionId}/towns/towns-${form.municipalityId}.json`);
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
      try {
        onEditProfileDataSubmit(trimmedForm);
        onAllUsers();
        console.error('Address Submitted:', trimmedForm);
        navigate('/profile');
      } catch (error) {
        console.error(`Error Profile Address Submit Component: ${error.message}`);
      }
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;

    const error = validateField(name, value, form, t);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };
  const handleResetForm = () => {
    handleReset(setForm, initialFormState);
  };
  return (
    <form onSubmit={handleSubmit} className='profile-form'>
      <h3>{t('profile.address_form')}</h3>

      <label>
        {t('profile.region')}: <span>*</span>
        <select
          name='region'
          value={form.regionId}
          onChange={handleRegionChange}
          onBlur={onBlurHandler}
          required
          style={{ borderColor: errors.region ? '#BB1D3D' : '' }}
        >
          <option value=''>{t('profile.select_region')}</option>
          {regions.map((region, index) => (
            <option key={index} value={region.id}>
              {currentLanguage === 'bg' && `${region.bg}`}
              {currentLanguage === 'en' && `${region.en}`}
            </option>
          ))}
        </select>
        {errors.region && <span className='error'>{errors.region}</span>}
      </label>
      <label>
        {t('profile.municipality')}: <span>*</span>
        <select
          name='municipality'
          value={form.municipalityId}
          onChange={handleMunicipalityChange}
          onBlur={onBlurHandler}
          required
          style={{ borderColor: errors.municipality ? '#BB1D3D' : '' }}
        >
          <option value=''>{t('profile.select_municipality')}</option>
          {municipalities.map((municipality, index) => (
            <option key={index} value={municipality.id}>
              {currentLanguage === 'bg' && `${municipality.bg}`}
              {currentLanguage === 'en' && `${municipality.en}`}
            </option>
          ))}
        </select>
        {errors.municipality && <span className='error'>{errors.municipality}</span>}
      </label>
      <label>
        {t('profile.settlement')}: <span>*</span>
        <select
          name='settlement'
          value={form.settlementId}
          onChange={handleSettlementChange}
          onBlur={onBlurHandler}
          required
          style={{ borderColor: errors.settlement ? '#BB1D3D' : '' }}
        >
          <option value=''>{t('profile.select_settlement')}</option>
          {settlements.map((settlement, index) => (
            <option key={index} value={settlement.id}>
              {currentLanguage === 'bg' && `${settlement.bg}`}
              {currentLanguage === 'en' && `${settlement.en}`}
            </option>
          ))}
        </select>
        {errors.settlement && <span className='error'>{errors.settlement}</span>}
      </label>
      <label>
        {t('profile.district')}:
        <input type='text' name='district' value={form.district} onChange={handleInputChange} />
        {errors.district && <span className='error'>{errors.district}</span>}
      </label>
      <label>
        {t('profile.block')}:
        <input type='text' name='block' value={form.block} onChange={handleInputChange} />
        {errors.block && <span className='error'>{errors.block}</span>}
      </label>
      <label>
        {t('profile.street')}: <span>*</span>
        <input
          type='text'
          name='street'
          value={form.street}
          onChange={handleInputChange}
          onBlur={onBlurHandler}
          required
          style={{ borderColor: errors.street ? '#BB1D3D' : '' }}
        />
        {errors.street && <span className='error'>{errors.street}</span>}
      </label>
      <label>
        {t('profile.street_number')}:
        <input
          type='text'
          name='streetNumber'
          value={form.streetNumber}
          onChange={handleInputChange}
          onBlur={onBlurHandler}
          style={{ borderColor: errors.streetNumber ? '#BB1D3D' : '' }}
        />
        {errors.streetNumber && <span className='error'>{errors.streetNumber}</span>}
      </label>
      <span className='required-fields'>{t('profile.required_fields')}</span>
      <div className="btn-inline">
      <button className='btn-general btn-green' type='submit'>
        {t('profile.save_btn')}
      </button>
      <button type='submit' className='btn-general btn-red' onClick={handleResetForm}>
        {t('profile.close_btn')}
      </button>
      </div>
    </form>
  );
};

export default ProfileAddress;

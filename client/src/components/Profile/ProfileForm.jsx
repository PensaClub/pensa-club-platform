import { validateField, generateNumberOptions, trimObjectStrings, resetFields, handleReset } from '../../utils/profile';
import CustomSelect from './CustomSelect';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { loadData } from '../../utils/loadData';

import { useImagePreview } from '../hooks/useImagePreview';
import { useMappingContext } from '../contexts/MapContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ProfileForm = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const navigate = useNavigate();
  const { onProfileDataSubmit } = useContext(UserContext);
  // eslint-disable-next-line no-unused-vars
  const { onAllUsers, allUsers, setAllUsers } = useMappingContext();

  const { handleImageChange, uploadImages } = useImageUpload();
  const { previewImage, handleImage } = useImagePreview();

  const [persistedData, setPersistedData] = useLocalStorage('persistedData', {});

  const initialFormState = {
    username: persistedData?.username || '',
    // email: userEmail,
    firstName: persistedData?.firstName || '',
    lastName: persistedData?.lastName || '',
    phoneNumber: persistedData?.phoneNumber || '',
    gender: persistedData?.gender || null,
    region: persistedData?.region || '',
    regionId: persistedData?.regionId || '',
    municipality: persistedData?.municipality || '',
    municipalityId: persistedData?.municipalityId || '',
    settlement: persistedData?.settlement || '',
    settlementId: persistedData?.settlementId || '',
    district: persistedData?.district || '',
    block: persistedData?.block || '',
    street: persistedData?.street || '',
    streetNumber: persistedData?.streetNumber || '',
    birthDate: persistedData?.birthDate || null,
    skills: persistedData?.skills || [],
    interestOptions: persistedData?.interestOptions || [],
    workOptions: persistedData?.workOptions || [],
    imageURL: persistedData?.imageURL || null,
    firebaseImagePath: persistedData?.firebaseImagePath || null,
  };
  const [form, setForm] = useState(initialFormState);

  const [regions, setRegions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [settlements, setSettlements] = useState([]);

  const [skillsOptions, setSkillsOptions] = useState([]);
  const [workOptions, setWorkOptions] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData('/regions.json')
      .then((data) => setRegions(data))
      .catch((err) => console.error(err.message));

      if (persistedData?.municipality) {
        loadData(`/regions-data/region-${form.regionId}/subregions-${form.regionId}.json`)
      .then((data) => setMunicipalities(data))
      .catch((err) => console.error(err.message));
      }

      if (persistedData?.settlement) {
        loadData(`/regions-data/region-${form.regionId}/towns/towns-${form.municipalityId}.json`)
      .then((data) => setSettlements(data))
      .catch((err) => console.error(err.message));
      }

    loadData('/options.json')
      .then((data) => {
        setInterestOptions(data.interestOptions);
        setSkillsOptions(data.skills);
        setWorkOptions(data.workOptions);
      })
      .catch((err) => console.error(err.message));
  }, []);

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    // eslint-disable-next-line eqeqeq
    const currRegion = regions.filter((region) => region.id == regionId);
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

  useEffect(() => {
    const updateErrorsTranslation = () => {
      const translatedErrors = {};
      Object.keys(errors).forEach((field) => {
        const error = validateField(field, form[field], form, t);
        if (error) {
          translatedErrors[field] = error;
        }
      });
      setErrors(translatedErrors);
    };

    updateErrorsTranslation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const handleMunicipalityChange = async (e) => {
    const municipalityId = e.target.value;
    // eslint-disable-next-line eqeqeq
    const currMunicipality = municipalities.filter((municipality) => municipality.id == municipalityId);
    const municipalityName = currMunicipality[0].bg;

    setForm({
      ...form,
      municipalityId: municipalityId,
      municipality: municipalityName,
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
    // eslint-disable-next-line eqeqeq
    const currSettlement = settlements.filter((settlement) => settlement.id == settlementId);
    const settlementName = currSettlement[0].bg;

    setForm({
      ...form,
      settlementId: settlementId,
      settlement: settlementName,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGenderChange = (e) => {
    setForm({ ...form, gender: e.target.value });
  };

  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDate}`;
      setForm((prevForm) => ({
        ...prevForm,
        birthDate: formattedDate,
      }));
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  const handleSelectedDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSelectedMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
  const handleSelectedYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedForm = trimObjectStrings(form);
    setForm(trimmedForm);
    setPersistedData(trimmedForm);

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
        const updatedForm = await uploadImages(trimmedForm);
        
        console.log(updatedForm);
        resetFields(setForm, initialFormState);
        await onProfileDataSubmit(updatedForm);
        await onAllUsers();

        setSelectedDate('');
        setSelectedMonth('');
        setSelectedYear('');
        setPersistedData({});
        window.scrollTo(0, 0);
        navigate('/profile');
      } catch (error) {
        setForm(persistedData);
        console.error(`Error on profile form submit: ${error.message}`);
      }
    } else {
      setForm(persistedData);
      console.error('Form validation failed. Errors:', validationErrors);
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value, form, t);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleResetForm = () => {
    handleReset(setForm, initialFormState);
    setSelectedDate('');
    setSelectedMonth('');
    setSelectedYear('');
  };
  const handleLogout = () => {
    navigate('/logout');
  };
  return (
    <>
  
    <form onSubmit={handleSubmit} className='profile-form'>
    <Link to='/logout' onClick={handleLogout}>
              <button type='button' className='top-right-button-profile-form'>
                {t('profile.logout')}
              </button>
            </Link>
      <h3>{t('profile.profile_form_title')}</h3>
      <div className='avatar'>
        <img src={previewImage || '/images/sign-up/avatar.jpg'} alt='User avatar' />
        <div className='user-data'>
          <input
            type='file'
            className='input-image'
            id='imageUrl'
            onChange={(e) => {
              handleImageChange(e);
              handleImage(e);
            }}
          />
          <label htmlFor='imageUrl' className='label-image'>
            {t('profile.add_photo')}
          </label>
        </div>
      </div>
      <div className='user-data'>
        <div>
          <label htmlFor='username'>
            {t('profile.username')}: <span>*</span>
          </label>
          <input
            type='text'
            id='username'
            name='username'
            value={form.username}
            onChange={handleInputChange}
            onBlur={onBlurHandler}
            required
            style={{ borderColor: errors.username ? '#BB1D3D' : '' }}
          />

          {errors.username && <span className='error'>{errors.username}</span>}
        </div>
        <div className='gender'>
          <label>{t('profile.gender')}:</label>
          <div className='gender-options'>
            <div>
              <label>
                {t('profile.male')}
                <input type='radio' value='male' checked={form.gender === 'male'} onChange={handleGenderChange} />
              </label>
            </div>
            <div>
              <label>
                {t('profile.female')}
                <input type='radio' value='female' checked={form.gender === 'female'} onChange={handleGenderChange} />
              </label>
            </div>
            <div>
              <label>
                {' '}
                {t('profile.other')}
                <input type='radio' value='other' checked={form.gender === 'other'} onChange={handleGenderChange} />
              </label>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor='firstName'>{t('profile.first_name')}:</label>
          <input type='text' id='firstName' name='firstName' value={form.firstName} onChange={handleInputChange} onBlur={onBlurHandler} />
          {errors.firstName && <span className='error'>{errors.firstName}</span>}
        </div>
        <div>
          <label htmlFor='lastName'>{t('profile.last_name')}:</label>
          <input type='text' id='lastName' name='lastName' value={form.lastName} onChange={handleInputChange} onBlur={onBlurHandler} />
          {errors.lastName && <span className='error'>{errors.lastName}</span>}
        </div>
        <div className='date'>
          <label>{t('profile.age')}:</label>
          <div>
            <label>
              <select value={selectedDate} onChange={handleSelectedDateChange} onBlur={onBlurHandler}>
                <option value=''>{t('profile.day')}</option>
                {generateNumberOptions(1, 31)}
              </select>
            </label>
          </div>
          <div>
            <label>
              <select value={selectedMonth} onChange={handleSelectedMonthChange} onBlur={onBlurHandler}>
                <option value=''>{t('profile.month')}</option>
                {generateNumberOptions(1, 12)}
              </select>
            </label>
          </div>
          <div>
            <label>
              <select
                value={selectedYear}
                onChange={handleSelectedYearChange}
                onFocus={() => {
                  setIsYearSelectOpen(true);
                  if (!selectedYear) setSelectedYear(2000)
                }}
                onBlur={onBlurHandler}>
                <option value=''>{isYearSelectOpen ? t('profile.year') : t('profile.year')}</option>
                {generateNumberOptions(new Date().getFullYear(), 1915)}
              </select>
            </label>
          </div>
        </div>
        <div>
          <label htmlFor='phoneNumber'>{t('profile.phone_number')}: </label>
          <input
            type='text'
            id='phoneNumber'
            name='phoneNumber'
            value={form.phoneNumber}
            onChange={handleInputChange}
            onBlur={onBlurHandler}
            style={{ borderColor: errors.phoneNumber ? '#BB1D3D' : '' }}
          />
          {errors.phoneNumber && <span className='error'>{errors.phoneNumber}</span>}
        </div>
      </div>

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

      <label>
        {t('map.skills')}:
        <CustomSelect options={skillsOptions} selectedOptions={form.skills} onSelect={(selected) => setForm({ ...form, skills: selected })} />
      </label>

      <label>
        {t('map.job')}:
        <CustomSelect options={workOptions} selectedOptions={form.workOptions} onSelect={(selected) => setForm({ ...form, workOptions: selected })} />
      </label>

      <label>
        {t('map.interests')}:
        <CustomSelect
          options={interestOptions}
          selectedOptions={form.interestOptions}
          onSelect={(selected) => setForm({ ...form, interestOptions: selected })}
        />
      </label>

      <span className='required-fields'>{t('profile.required_fields')}</span>
      <div className='btn-inline'>
        <button type='submit' className='btn-general btn-green'>
          {t('profile.save_btn')}
        </button>
        <button type='submit' className='btn-general btn-red' onClick={handleResetForm}>
          {t('profile.close_btn')}
        </button>
      </div>
    </form>
    </>
  );
  
};

export default ProfileForm;

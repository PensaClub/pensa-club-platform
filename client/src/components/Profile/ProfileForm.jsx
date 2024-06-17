import {
  validateField,
  generateNumberOptions,
  trimObjectStrings,
  resetFields,
  handleReset,
} from '../../utils/profile';
import CustomSelect from './CustomSelect';
import React, { useState, useEffect, useContext } from 'react';
import { Link, redirect, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';

const ProfileForm = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const navigate = useNavigate();
    const { onProfileDataSubmit, userId, userEmail, getProfileData } =
    useContext(UserContext);

    const initialFormState = {
        username: '',
        username: '',
        // email: userEmail,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        gender: null,
        region: '',
        regionId: '',
        municipality: '',
        municipalityId: '',
        settlement: '',
        settlementId: '',
        district: '',
        block: '',
        street: '',
        streetNumber: '',
        birthDate: null,
        skills: [],
        interestOptions: [],
        workOptions: [],
    }
    const [form, setForm] = useState(initialFormState);

  const [regions, setRegions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [settlements, setSettlements] = useState([]);

  const [skillsOptions, setSkillsOptions] = useState([]);
  const [workOptions, setWorkOptions] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
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
    const currRegion = regions.filter((region) => region.id == regionId);
    const regionName = currRegion[0].bg;

    // console.log('regionsId', regionId); // връща номера на Областта

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
        `/regions-data/region-${regionId}/subregions-${regionId}.json`
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
        `/regions-data/region-${form.regionId}/towns/towns-${municipalityId}.json`
      );
      const data = await response.json();
      setSettlements(data);
    } catch (error) {
      console.error('Failed to load settlements data', error);
    }
  };

  const handleSettlementChange = async (e) => {
    const settlementId = e.target.value;
    const currSettlement = settlements.filter(
      (settlement) => settlement.id == settlementId
    );
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

  const handleModalToggle = () => {
    setModalOpen(!isModalOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedForm = trimObjectStrings(form);
    setForm(trimmedForm);

    const isValid = Object.keys(trimmedForm).every((field) => {
      const value = trimmedForm[field];
      const error = validateField(field, value);
      setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
      return !error;
    });

        if (isValid) {

            console.log('Form Submitted:', trimmedForm);
            // resetFields(setForm, initialFormState);
            // setSelectedDate('');
            // setSelectedMonth('');
            // setSelectedYear('');
            navigate('/profile');

      onProfileDataSubmit(form)
        .then(() => {
          console.log('Form Submitted:', form);
          handleModalToggle();
          navigate('/profile');
        })
        .catch((err) =>
          console.log(`Error on profile form submit: ${err.message}`)
        );
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

    const handleResetForm = () => {
        handleReset(setForm, initialFormState);
        setSelectedDate('');
        setSelectedMonth('');
        setSelectedYear('');
    };

  return (
    <>
      <form onSubmit={handleSubmit} className="profile-form">
        <h3>Попълнете данните си</h3>

            <div className="avatar">
                <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                <Link to="#" className="change-avatar-link">{t('profile.add_photo')}</Link>
            </div>
            <div className="user-data">
                <div>
                    <label htmlFor="username">{t('profile.username')}: <span>*</span></label>
                    <input type="text" id="username" name="username" value={form.username} onChange={handleInputChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.username ? '#BB1D3D' : '' }}
                    />

                    {errors.username && <span className="error">{errors.username}</span>}
                </div>
                <div className="gender">
                    <label>{t('profile.gender')}:</label>
                    <div className="gender-options">
                        <div>
                            <label>{t('profile.male')}
                                <input type="radio" value="male" checked={form.gender === 'male'} onChange={handleGenderChange} />
                            </label>
                        </div>
                        <div>
                            <label>{t('profile.female')}
                                <input type="radio" value="female" checked={form.gender === 'female'} onChange={handleGenderChange} />
                            </label>
                        </div>
                        <div>
                            <label> {t('profile.other')}
                                <input type="radio" value="other" checked={form.gender === 'other'} onChange={handleGenderChange} />
                            </label>
                        </div>
                    </div>
                </div>
                <div>

                    <label htmlFor="firstName">{t('profile.first_name')}:</label>
                    <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} onBlur={onBlurHandler} />
                    {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
                <div>
                    <label htmlFor="lastName">{t('profile.last_name')}:</label>
                    <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleInputChange} onBlur={onBlurHandler} />
                    {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>
                <div className="date">
                    <label>{t('profile.age')}</label>
                    <div>
                        <label>

                            <select value={selectedDate} onChange={handleSelectedDateChange} onBlur={onBlurHandler}>
                                <option value="">{t('profile.day')}</option>
                                {generateNumberOptions(1, 31)}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>

                            <select value={selectedMonth} onChange={handleSelectedMonthChange} onBlur={onBlurHandler}>
                                <option value="">{t('profile.month')}</option>
                                {generateNumberOptions(1, 12)}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>

                            <select value={selectedYear} onChange={handleSelectedYearChange} onBlur={onBlurHandler}>
                                <option value="">{t('profile.year')}</option>
                                {generateNumberOptions(1900, new Date().getFullYear())}
                            </select>
                        </label>
                    </div>
                </div>
                <div>
                    <label htmlFor="phoneNumber">{t('profile.phone_number')}: <span>*</span></label>
                    <input type="text" id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.phoneNumber ? '#BB1D3D' : '' }}
                    />
                    {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                </div>

            </div>

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
            {t('profile.street_number')}: <span>*</span>
                <input type="text" name="streetNumber" value={form.streetNumber} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.streetNumber ? '#BB1D3D' : '' }}
                />
                {errors.streetNumber && <span className="error">{errors.streetNumber}</span>}
            </label>

            <label>
            {t('map.skills')}:
                <CustomSelect
                
                options={skillsOptions}
                selectedOptions={form.skills}
                onSelect={(selected) => setForm({ ...form, skills: selected })}
                
            />
           
            </label>
            <label>
            {t('map.job')}:
                <CustomSelect
               options={workOptions}
               selectedOptions={form.workOptions}
               onSelect={(selected) => setForm({ ...form, workOptions: selected })}
            />

            </label>
            <label>
            {t('map.interests')}:
                <CustomSelect
               options={interestOptions}
               selectedOptions={form.interestOptions}
               onSelect={(selected) => setForm({ ...form, interestOptions: selected })}
             
            />
               
            </label>
            <span className="required-fields">{t('profile.required_fields')}</span>
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                <button type="submit" className="btn-general btn-red" onClick={handleResetForm}>{t('profile.close_btn')}</button>
            </div>
        </form>
        <AlertModal isOpen={isModalOpen} onClose={handleModalToggle}>
        <p>Вашият профил е завършен успешно!</p>
      </AlertModal>
    </>
  );
};

export default ProfileForm;

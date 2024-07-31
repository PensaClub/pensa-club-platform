import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import { validateField, generateNumberOptions, trimObjectStrings, handleReset } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useImagePreview } from '../hooks/useImagePreview';
import { useMappingContext } from '../contexts/MapContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { toast } from 'react-toastify';

export const ProfileData = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { onEditProfileDataSubmit, profileData } = useContext(UserContext);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [errors, setErrors] = useState({});
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);

  const { setAllUsers } = useMappingContext();
  const { handleImageChange, uploadImages } = useImageUpload();
  const { previewImage, handleImage } = useImagePreview();

  const initialFormState = {
    username: profileData.details.username || '',
    email: profileData.email,
    firstName: profileData.details.firstName || '',
    lastName: profileData.details.lastName || '',
    phoneNumber: profileData.details.phoneNumber || '',
    gender: profileData.details.gender || null,
    birthDate: profileData.details.birthDate || null,
    imageURL: profileData.details.imageURL || null,
    firebaseImagePath: profileData.details.firebaseImagePath || null,
  };

  const [form, setForm] = useState(initialFormState);

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
    } else if (!selectedDate && !selectedMonth && !selectedYear) {
      setForm((prevForm) => ({
        ...prevForm,
        birthDate: '',
      }));
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    if (profileData) {
      setAllUsers((prevUsers) => {
        if (!prevUsers || !prevUsers.response || !Array.isArray(prevUsers.response.accounts)) {
          return {
            response: {
              accounts: [profileData],
            },
          };
        }

        const updatedAccounts = prevUsers.response.accounts.map((user) => (user.email === profileData.email ? { ...user, ...profileData } : user));

        if (!updatedAccounts.some((user) => user.email === profileData.email)) {
          updatedAccounts.push(profileData);
        }

        return {
          ...prevUsers,
          response: {
            ...prevUsers.response,
            accounts: updatedAccounts,
          },
        };
      });
    }
  }, [profileData, setAllUsers]);

  const handleSelectedDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (e.target.value === '') {
      setForm((prevForm) => ({ ...prevForm, birthDate: '' }));
    }
  };

  const handleSelectedMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (e.target.value === '') {
      setForm((prevForm) => ({ ...prevForm, birthDate: '' }));
    }
  };

  const handleSelectedYearChange = (e) => {
    setSelectedYear(e.target.value);
    if (e.target.value === '') {
      setForm((prevForm) => ({ ...prevForm, birthDate: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const adjustedForm = { ...form };
    if (!selectedDate) adjustedForm.birthDate = null;
    if (!selectedMonth) adjustedForm.birthDate = null;
    if (!selectedYear) adjustedForm.birthDate = null;

    const trimmedForm = trimObjectStrings(adjustedForm);
    setForm(trimmedForm);

    const isValid = Object.keys(trimmedForm).every((field) => {
      const value = trimmedForm[field];
      const error = validateField(field, value);
      setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
      return !error;
    });

    if (isValid) {
      try {
        const updatedDataArr = Object.entries(trimmedForm).filter(([key, value]) => initialFormState[key] !== value);
        const updatedData = Object.fromEntries(updatedDataArr);

        const updatedForm = await uploadImages(updatedData, profileData.details.firebaseImagePath);

        await onEditProfileDataSubmit(updatedForm);

        window.scrollTo(0, 0);
        navigate('/profile');
      } catch (error) {
        return toast.error(t('errors.profile_data_submit', { error: error.message }));
      }
    }
  };

  const onBlurHandler = (e) => {
    setIsYearSelectOpen(false); // Затваряне на селекта за година
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
    <section className='profile-section-edit'>
      <form onSubmit={handleSubmit} className='profile-form'>
        <h3>{t('profile.personal_data')}</h3>
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
              {t('profile.change_photo')}
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
            <label htmlFor='phoneNumber'>{t('profile.phone_number')}:</label>
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
          <div className='date'>
            <label>{t('profile.age')}</label>
            <div>
              <label>
                <select value={selectedDate} onChange={handleSelectedDateChange}>
                  <option value=''>{t('profile.day')}</option>
                  {generateNumberOptions(1, 31)}
                </select>
              </label>
            </div>
            <div>
              <label>
                <select value={selectedMonth} onChange={handleSelectedMonthChange}>
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
                  onBlur={onBlurHandler}
                >
                  <option value=''>{isYearSelectOpen ? t('profile.year') : t('profile.year')}</option>
                  {generateNumberOptions(new Date().getFullYear(), 1915)}
                </select>
              </label>
            </div>
          </div>
          <span className='required-fields'>{t('profile.required_fields')}</span>
        </div>
        <div className='btn-inline'>
          <button type='submit' className='btn-general btn-green'>
            {t('profile.save_btn')}
          </button>
          <button type='button' className='btn-general btn-red' onClick={handleResetForm}>
            {t('profile.close_btn')}
          </button>
        </div>
      </form>
    </section>
  );
};

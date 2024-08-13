import React, { useContext, useState } from 'react';
import './profile.css';
import { validateField, resetFields, trimObjectStrings, handleReset } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const ProfilePassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onPasswordReset } = useContext(UserContext);

  const initialFormState = {
    oldPassword: '',
    newPassword: '',
    reNewPassword: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    reNewPassword: false,
  });

  const toggleShowPassword = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value, form, t),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const trimmedForm = trimObjectStrings(form);
    setForm(trimmedForm);

    const newErrors = {};
    let isValid = true;

    Object.keys(trimmedForm).forEach((field) => {
      const error = validateField(field, trimmedForm[field], trimmedForm, t);
      newErrors[field] = error;
      if (error) {
        isValid = false;
      }
    });
    setErrors(newErrors);
    if (isValid) {
      await onPasswordReset({ ...trimmedForm, tokenType: 'jwt' });
      resetFields(setForm, initialFormState);
      navigate('/profile');
      }
     }
    catch(error) {
      console.error("Error while changing password: " + error?.message)
     }
  };

  const handleResetForm = () => {
     handleReset(setForm,initialFormState);
     navigate('/profile');
  };

  return (
    <form className='profile-form' onSubmit={handleSubmit}>
      <h3>{t('profile.change_password')}</h3>
      <label htmlFor='oldPassword'>
        {t('profile.old_password')}: <span>*</span>
        <div className='password-input-container'>
          <input
            type={showPasswords.oldPassword ? 'text' : 'password'}
            name='oldPassword'
            value={form.oldPassword}
            onChange={handleInputChange}
            onBlur={onBlurHandler}
            required
          />
          <span className='toggle-password' onClick={() => toggleShowPassword('oldPassword')}>
            {showPasswords.oldPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>
        {errors.oldPassword && <div className='error'>{errors.oldPassword}</div>}
      </label>
      <label>
        {t('profile.new_password')}: <span>*</span>
        <div className='password-input-container'>
          <input
            type={showPasswords.newPassword ? 'text' : 'password'}
            name='newPassword'
            value={form.newPassword}
            onChange={handleInputChange}
            onBlur={onBlurHandler}
            required
          />
          <span className='toggle-password' onClick={() => toggleShowPassword('newPassword')}>
            {showPasswords.newPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>
        {errors.newPassword && <div className='error'>{errors.newPassword}</div>}
      </label>
      <label>
        {t('profile.repeat_password')}: <span>*</span>
        <div className='password-input-container'>
          <input
            type={showPasswords.reNewPassword ? 'text' : 'password'}
            name='reNewPassword'
            value={form.reNewPassword}
            onChange={handleInputChange}
            onBlur={onBlurHandler}
            required
          />
          <span className='toggle-password' onClick={() => toggleShowPassword('reNewPassword')}>
            {showPasswords.reNewPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>
        {errors.reNewPassword && <div className='error'>{errors.reNewPassword}</div>}
      </label>
      <span className='required-fields'>{t('profile.required_fields')}</span>
      <div className='btn-inline'>
        <button type='submit' className='btn-general btn-green'>
          {t('profile.save_btn')}
        </button>
        <button type='button' className='btn-general btn-red' onClick={handleResetForm}>
          {t('profile.close_btn')}
        </button>
      </div>
    </form>
  );
};

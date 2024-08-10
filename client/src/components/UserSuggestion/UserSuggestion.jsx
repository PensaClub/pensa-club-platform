import './userSuggestion.css';

import { trimObjectStrings, resetFields } from '../../utils/profile';

import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SuggestUserContext } from '../contexts/SuggestUserContext';
import { UserContext } from '../contexts/UserContext';

const phoneNumberRegex = /^(?:\+\d{7,15}|\d{10})$/;
const nameRegex = /^[a-zA-Zа-яА-Я0-9_\s]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;

export const UserSuggestion = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { onSuggestSubmit } = useContext(SuggestUserContext);
  const { profileData } = useContext(UserContext);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const initialFormState = {
    reffererName: profileData.details?.firstName || profileData.details?.username || '',
    name: '',
    phoneNumber: '',
    message: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const validateField = (name, value, form = {}, t) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) error = t('profile.name_required');
        if (value && !nameRegex.test(value)) error = t('profile.name_invalid');
        if (value.length < 3 && value.length > 40) error = t('user-suggestion.name-lenght');
        break;
      case 'reffererName':
        if (!value) error = t('profile.name_required');
        if (value && !nameRegex.test(value)) error = t('profile.name_invalid');
        if (value.length < 3 && value.length > 40) error = t('user-suggestion.name-lenght');
        break;
      case 'phoneNumber':
        if (!value) error = t('profile.phone_number_required');
        if (value && !phoneNumberRegex.test(value))
          error = t('profile.phone_number_invalid');
        break;
      case 'message':
        if (value.length < 5 && value.length > 100) error = t('user-suggestion.message-lenght');
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
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
        resetFields(setForm, initialFormState);

        await onSuggestSubmit(trimmedForm);
        window.scrollTo(0, 0);
        navigate('/');
      } catch (error) {
        console.error(`Error on suggest user submit: ${error.message}`);
      }
    } else {
      console.error('Form validation failed. Errors:', validationErrors);
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value, form, t);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  return (
    <section className="banner-section-suggest">
      <div className="container-wrapper">
        <div className="container-suggest">
          <form className="form-suggest" id="user-suggest" onSubmit={handleSubmit}>
            <h2 className="form-suggest__title">{t('user-suggestion.title')}</h2>
            <p className="desc">
              <strong>{t('user-suggestion.desc')}</strong>
            </p>

            <label className="label" htmlFor="reffererName">
              {t('user-suggestion.refferer-name')} <span>*</span>
            </label>
            <input
              type="text"
              placeholder={t('user-suggestion.name-placeholder')}
              className="input"
              name="reffererName"
              value={form.reffererName}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
              required
            />
            {errors.reffererName && (
              <p className="error">{t(`${errors.reffererName}`)}</p>
            )}

            <p className="desc">
              <strong>{t('user-suggestion.who-is-suggested')}</strong>
            </p>

            <label className="label" htmlFor="name">
              {t('user-suggestion.name')} <span>*</span>
            </label>
            <input
              type="text"
              placeholder={t('user-suggestion.name-placeholder')}
              className="input"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
              required
            />
            {errors.name && <p className="error">{t(`${errors.name}`)}</p>}

            <label className="label" htmlFor="phoneNumber">
              {t('user-suggestion.phone')} <span>*</span>
            </label>
            <input
              type="text"
              placeholder="+359 888 999 999"
              className="input"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
              required
            />
            {errors.phoneNumber && (
              <p className="error">{t(`${errors.phoneNumber}`)}</p>
            )}

            <label className="label" htmlFor="message">
              {t('user-suggestion.message')}
            </label>
            <textarea
              type="text"
              placeholder={t('user-suggestion.message-placeholder')}
              className="input"
              name="message"
              value={form.message}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
            />
            {errors.message && (
              <p className="error">{t(`${errors.message}`)}</p>
            )}

            <button className="btn-general btn-orange"  disabled={errors > 0 || !form.name || !form.reffererName || !form.phoneNumber }>
              {t('user-suggestion.title')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

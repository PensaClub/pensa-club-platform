import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import { validateField, resetFields, trimObjectStrings, handleReset } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';


export const ProfilePassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {onPasswordReset} = useContext(UserContext);

    const initialFormState = {
        currPassword: '',
        password: '',
        rePassword: '',
    };

    // Проверка за паролата на бекенда!!!

    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        currPassword: false,
        password: false,
        rePassword: false,
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
            [name]: validateField(name, value, form),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedForm = trimObjectStrings(form);
        setForm(trimmedForm);

        const newErrors = {};
        let isValid = true;

        Object.keys(trimmedForm).forEach((field) => {
            const error = validateField(field, trimmedForm[field], trimmedForm);
            newErrors[field] = error;
            if (error) {
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (isValid) {
            onPasswordReset(trimmedForm);
            console.log('Form Submitted:', trimmedForm);
            resetFields(setForm, initialFormState);
            navigate('/profile');
        }
    };

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <h3>{t('profile.change_password')}</h3>
            <label htmlFor="currPassword">
            {t('profile.old_password')}: <span>*</span>
                <div className="password-input-container">
                    <input
                        type={showPasswords.currPassword ? 'text' : 'password'}
                        name="currPassword"
                        value={form.currPassword}
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                        required
                    />
                    <span className="toggle-password" onClick={() => toggleShowPassword('currPassword')}>
                        {showPasswords.currPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                </div>
                {errors.currPassword && <div className="error">{errors.currPassword}</div>}
            </label>
            <label>
            {t('profile.new_password')}: <span>*</span>
                <div className="password-input-container">
                    <input
                        type={showPasswords.password ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                        required
                    />
                    <span className="toggle-password" onClick={() => toggleShowPassword('password')}>
                        {showPasswords.password ? '👁️' : '👁️‍🗨️'}
                    </span>
                </div>
                {errors.password && <div className="error">{errors.password}</div>}
            </label>
            <label>
            {t('profile.repeat_password')}: <span>*</span>
                <div className="password-input-container">
                    <input
                        type={showPasswords.rePassword ? 'text' : 'password'}
                        name="rePassword"
                        value={form.rePassword}
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                        required
                    />
                    <span className="toggle-password" onClick={() => toggleShowPassword('rePassword')}>
                        {showPasswords.rePassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                </div>
                {errors.rePassword && <div className="error">{errors.rePassword}</div>}
            </label>
            <span className="required-fields">{t('profile.required_fields')}</span>
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                <button type="button" className="btn-general btn-red" onClick={() => handleReset(setForm, initialFormState)}>
                {t('profile.close_btn')}
                </button>
            </div>
        </form>
    );
};

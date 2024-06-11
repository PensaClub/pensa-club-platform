import React, { useState } from 'react';
import './profile.css';
import { validateField, resetFields, trimObjectStrings, handleReset } from '../../utils/profile';

export const ProfilePassword = () => {
    const initialFormState = {
        password: '',
        newPassword: '',
        rePassword: '',
    };

    // Проверка за паролата на бекенда!!!
    
    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        newPassword: false,
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
            console.log('Form Submitted:', trimmedForm);
            resetFields(setForm, initialFormState);
        }
    };

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <h3>Смяна на парола</h3>
            <label htmlFor="password">
                Стара парола: <span>*</span>
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
                Нова парола: <span>*</span>
                <div className="password-input-container">
                    <input
                        type={showPasswords.newPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                        required
                    />
                    <span className="toggle-password" onClick={() => toggleShowPassword('newPassword')}>
                        {showPasswords.newPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                </div>
                {errors.newPassword && <div className="error">{errors.newPassword}</div>}
            </label>
            <label>
                Повтори парола: <span>*</span>
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
            <span className="required-fields">Полетата с * са задължителни!</span>
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">Запази</button>
                <button type="button" className="btn-general btn-red" onClick={() => handleReset(setForm, initialFormState)}>
                    Затвори
                </button>
            </div>
        </form>
    );
};

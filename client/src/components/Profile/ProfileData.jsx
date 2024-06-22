import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import { Link } from 'react-router-dom';
import { validateField, generateNumberOptions, trimObjectStrings, resetFields, handleReset } from '../../utils/profile';
import { useTranslation } from 'react-i18next';

export const ProfileData = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const initialFormState = {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        gender: '',
        birthDate: '',
    }
    const [form, setForm] = useState(initialFormState);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [errors, setErrors] = useState({});


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
            console.log('Form Submitted:', trimmedForm);
            resetFields(setForm, initialFormState);
                setSelectedDate('');
                setSelectedMonth('');
                setSelectedYear('');

            navigate('/profile');
        }

       
    };


    const onBlurHandler = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value, form , t);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

    };

    const handleResetForm = () => {
        handleReset(setForm, initialFormState);
        setSelectedDate('');
        setSelectedMonth('');
        setSelectedYear('');
    };

    return (
        <section className="profile-section-edit">
            <form onSubmit={handleSubmit} className="profile-form">
                <h3>{t('profile.personal_data')}</h3>
                <div className="avatar">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <Link to="#" className="change-avatar-link">{t('profile.change_photo')}</Link>
                </div>
                <div className="user-data">
                    <div>
                        <label htmlFor="username">{t('profile.username')}: <span>*</span></label>
                        <input type="text" id="username" name="username" value={form.username} onChange={handleInputChange} onBlur={onBlurHandler} required
                            style={{ borderColor: errors.username ? '#BB1D3D' : '' }} />
                        {errors.username && <span className="error">{errors.username}</span>}
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
                    </div>
                    <div>
                        <label htmlFor="email">{t('profile.email')}: <span>*</span></label>
                        <input type="email" id="email" name="email" value={form.email} onChange={handleInputChange} onBlur={onBlurHandler} required
                            style={{ borderColor: errors.email ? '#BB1D3D' : '' }}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>
                    <div>
                        <label htmlFor="phoneNumber">{t('profile.phone_number')}: </label>
                        <input type="text" id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} onBlur={onBlurHandler}
                            style={{ borderColor: errors.phoneNumber ? '#BB1D3D' : '' }}
                        />
                        {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
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
                    <span className="required-fields">{t('profile.required_fields')}</span>
                </div>
                <div className="btn-inline">
                    <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                    <button type="submit" className="btn-general btn-red" onClick={handleResetForm}>{t('profile.close_btn')}</button>
                </div>
            </form>
        </section>
    )
}

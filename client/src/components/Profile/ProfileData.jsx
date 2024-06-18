import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import { Link } from 'react-router-dom';
import { validateField, generateNumberOptions, trimObjectStrings, resetFields, handleReset } from '../../utils/profile';

export const ProfileData = () => {
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


        const isValid = Object.keys(trimmedForm).every((field) => {
            const value = trimmedForm[field];
            const error = validateField(field, value);
            setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
            return !error;
        });

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
        <section className="profile-section-edit">
            <form onSubmit={handleSubmit} className="profile-form">
                <h3>Лични данни</h3>
                <div className="avatar">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <Link to="#" className="change-avatar-link">Смени снимка</Link>
                </div>
                <div className="user-data">
                    <div>
                        <label htmlFor="username">Потребителско име: <span>*</span></label>
                        <input type="text" id="username" name="username" value={form.username} onChange={handleInputChange} onBlur={onBlurHandler} required
                            style={{ borderColor: errors.username ? '#BB1D3D' : '' }} />
                        {errors.username && <span className="error">{errors.username}</span>}
                    </div>
                    <div>

                        <label htmlFor="firstName">Име:</label>
                        <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} onBlur={onBlurHandler} />
                        {errors.firstName && <span className="error">{errors.firstName}</span>}
                    </div>
                    <div>
                        <label htmlFor="lastName">Фамилия:</label>
                        <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleInputChange} onBlur={onBlurHandler} />
                        {errors.lastName && <span className="error">{errors.lastName}</span>}
                    </div>
                    <div className="gender">
                        <label>Пол:</label>
                        <div className="gender-options">
                            <div>
                                <label>Мъж
                                    <input type="radio" value="male" checked={form.gender === 'male'} onChange={handleGenderChange} />
                                </label>
                            </div>
                            <div>
                                <label>Жена
                                    <input type="radio" value="female" checked={form.gender === 'female'} onChange={handleGenderChange} />
                                </label>
                            </div>
                            <div>
                                <label> Друго
                                    <input type="radio" value="other" checked={form.gender === 'other'} onChange={handleGenderChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                    </div>
                    <div>
                        <label htmlFor="email">Имейл: <span>*</span></label>
                        <input type="email" id="email" name="email" value={form.email} onChange={handleInputChange} onBlur={onBlurHandler} required
                            style={{ borderColor: errors.email ? '#BB1D3D' : '' }}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>
                    <div>
                        <label htmlFor="phoneNumber">Телефон: <span>*</span></label>
                        <input type="text" id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} onBlur={onBlurHandler} required
                            style={{ borderColor: errors.phoneNumber ? '#BB1D3D' : '' }}
                        />
                        {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                    </div>
                    <div className="date">
                        <label>Възраст</label>
                        <div>
                            <label>

                                <select value={selectedDate} onChange={handleSelectedDateChange} onBlur={onBlurHandler}>
                                    <option value="">Ден</option>
                                    {generateNumberOptions(1, 31)}
                                </select>
                            </label>
                        </div>
                        <div>
                            <label>

                                <select value={selectedMonth} onChange={handleSelectedMonthChange} onBlur={onBlurHandler}>
                                    <option value="">Месец</option>
                                    {generateNumberOptions(1, 12)}
                                </select>
                            </label>
                        </div>
                        <div>
                            <label>

                                <select value={selectedYear} onChange={handleSelectedYearChange} onBlur={onBlurHandler}>
                                    <option value="">Година</option>
                                    {generateNumberOptions(1900, new Date().getFullYear())}
                                </select>
                            </label>
                        </div>
                    </div>
                    <span className="required-fields">Полетата с * са задължителни!</span>
                </div>
                <div className="btn-inline">
                    <button type="submit" className="btn-general btn-green">Запази</button>
                    <button type="submit" className="btn-general btn-red" onClick={handleResetForm}>Затвори</button>
                </div>
            </form>
        </section>
    )
}

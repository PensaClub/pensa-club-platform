import React, { useState } from 'react';
import './profile.css';

export const ProfilePassword = () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const [form, setForm] = useState({
        password: '',
        newPassword: '',
        rePassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: error
            }));
        }
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'password':
                if (!passwordRegex.test(value)) {
                    error = 'Паролата трябва да е поне 8 символа и да съдържа поне една буква и една цифра';
                }
                // тодо: проверка за това, дали паролата е тази от регистрацията
                break;
            case 'newPassword':
                if (!passwordRegex.test(value)) {
                    error = 'Новата парола трябва да е поне 8 символа и да съдържа поне една буква и една цифра';
                }
                break;
            case 'rePassword':
                if (value !== form.newPassword) {
                    error = 'Паролите не съвпадат';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error
        }));
        setTouched((prevTouched) => ({
            ...prevTouched,
            [name]: true
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        Object.keys(form).forEach((field) => {
            const error = validateField(field, form[field]);
            if (error) {
                newErrors[field] = error;
            }
        });
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log('Form Submitted:', form);

        }
    };

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <h3>Смяна на парола</h3>
            <label>
                Стара парола: <span>*</span>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                />
                {errors.password && <div className="error">{errors.password}</div>}
            </label>
            <label>
                Нова парола: <span>*</span>
                <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                />
                {errors.newPassword && <div className="error">{errors.newPassword}</div>}
            </label>
            <label>
                Повтори парола: <span>*</span>
                <input
                    type="password"
                    name="rePassword"
                    value={form.rePassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                />
                {errors.rePassword && <div className="error">{errors.rePassword}</div>}
            </label>
            <span className="required-fields">Полетата с * са задължителни!</span>
            <div className="btn-inline" >
                <button type="submit" className="btn-general btn-green">Запази</button>
                <button type="submit" className="btn-general btn-red">Затвори</button>
            </div>
        </form>
    );
};

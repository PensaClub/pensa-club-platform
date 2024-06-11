import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import CustomSelect from './CustomSelect';
import { resetFields, handleReset } from '../../utils/profile';


export const ProfileInterests = () => {

    const navigate = useNavigate();
    
    const initialFormState = {
        interestOptions: []
    }
    const [form, setForm] = useState(initialFormState);
    const [interestOptions, setInterestOptions] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/options.json');
                const data= await response.json();
                setInterestOptions(data.interestOptions);
            } catch (error) {
                console.error('Failed to load data', error);
            }
        };
        loadData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {

            console.log('Form Submitted:', form);
            resetFields(setForm, initialFormState);
            navigate('/profile');
        } else {

            setTimeout(() => {
                if (form && form.interestOptions && form.interestOptions.length > 0) {
                    console.log('Form Submitted:', form);
                    resetFields(setForm, initialFormState);
                }
            }, 2000);
        }
    };


    const validateForm = () => {
        const errors = {};
        if (form?.interestOptions?.length === 0) {
            errors.interestOptions = 'Изберете поне един интерес';
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleResetForm = () => {
        handleReset(setForm, initialFormState);
        navigate('/profile');
        

    };
    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <label>
                <h3>Добавете своите интереси:</h3>
                <CustomSelect
                    options={interestOptions}
                    selectedOptions={form.interestOptions}
                    onSelect={(selected) => setForm({ ...form, interestOptions: selected })}
                />
            </label>
            {errors.interestOptions && <div className="error-message">{errors.interestOptions}</div>}
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">Запази</button>
                <button type="reset" className="btn-general btn-red" onClick={handleResetForm}>Затвори</button>
            </div>
        </form>
    );
};

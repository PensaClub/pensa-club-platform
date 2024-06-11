import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import CustomSelect from './CustomSelect';
import { resetFields, handleReset } from '../../utils/profile';


export const ProfileSkills = () => {

    const navigate = useNavigate();
    
    const initialFormState = {
        skills: []
    }
    const [form, setForm] = useState(initialFormState);
    const [skillsOptions, setSkillsOptions] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/options.json');
                const data = await response.json();
                setSkillsOptions(data.skills);
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
        } else {

            setTimeout(() => {
                if (form && form.skills && form.skills.length > 0) {
                    console.log('Form Submitted:', form);
                    resetFields(setForm, initialFormState);
                }
            }, 2000);
        }
        navigate('/profile');
    };


    const validateForm = () => {
        const errors = {};
        if (form?.skills?.length === 0) {
            errors.skills = 'Изберете поне едно умение';
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleResetForm = () => {
        handleReset(setForm, initialFormState);
        

    };
    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <label>
                <h3>Добавете своите умения:</h3>
                <CustomSelect
                    options={skillsOptions}
                    selectedOptions={form.skills}
                    onSelect={(selected) => setForm({ ...form, skills: selected })}
                />
            </label>
            {errors.skills && <div className="error-message">{errors.skills}</div>}
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">Запази</button>
                <button type="reset" className="btn-general btn-red" onClick={handleResetForm}>Затвори</button>
            </div>
        </form>
    );
};

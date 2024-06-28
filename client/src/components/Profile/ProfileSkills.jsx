import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import CustomSelect from './CustomSelect';
import { resetFields, handleReset } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';import { useTranslation } from 'react-i18next';

export const ProfileSkills = () => {
    const { t } = useTranslation();  
    const navigate = useNavigate();
  const { onEditProfileDataSubmit, profileData } = useContext(UserContext);

  const initialFormState = {
    skills: profileData.details.skills || [],
  };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onEditProfileDataSubmit(form);
      console.log('Form Submitted:', form);
      resetFields(setForm, initialFormState);
      navigate('/profile');
    } else {
      setTimeout(() => {
        if (form && form.skills && form.skills.length > 0) {
          console.log('Form Submitted:', form);
          resetFields(setForm, initialFormState);
        }
      }, 2000);
    }
  };

    const validateForm = () => {
        const errors = {};
        if (form?.skills?.length === 0) {
            errors.skills = t('profile.skills_options_error');
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
                <h3>{t('profile.add_skills')}:</h3>
                <CustomSelect
                    options={skillsOptions}
                    selectedOptions={form.skills}
                    onSelect={(selected) => setForm({ ...form, skills: selected })}
                />
            </label>
            {errors.skills && <div className="error">{errors.skills}</div>}
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                <button type="reset" className="btn-general btn-red" onClick={handleResetForm}>{t('profile.close_btn')}</button>
            </div>
        </form>
    );
};

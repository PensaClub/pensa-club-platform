import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import CustomSelect from './CustomSelect';
import { resetFields, handleReset } from '../../utils/profile';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useMappingContext } from '../contexts/MapContext';

export const ProfileInterests = () => {
    const { onEditProfileDataSubmit, profileData } = useContext(UserContext);    
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const initialFormState = {
        interestOptions: profileData.details.interestOptions || [],
    }
    const [form, setForm] = useState(initialFormState);
    const [interestOptions, setInterestOptions] = useState([]);
    const [errors, setErrors] = useState({});
    // eslint-disable-next-line no-unused-vars
    const { onAllUsers,setAllUsers } = useMappingContext();

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

    useEffect(() => {
        if (profileData) {
            setAllUsers(prevUsers => {
                if (!prevUsers || !prevUsers.response || !Array.isArray(prevUsers.response.accounts)) {
                    return {
                        response: {
                            accounts: [profileData],
                        },
                    };
                }

                const updatedAccounts = prevUsers.response.accounts.map(user =>
                    user.email === profileData.email ? { ...user, ...profileData } : user
                );

                if (!updatedAccounts.some(user => user.email === profileData.email)) {
                    updatedAccounts.push(profileData);
                }

                return {
                    ...prevUsers,
                    response: {
                        ...prevUsers.response,
                        accounts: updatedAccounts,
                    },
                };
            });
        }
    }, [profileData, setAllUsers]);
    const handleSubmit = async (e) => {
        e.preventDefault();
  
            await onEditProfileDataSubmit(form);
    
            resetFields(setForm, initialFormState);
            navigate('/profile');
  
    };

    const handleResetForm = () => {
        handleReset(setForm, initialFormState);
        navigate('/profile');
    };
    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <label>
                <h3>{t('profile.add_interests')}</h3>
                <CustomSelect
                    options={interestOptions}
                    selectedOptions={form.interestOptions}
                    onSelect={(selected) => setForm({ ...form, interestOptions: selected })}
                />
            </label>
            {/* {errors.interestOptions && <div className="error">{errors.interestOptions}</div>} */}
            <div className="btn-inline">
                <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                <button type="reset" className="btn-general btn-red" onClick={handleResetForm}>{t('profile.close_btn')}</button>
            </div>
        </form>
    );
};

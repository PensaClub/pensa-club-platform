import React, { useState, useEffect, useContext } from 'react';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import './profile.css';
import CustomSelect from './CustomSelect';
import { resetFields, handleReset } from '../../utils/profile.jsx';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useMappingContext } from '../contexts/MapContext';

export const ProfileWorks = () => {
    const { onEditProfileDataSubmit, profileData } = useContext(UserContext);    
    const { t } = useTranslation();
    const navigate = useLocalizedNavigate();
    
    const initialFormState = {
        workOptions: profileData.details.workOptions || [],
    }
    const [form, setForm] = useState(initialFormState);
    const [workOptions, setWorkOptions] = useState([]);
    const [errors, setErrors] = useState({});
    // eslint-disable-next-line no-unused-vars
    const { setAllUsers, allUsers } = useMappingContext();

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/options.json');
                const data= await response.json();
                setWorkOptions(data.workOptions);
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
    }, [profileData, setAllUsers])
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
                <h3>{t('profile.add_jobs')}:</h3>
                <CustomSelect
                    options={workOptions}
                    selectedOptions={form.workOptions}
                    onSelect={(selected) => setForm({ ...form, workOptions: selected })}
                />
            </label>
            {errors.workOptions && <div className="error">{errors.workOptions}</div>}
            <div className="btn-inline">
            <button type="submit" className="btn-general btn-green">{t('profile.save_btn')}</button>
                <button type="reset" className="btn-general btn-red" onClick={handleResetForm}>{t('profile.close_btn')}</button>
            </div>
        </form>
    );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const ProfileForm = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        gender: '',
        region: '',
        municipality: '',
        settlement: '',
        district: '',
        block: '',
        street: '',
        streetNumber: '',
        birthDate: '',
        skills: '',
        interestOptions: '',
        workOptions: '',
    });

    const [regions, setRegions] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [settlements, setSettlements] = useState([]);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [errors, setErrors] = useState({});

    const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{6,16}$/;
    const nameRegex = /^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const phoneNumberRegex = /^(?:\+\d{7,15}|\d{10})$/;

    useEffect(() => {
        const loadRegions = async () => {
            try {
                const response = await fetch('/regions.json');
                const data = await response.json();


                console.log(data) //връща всички области
                setRegions(data);
            } catch (error) {
                console.error('Failed to load regions data', error);
            }
        };
        loadRegions();
    }, []);

    const handleRegionChange = async (e) => {
        const regionId = e.target.value;

        console.log("regionsId", regionId) // връща номера на Областта

        setForm({ ...form, region: regionId, municipality: '', settlement: '' });
        setMunicipalities([]);
        setSettlements([]);

        try {
            const response = await fetch(`/regions-data/region-${regionId}/subregions-${regionId}.json`);

            const data = await response.json();
            console.log("data", data)
            setMunicipalities(data);
        } catch (error) {
            console.error('Failed to load municipalities data', error);
        }
    };

    const handleMunicipalityChange = async (e) => {
        const municipalityId = e.target.value;
        setForm({ ...form, municipality: municipalityId, settlement: '' });
        setSettlements([]);

        try {
            const response = await fetch(`/regions-data/region-${form.region}/towns/towns-${municipalityId}.json`);
            const data = await response.json();
            setSettlements(data);
        } catch (error) {
            console.error('Failed to load settlements data', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleGenderChange = (e) => {
        setForm({ ...form, gender: e.target.value });
        console.log(e.target.value)
    };



    useEffect(() => {
        if (selectedDate && selectedMonth && selectedYear) {
            const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDate}`;
            setBirthDate(formattedDate);
            setForm({ ...form, birthDate: formattedDate });
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

        const isValid = Object.keys(form).every((field) => {
            const value = form[field];
            validateField(field, value);
            return !errors[field];
        });

        if (isValid) {
            console.log('Form Submitted:', form);
        }
    };


    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'username':
                if (!value) error = 'Потребителското име е задължително';
                else if (!usernameRegex.test(value)) error = 'Невалидно потребителско име';
                break;
            case 'email':
                if (!value) error = 'Имейлът е задължителен';
                else if (!emailRegex.test(value)) error = 'Имейлът не е валиден';
                break;
            case 'firstName':
                if (value && !nameRegex.test(value)) error = 'Невалидно име';
                break;
            case 'lastName':
                if (value && !nameRegex.test(value)) error = 'Невалидно име';
                break;
            case 'phoneNumber':
                if (!value) error = 'Телефонният номер е задължителен';
                else if (!phoneNumberRegex.test(value)) error = 'Телефонният номер не е валиден';
                break;
            case 'region':
                if (!value) error = 'Регионът е задължителен';
                break;
            case 'municipality':
                if (!value) error = 'Общината е задължителна';
                break;
            case 'settlement':
                if (!value) error = 'Населеното място е задължително';
                break;
            case 'street':
                if (!value) error = 'Улицата е задължителна';
                break;
            case 'streetNumber':
                if (!value) error = 'Номерът на улицата е задължителен';
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const onBlurHandler = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
        console.log({ name, value });
    };


    const generateNumberOptions = (start, end) => {
        const options = [];
        for (let i = start; i <= end; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
        return options;
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <h3>Попълнете данните си</h3>

            <div className="avatar">
                <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                <Link to="#" className="change-avatar-link">Добави снимка</Link>
            </div>
            <div className="user-data">
                <div>
                    <label htmlFor="username">Потребителско име: <span>*</span></label>
                    <input type="text" id="username" name="username" value={form.username} onChange={handleInputChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.username ? '#BB1D3D' : '' }}
                    />

                    {errors.username && <span className="error">{errors.username}</span>}
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

                    <label htmlFor="firstName">Име:</label>
                    <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} onBlur={onBlurHandler} />
                    {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
                <div>
                    <label htmlFor="lastName">Фамилия:</label>
                    <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleInputChange} onBlur={onBlurHandler} />
                    {errors.lastName && <span className="error">{errors.lastName}</span>}
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
                <div>
                    <label htmlFor="phoneNumber">Телефон: <span>*</span></label>
                    <input type="text" id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} onBlur={onBlurHandler} required
                        style={{ borderColor: errors.phoneNumber ? '#BB1D3D' : '' }}
                    />
                    {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                </div>

            </div>

            <label>
                Област (Region): <span>*</span>
                <select name="region" value={form.region} onChange={handleRegionChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.region ? '#BB1D3D' : '' }}
                >
                    <option value="">Изберете регион</option>
                    {regions.map((region, index) => (
                        <option key={index} value={region.id}>{region.bg}</option>
                    ))}
                </select>
                {errors.region && <span className="error">{errors.region}</span>}
            </label>
            <label>
                Oбщина (Municipality): <span>*</span>
                <select name="municipality" value={form.municipality} onChange={handleMunicipalityChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.municipality ? '#BB1D3D' : '' }}
                >
                    <option value="">Изберете община</option>
                    {municipalities.map((municipality, index) => (
                        <option key={index} value={municipality.id}>{municipality.bg}</option>
                    ))}
                </select>
                {errors.municipality && <span className="error">{errors.municipality}</span>}
            </label>
            <label>
                Населено място (Settlement): <span>*</span>
                <select name="settlement" value={form.settlement} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.settlement ? '#BB1D3D' : '' }}
                >
                    <option value="">Избетере населено място</option>
                    {settlements.map((settlement, index) => (
                        <option key={index} value={settlement.id}>{settlement.bg}</option>
                    ))}
                </select>
                {errors.settlement && <span className="error">{errors.settlement}</span>}
            </label>
            <label>
                Квартал (District):
                <input type="text" name="district" value={form.district} onChange={handleInputChange} />
                {errors.district && <span className="error">{errors.district}</span>}
            </label>
            <label>
                Блок (Block):
                <input type="text" name="block" value={form.block} onChange={handleInputChange} />
                {errors.block && <span className="error">{errors.block}</span>}
            </label>
            <label>
                Улица (Street): <span>*</span>
                <input type="text" name="street" value={form.street} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.street ? '#BB1D3D' : '' }}
                />
                {errors.street && <span className="error">{errors.street}</span>}
            </label>
            <label>
                Номер улица (Street Number): <span>*</span>
                <input type="text" name="streetNumber" value={form.streetNumber} onChange={handleInputChange} onBlur={onBlurHandler} required
                    style={{ borderColor: errors.streetNumber ? '#BB1D3D' : '' }}
                />
                {errors.streetNumber && <span className="error">{errors.streetNumber}</span>}
            </label>

            <label>
                Умения: 
                <select name="skills" value={form.skills} onChange={handleRegionChange} onBlur={onBlurHandler}>
                    <option value="">Изберете</option> 
                </select>
            </label>
            <label>
                Професия: 
                <select name="workOptions" value={form.workOptions} onChange={handleRegionChange} onBlur={onBlurHandler}>
                    <option value="">Изберете</option> 
                </select>
            </label>
            <label>
            Интереси: 
                <select name="interestOptions" value={form.interestOptions} onChange={handleRegionChange} onBlur={onBlurHandler}>
                    <option value="">Изберете</option> 
                </select>
            </label>
            <span className="required-fields">Полетата с * са задължителни!</span>
            <button className="btn-general btn-green btn-profile" type="submit">Запази</button>
        </form>
    );
};

export default ProfileForm;

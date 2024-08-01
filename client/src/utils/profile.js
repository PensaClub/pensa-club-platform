export const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{6,16}$/;
export const nameRegex = /^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;
export const emailRegex = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const phoneNumberRegex = /^(?:\+\d{7,15}|\d{10})$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const validateField = (name, value, form = {}, t) => {

    let error = '';
    switch (name) {
        case 'username':
            if (!value) error = t('profile.username_required');
            else if (!usernameRegex.test(value)) error = t('profile.username_error');
            break;
        case 'email':
            if (!value) error = t('profile.email_required');
            else if (!emailRegex.test(value)) error =  t('profile.email_error');
            break;
        case 'firstName':
            if (value && !nameRegex.test(value)) error = t('profile.name_invalid');
            break;
        case 'lastName':
            if (value && !nameRegex.test(value)) error = t('profile.name_invalid');
            break;
        case 'phoneNumber':
            if (value && !phoneNumberRegex.test(value)) error = t('profile.phone_number_invalid');
            break;
        case 'region':
            if (!value) error = t('profile.region_required');
            break;
        case 'municipality':
            if (!value) error = t('profile.municipality_required');
            break;
        case 'settlement':
            if (!value) error = t('profile.settlement_required');
            break;
        case 'street':
            if (!value) error = t('profile.street_required');
            break;
        case 'password':
            if (!passwordRegex.test(value)) {
                error = t('profile.password_error');
            }
            break;
        case 'newPassword':
            if (!passwordRegex.test(value)) {
                error = t('profile.new_password_error');
            }
            break;
        case 'rePassword':
            if (value !== form.newPassword) {
                error = t('profile.password_match');
            }  
            break;
        default:
            break;
    }
    return error ;
 };

 export const generateNumberOptions = (start, end) => {
    const options = [];
    if (start >= end) {
        for (let i = start; i >= end; i--) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
    } else {
        for (let i = start; i <= end; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
    }
    return options;
};

export const trimObjectStrings = (obj) => {
    const trimmedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            trimmedObj[key] = typeof obj[key] === 'string' ? obj[key].trim() : obj[key];
        }
    }
    return trimmedObj;
};

export const resetFields = (setForm, initialFormState) => {
    setForm(initialFormState);
};
export const handleReset = (setForm, initialFormState) => {
    resetFields(setForm, initialFormState);
};
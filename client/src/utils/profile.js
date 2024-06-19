export const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{6,16}$/;
export const nameRegex = /^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;
export const emailRegex = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const phoneNumberRegex = /^(?:\+\d{7,15}|\d{10})$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const validateField = (name, value, form = {}) => {
    let error = '';
    switch (name) {
        case 'username':
            if (!value) error = 'Потребителското име е задължително';
            else if (!usernameRegex.test(value)) error = 'Потребителското име трябва да бъде между 7 и 16 символа. Може да съдържа главни букви, малки букви, цифри и _';
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
            if (!phoneNumberRegex.test(value)) error = 'Телефонният номер не е валиден';
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
        case 'currPassword':
            if (!passwordRegex.test(value)) {
                error = 'Паролата трябва да е поне 8 символа и да съдържа поне една буква и една цифра';
            }
            break;
        case 'password':
            if (!passwordRegex.test(value)) {
                error = 'Новата парола трябва да е поне 8 символа и да съдържа поне една буква и една цифра';
            }
            break;
        case 'rePassword':
            if (value !== form.password) {
                error = 'Паролите не съвпадат';
            }
           
            break;
        default:
            break;
    }
    return error;
};

export const generateNumberOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
        options.push(<option key={i} value={i}>{i}</option>);
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
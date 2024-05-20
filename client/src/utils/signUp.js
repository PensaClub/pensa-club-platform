export const trimFields = (fields) => {
    return fields.map(field => field.trim());
  };

const phoneRegex = /^(\+?\d{1,3})?\s?\d{9}$/;

export const resetFields = (setFields) => {
  setFields.forEach(setFields => setFields(''));
}

export const validatePhoneNumber = (phoneNumber, setErrors) => {
  if (!phoneNumber) {
    setErrors(prevErrors => ({
      ...prevErrors, phoneNumber: "Полето е задължително!"
    }));
  } else if (!phoneRegex.test(phoneNumber)) {
    setErrors(prevErrors => ({
      ...prevErrors, phoneNumber: "Невалиден телефонен номер!"
    }));
  } else {
    setErrors(prevErrors => ({
      ...prevErrors, phoneNumber: ''
    }));
  }
};

export const validatePassword = (password, setErrors) => {
  if (!password) {
    setErrors(prevErrors => ({
      ...prevErrors, password: "Полето е задължително!"
    }));
  } else if (password.length < 3) {
    setErrors(prevErrors => ({
      ...prevErrors, password: "Паролата трябва да бъде поне 3 символа!"
    }));
  } else {
    setErrors(prevErrors => ({
      ...prevErrors, password: ''
    }));
  }
};

export const validateRePassword = (password, rePassword, setErrors) => {
  if (password && rePassword !== password) {
    setErrors(prevErrors => ({
      ...prevErrors, rePassword: 'Паролите не съвпадат!'
    }));
  } else {
    setErrors(prevErrors => ({
      ...prevErrors, rePassword: ''
    }));
  }
};
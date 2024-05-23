export const trimFields = (fields) => {
    return fields.map(field => field.trim());
  };

  const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const resetFields = (setFieldFunctions) => {
  setFieldFunctions.forEach(setField => setField({ phoneNumber: '', password: '', rePassword: '' }));
};

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
  } else if (!passwordRegex.test(password)) {
    setErrors(prevErrors => ({
      ...prevErrors, password: "Паролата трябва да бъде поне 8 символа и да съдържа малка буква,  главна  буква и цифра!"
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
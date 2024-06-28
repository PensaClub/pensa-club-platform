export const trimFields = (fields) => {
  return fields.map((field) => field.trim());
};

  // const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const resetFields = (setFieldFunctions) => {
  setFieldFunctions.forEach((setField) => setField({ email: "", password: "", rePassword: "" }));
};

export const validateEmail = (email, setErrors) => {
  if (!email) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: "form.errors.required-field",
    }));
  } else if (!emailRegex.test(email)) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: "form.errors.invalid-email",
    }));
  } else {
    setErrors(prevErrors => ({
      ...prevErrors, email: ''
    }));
  }
};

export const validatePassword = (password, setErrors) => {
  if (!password) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: "form.errors.required-field",
    }));
  } else if (!passwordRegex.test(password)) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: "form.errors.password-format",
    }));
  // } else if (password.length < 3) {
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     password: "Паролата трябва да бъде поне 3 символа!",
  //   }));
  } else {
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: "",
    }));
  }
};

export const validateRePassword = (password, rePassword, setErrors) => {
  if (password && rePassword !== password) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      rePassword: "form.errors.passwords-not-match",
    }));
  } else {
    setErrors((prevErrors) => ({
      ...prevErrors,
      rePassword: "",
    }));
  }
};

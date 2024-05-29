import { useState } from "react";
import { trimFields, validateEmail, validatePassword, validateRePassword, resetFields } from "../../utils/signUp";

export const useForm = (initialValues, onSubmitHandler) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const onChangeHandler = (e) => {
    setValues((state) => ({ ...state, [e.target.name]: e.target.value }));
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        validateEmail(value, setErrors);
        break;
      case "password":
        validatePassword(value, setErrors);
        break;
      case "rePassword":
        validateRePassword(values.password, value, setErrors);
        break;
      default:
        break;
    }
  };

  const handleTrimFields = () => {
    const { email = "", password = "", rePassword = "" } = values;
    const [trimmedEmail, trimmedPassword, trimmedRePassword] = trimFields([email, password, rePassword]);
    setValues({
      email: trimmedEmail,
      password: trimmedPassword,
      rePassword: trimmedRePassword,
    });
  };
  const validate = () => {
    validateEmail(values.email, setErrors);
    validatePassword(values.password, setErrors);
    validateRePassword(values.password, values.rePassword, setErrors);
    return Object.keys(errors).every((key) => !errors[key]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleTrimFields();

    if (validate()) {
      if (onSubmitHandler) onSubmitHandler(values);
      resetFields([setValues, setErrors]);
    } else {
      console.log("Invalid form");
    }
  };

  const onChangeValues = (newValues) => {
    setValues(newValues);
  };

  return {
    onChangeHandler,
    onBlurHandler,
    values,
    onSubmit,
    onChangeValues,
    setValues,
    errors,
  };
};

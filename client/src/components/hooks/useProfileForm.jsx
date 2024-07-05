import { useState } from "react";
import { resetFields } from "../../utils/signUp";
import { validateField, trimObjectStrings } from "../../utils/profile";

export const useForm = (initialForm, initialValues, onSubmitHandler) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const onChangeHandler = (e) => {
    setValues((state) => ({ ...state, [e.target.name]: e.target.value }));
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

};

  const handleTrimFields = () => {
    const trimmedForm = trimObjectStrings(initialForm);
    setValues({
      ...trimmedForm
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleTrimFields();

    const isValid = Object.keys(trimmedForm).every((field) => {
        const value = trimmedForm[field];
        const error = validateField(field, value);
        setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
        return !error;
    });

    if (isValid) {
        if (onSubmitHandler) onSubmitHandler(values);
        resetFields(setValues, initialValues);
      } else {
        console.error("Invalid form");
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

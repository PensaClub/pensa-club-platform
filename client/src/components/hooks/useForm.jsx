import { useState } from "react";
import { trimFields, validateEmail, validatePassword, validateRePassword, resetFields } from "../../utils/signUp";

export const useForm = (initialValues, onSubmitHandler) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
console.log(errors);
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
        case "newPassword":
          validatePassword(value, setErrors);
          break;
          case "reNewPassword":
            validateRePassword(values.newPassword, value, setErrors);
            break;
      case "rePassword":
        validateRePassword(values.password, value, setErrors);
        break;
      default:
        break;
    }
  };

  const handleTrimFields = () => {
    const { email = "", password = "", rePassword = "", newPassword='',reNewPassword='' } = values;
    const [trimmedEmail, trimmedPassword, trimmedRePassword] = trimFields([email, password, rePassword,newPassword,reNewPassword]);
    setValues({
      email: trimmedEmail,
      password: trimmedPassword,
      rePassword: trimmedRePassword,
      newPassword: trimmedRePassword,
      reNewPassword: trimmedRePassword,
      
    });
  };
  const validate = () => {
    validateEmail(values.email, setErrors);
    validatePassword(values.password, setErrors);
    validatePassword(values.newPassword, setErrors);

    validateRePassword(values.password, values.rePassword, setErrors);
    validateRePassword(values.newPassword, values.reNewPassword, setErrors);

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

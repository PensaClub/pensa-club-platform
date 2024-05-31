import { Link } from "react-router-dom";
import "./loginRegister.css";

import { UserContext } from '../contexts/UserContext';
import { useContext, useEffect, useState } from 'react';
import { useForm } from '../hooks/useForm';

export const Register = ({ navToLogin }) => {
  const { onRegisterSubmit } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setReShowPassword] = useState(false);

  useEffect(() => {
  window.scrollTo({top:0})
},[])
  
  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
      password: "",
      rePassword: "",
    },
    onRegisterSubmit
  );

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleShowRePassword = () => {
    setReShowPassword((prevState) => !prevState);
  };

  return (
    <div className="container__form container--signup">
      <form action="#" className="form" id="form1" onSubmit={onSubmit}>
        <h2 className="form__title">Регистрация</h2>

        <label className="label" htmlFor="Email">
          Имейл
        </label>
        <input
          type="text"
          placeholder="ivanIvanov@abv.bg"
          className="input"
          name="email"
          value={values.email}
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label className="label" htmlFor="password">
          Парола
        </label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Парола"
            className="input"
            name="password"
            value={values.password}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
          />
          <span className="toggle-password" onClick={toggleShowPassword}>
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}

        <label className="label" htmlFor="rePassword">
          Повтори парола
        </label>
        <div className="password-input-container">
          <input
            type={showRePassword ? "text" : "password"}
            placeholder="Повтори парола"
            className="input"
            name="rePassword"
            value={values.rePassword}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
          />
          <span className="toggle-password" onClick={toggleShowRePassword}>
            {showRePassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

        {errors.rePassword && <p className="error">{errors.rePassword}</p>}

        <button className="btn-general btn-orange">Регистрация</button>
        <Link to="#" className="link link-hidden" onClick={navToLogin}>
          Вече имаш акаунт? <span>Вход</span>
        </Link>
      </form>
    </div>
  );
};

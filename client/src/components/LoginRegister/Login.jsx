import { Link } from "react-router-dom";

import "./loginRegister.css";
import { useAuthContext } from "../contexts/UserContext";
import { useForm } from "../hooks/useForm";
import { useState } from "react";

export const Login = ({ navToRegister }) => {
  const { onLoginSubmit } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
      password: "",
    },
    onLoginSubmit
  );
  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };
  return (
    <div className="container__form container--signin">
      <form action="#" className="form" id="form2" onSubmit={onSubmit}>
        <h2 className="form__title">Вход</h2>

        <label className="label" htmlFor="email">
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

        <Link to="#" className="link">
          Забравена парола?
        </Link>
        <button className="btn-general btn-orange">Вход</button>
        <Link to="/sign-up" className="link link-hidden" onClick={navToRegister}>
          Нямате акаунт? <span>Регистрация</span>
        </Link>
      </form>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { useState } from 'react';

import './loginRegister.css';
import { trimFields, resetFields, validatePhoneNumber, validatePassword } from '../../utils/signUp';

export const Login = ({ navToRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleTrimFields = () => {
    const [trimmedPhoneNumber, trimmedPassword] = trimFields([phoneNumber, password]);
    setPhoneNumber(trimmedPhoneNumber);
    setPassword(trimmedPassword);
  };

  const handleResetFields = () => {
    resetFields([setPhoneNumber, setPassword, () => setErrors({})]);
  };

  const validate = () => {
    validatePhoneNumber(phoneNumber, setErrors);
    validatePassword(password, setErrors);
    return Object.values(errors).every(error => !error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrimFields();

    if (validate()) {
      console.log('phone number:', phoneNumber);
      console.log('password:', password);
      console.log('Valid form');
      handleResetFields(); 

    } else {
      console.log('Invalid form');
    }
  };

  return (
    <div className="container__form container--signin">
      <form action="#" className="form" id="form2" onSubmit={handleSubmit}>
        <h2 className="form__title">Вход</h2>

        <label className="label" htmlFor="phoneNumber">Телефонен номер</label>
        <input
          type="text"
          placeholder="Телефонен номер +359..."
          className="input"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onBlur={() => { handleTrimFields(); validatePhoneNumber(phoneNumber, setErrors); }}
        />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}

        <label className="label" htmlFor="password">Парола</label>
        <input
          type="password"
          placeholder="Парола"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => { handleTrimFields(); validatePassword(password, setErrors); }}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <Link to="#" className="link">Забравена парола?</Link>
        <button className="btn-general btn-orange">Вход</button>
        <Link to="/sign-up" className="link link-hidden" onClick={navToRegister}>Нямате акаунт? <span>Регистрация</span></Link>
      </form>
    </div>
  );
};
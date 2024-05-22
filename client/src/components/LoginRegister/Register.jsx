import { useState } from 'react';
import { Link } from 'react-router-dom';

import './loginRegister.css';
import { trimFields, resetFields, validatePhoneNumber, validatePassword, validateRePassword } from '../../utils/signUp';

export const Register = ({ navToLogin }) => {

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [errors, setErrors] = useState({});

  
  const handleTrimFields = () => {
    const [trimmedPhoneNumber, trimmedPassword, trimmedRePassword] = trimFields([phoneNumber, password, rePassword]);
    setPhoneNumber(trimmedPhoneNumber);
    setPassword(trimmedPassword);
    setRePassword(trimmedRePassword);
  };

  const handleResetFields = () => {
    resetFields([setPhoneNumber, setPassword, setRePassword, () => setErrors({})]);
  };

  const validate = () => {
    validatePhoneNumber(phoneNumber, setErrors);
    validatePassword(password, setErrors);
    validateRePassword(password, rePassword, setErrors);
    return Object.keys(errors).every(key => !errors[key]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrimFields();

    if (validate()) {
      console.log('Valid form');
      console.log('phone number:', phoneNumber)
      console.log('password:', password)
      console.log('rePassword:', rePassword)
      handleResetFields();

    } else {
      console.log('Invalid form');
    }
  };

  return (
    <div className="container__form container--signup">
      <form action="#" className="form" id="form1" onSubmit={handleSubmit}>
        <h2 className="form__title">Регистрация</h2>

        <label className="label" htmlFor="phoneNumber">Телефонен номер</label>
        <input
          type="text"
          placeholder="Телефонен номер +359.."
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

        <label className="label" htmlFor="rePassword">Повтори парола</label>
        <input
          type="password"
          placeholder="Повтори парола"
          className="input"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          onBlur={() => { handleTrimFields(); validateRePassword(password, rePassword, setErrors); }}
        />
        {errors.rePassword && <p className="error">{errors.rePassword}</p>}

        <button className="btn-general btn-orange">Регистрация</button>
        <Link to="#" className="link link-hidden" onClick={navToLogin}>Вече имаш акаунт? <span>Вход</span></Link>
      </form>
    </div>
  );
};
import { useState } from 'react';
import './loginRegister.css';

export const Register = ({ navToLogin }) => {

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [errors, setErrors] = useState({});

  const phoneRegex = /^(\+?\d{1,3})?\s?\d{9}$/;

  const trimFields = () => {
    setPhoneNumber(phoneNumber.trim());
    setPassword(password.trim());
    setRePassword(rePassword.trim());
  };

  const validatePhoneNumber = () => {
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

  const validatePassword = () => {
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

  const validateRePassword = () => {
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

  const validate = () => {
    validatePhoneNumber();
    validatePassword();
    validateRePassword();
    return Object.keys(errors).some(key => !errors[key]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    trimFields();
    if (validate()) {
      console.log('Valid form');
      console.log('phone number:', phoneNumber)
      console.log('password:', password)
      console.log('rePassword:', rePassword)
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
          onBlur={() => { trimFields(); validatePhoneNumber(); }}
        />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}

        <label className="label" htmlFor="password">Парола</label>
        <input
          type="password"
          placeholder="Парола"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => { trimFields(); validatePassword(); }}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <label className="label" htmlFor="rePassword">Повтори парола</label>
        <input
          type="password"
          placeholder="Повтори парола"
          className="input"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          onBlur={() => { trimFields(); validateRePassword(); }}
        />
        {errors.rePassword && <p className="error">{errors.rePassword}</p>}

        <button className="btn">Регистрация</button>
        <a href="#" className="link link-hidden" onClick={navToLogin}>Вече имаш акаунт? <span>Вход</span></a>
      </form>
    </div>
  );
};
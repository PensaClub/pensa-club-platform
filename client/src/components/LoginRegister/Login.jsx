import './loginRegister.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export const Login = ({ navToRegister }) => {

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const phoneRegex = /^(\+?\d{1,3})?\s?\d{9}$/;

  const trimFields = () => {
    setPhoneNumber(phoneNumber.trim());
    setPassword(password.trim());

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

  const validate = () => {
    validatePhoneNumber();
    validatePassword();
    return Object.keys(errors).some(key => !errors[key]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    trimFields();
    if (validate()) {
      console.log('phone number:', phoneNumber)
      console.log('password:', password)
      console.log('Valid form');
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
          onBlur={() => { trimFields(); validatePhoneNumber(); }}
        />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}

        <label className="label" htmlFor="password">Парола</label>
        <input type="password"
          placeholder="Парола"
          className="input"
          alue={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => { trimFields(); validatePassword(); }}
        />

        {errors.password && <p className="error">{errors.password}</p>}

        <a href="#" className="link">Забравена парола?</a>
        <button className="btn">Вход</button>
        <Link to="/sign-up" className="link link-hidden" onClick={navToRegister}>Нямате акаунт? <span>Регистрация</span></Link>
      </form>
    </div>
  )
}


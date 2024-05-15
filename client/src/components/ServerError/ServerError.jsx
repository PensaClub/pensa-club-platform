import './serverError.css';

import { Link } from 'react-router-dom';

export const ServerError = () => {
  return (
    <div className="not-found">
      <h1>500 </h1>
      <h2>Сървърна грешка</h2>
      <p>Върнете се към</p>

      <ul className="menu-list">
        <li className="menu-item">
          <Link to="/" className="menu-link">Начало</Link>
        </li>
        <li className="menu-item">
          <Link to="/map" className="menu-link">Карта</Link>
        </li>
        <li className="menu-item">
          <Link to="/craigslist" className="menu-link">Лист</Link>
        </li>
      </ul>
    </div>
  );
};

import { Link } from 'react-router-dom';
import './errorPageBase.css'; // Assuming you save the CSS part in an App.css file

export const ErrorPageBase = ({ errorCode, errorDesc }) => {
  return (
    <>
      <div className="bg-container"></div>
      <div className="not-found-container">
        <div className="not-found">
          <h1>Грешка {errorCode}</h1>

          <h2>{errorDesc}</h2>
          {/* <h3>Върнете се към</h3> */}

          <ul className="menu-list">
            <li className="menu-item">
              <Link to="/" className="menu-link">
                Начало
              </Link>
            </li>
            <li className="menu-item">
              <Link to="/map" className="menu-link">
                Карта
              </Link>
            </li>
            <li className="menu-item">
              <Link to="/craigslist" className="menu-link">
                Лист
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

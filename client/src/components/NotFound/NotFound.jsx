import { Link } from 'react-router-dom';
import './notFound.css'; // Assuming you save the CSS part in an App.css file
import { NoSignal } from './NoSignal/NoSignal';

export const NotFound = () => {
  return (
    <>
      <div className="not-found-container">
        <div className="not-found">
          <h1>404</h1>

          <h2>Не съществува такава страница</h2>
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

      <NoSignal />
    </>
  );
};

/* <h1>404 </h1>
      <h2>Не съществува такава страница</h2>
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
      </ul> */

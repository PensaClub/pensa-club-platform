import { NavLink } from 'react-router-dom';
import './errorPageBase.css'; 

export const ErrorPageBase = ({ errorCode, errorDesc }) => {


  
  return (
    
      <div className="container-wrapper">
      <div className="not-found">
        <h1>Грешка {errorCode}</h1>

        <h2>{errorDesc}</h2>
        {/* <h3>Върнете се към</h3> */}

        <div className="menu-list">
          <NavLink to="/" className="btn-general btn-green">
            Начало
          </NavLink>

          <NavLink to="/map" className="btn-general btn-green">
            Карта
          </NavLink>

          <NavLink to="/craigslist" className="btn-general btn-green">
            Лист
          </NavLink>
        </div>
      </div>
    </div>
    
  );
};

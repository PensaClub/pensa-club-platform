import "./menuCommunity.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocation, faHouseUser, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/UserContext";

export const MenuCommunity = () => {
    const { isAuthentication } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    
    const handleNavigation = (path) => {
        navigate(path);
    };
    
    const handleUserClick = () => {
        if (!isAuthentication) {
            navigate('/profile');
        } else {
            navigate('/sign-up');
        }
    };

    const handleReloadPage = () => {
        navigate('/craigslist?reset=true');
    };

    const getLocation = (path) => {
        return location.pathname === path ? 'commun-menu-icons active' : 'commun-menu-icons';
    };

    return (
        <>
            <nav className="menu-community">
                <FontAwesomeIcon icon={faHouseUser} className={getLocation('/')} onClick={() => handleNavigation('/')} />
                <FontAwesomeIcon icon={faMapLocation} className={getLocation('/map')} onClick={() => handleNavigation('/map')} />
                <FontAwesomeIcon icon={faBars} className={getLocation('/craigslist')} onClick={handleReloadPage} />
                <FontAwesomeIcon icon={faUser} className={getLocation('/profile')} onClick={handleUserClick} />
            </nav>
        </>
    );
};

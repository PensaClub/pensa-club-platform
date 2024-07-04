import "./menuCommunity.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocation,faHouseUser,faUser,faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/UserContext";

export const MenuCommunity = () => {

    const {isAuthentication} = useAuthContext();

    const navigate = useNavigate();
    const handleNavigation = (path) => {
        navigate(path);
    };
    const handleUserClick=()=>{
    if(!isAuthentication){

        navigate('/profile')
    }
    navigate('/sign-up')
}
    return(
        <>
            <nav className="menu-community">
            <FontAwesomeIcon icon={faHouseUser} className="commun-menu-icons" onClick={()=>handleNavigation('/')} />
            <FontAwesomeIcon icon={faMapLocation} className="commun-menu-icons" onClick={()=>handleNavigation('/map')} />
            <FontAwesomeIcon icon={faBars} className="commun-menu-icons" />
            <FontAwesomeIcon icon={faUser} className="commun-menu-icons" onClick={handleUserClick}/>
            </nav>
        </>
    )
}


import { useContext, useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom'
import './header.css'
import { UserContext } from "../contexts/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightToBracket, faAddressCard, faUser, faArrowRightFromBracket, faMap,faBars } from '@fortawesome/free-solid-svg-icons';

export const Header = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const { isAuthentication, } = useContext(UserContext)
    const dropdownRef = useRef(null)

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false)
            setMenuOpen(!isMenuOpen)
        }
    }
    const handleDropdownToggle = () => {
        setDropdownOpen(!isDropdownOpen);
        setMenuOpen(!isMenuOpen)
    };

    const handleDropdownItemClick = () => {
        setDropdownOpen(false);
        setMenuOpen(!isMenuOpen)
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        setMenuOpen(!isMenuOpen)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            setMenuOpen(!isMenuOpen)

        }
    }, [])
 
    return (
        <section className="site-header">
            <header className={isMenuOpen ? 'scrolled' : ''}>
                <Link to="/">
                    <img src='/images/homePage/logo.png' alt="logo" className="logo" /> Pensa Club
                </Link>
                <section className="navy">
                    <nav className="navbar">
                        <Link to="/map" className="nav-item" style={{ '--i': 0 }}>Map</Link>
                        <Link to="/craigslist" className="nav-item" style={{ '--i': 1 }}>Craigslist</Link>
                    </nav>
                    <div className="dropdown" ref={dropdownRef}>
                        <input
                            type="checkbox"
                            id="dropdown-toggle"
                            className="dropdown-checkbox"
                            checked={isDropdownOpen}
                            onChange={handleDropdownToggle}
                        />
                        <label htmlFor="dropdown-toggle" className="dropdown-toggle">
                            <img src="http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g" alt="Profile" className="profile-img" />
                        </label>

                        <div className={`dropdown-menu dropdown-menu-right rounded-0 ${isDropdownOpen ? 'active' : ''}`}>
                            <div className="social-icons-header">
                                <FontAwesomeIcon icon={faMap} className= "social-mobile"/>
                                <Link to="/map" className="dropdown-item desktop-unactive" onClick={handleDropdownItemClick}>Map</Link>
                            </div>
                            <div className="social-icons-header">
                            <FontAwesomeIcon className= "social-mobile" icon={faBars} />
                                <Link to="/craigslist" className="dropdown-item desktop-unactive" onClick={handleDropdownItemClick}>Craiglist</Link>
                            </div>
                            {!isAuthentication && <>
                                <div className="social-icons-header">
                                    <FontAwesomeIcon icon={faArrowRightToBracket} /> 
                                    <Link to="/sign-up?view=login" className="dropdown-item" onClick={handleDropdownItemClick}>Login</Link>
                                </div>
                                <div className="social-icons-header">
                                    <FontAwesomeIcon icon={faAddressCard} />
                                    <Link to="/sign-up?view=register" className="dropdown-item" onClick={handleDropdownItemClick}>Register</Link>
                                </div>
                            </>}
                            {isAuthentication && <>
                                <div className="social-icons-header"><FontAwesomeIcon icon={faUser} />
                                    <Link to="/profile" className="dropdown-item" onClick={handleDropdownItemClick}>Profile</Link>
                                </div>

                                <div className="social-icons-header"><FontAwesomeIcon icon={faArrowRightFromBracket} />
                                    <Link to="/logout" className="dropdown-item" onClick={handleDropdownItemClick}>Logout</Link>
                                </div>

                            </>}
                        </div>
                    </div>
                </section>
            </header>
            <div className="after-header"></div>
        </section>

    )
}
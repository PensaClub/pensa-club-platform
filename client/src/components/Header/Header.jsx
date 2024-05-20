import { useState } from "react";
import {Link} from 'react-router-dom'
import './header.css'
import  { Link } from "react-router-dom";

export const Header = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    
    return (
        <section className="site-header">
            <header className={isMenuOpen ? 'scrolled' : ''}>
                <Link to="/">
                    <img src='/images/homePage/logo.png' alt="logo" className="logo" /> Pensa Club
                </Link>
                <input type="checkbox" id="check" checked={isMenuOpen} onChange={() => setMenuOpen(!isMenuOpen)} />
                <label htmlFor="check" className="icons">
                    <i className="bx bx-menu" id="menu-icon"></i>
                    <i className="bx bx-x" id="close-icon"></i>
                </label>
                <nav className="navbar">
                    <Link to="/map"className="nav-item" style={{ '--i': 0 }}>Map</Link>
                    <Link to="/craigslist" className="nav-item" style={{ '--i': 1 }}>Craigslist</Link>
                    <Link to="/#" className="nav-item" style={{ '--i': 2 }}>SignUp</Link>
                    {/* <a href="/#" className="nav-item" style={{ '--i': 3 }}>Register</a> */}
                </nav>
            </header>
            <div className="after-header"></div>
        </section>
    )
}
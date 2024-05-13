import { useState } from "react";
import './header.css'

export const Header = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    
    return (
        <section className="site-header">
            <header className={isMenuOpen ? 'scrolled' : ''}>
                <a href="/">
                    <img src='/images/homePage/logo.png' alt="logo" className="logo" /> Penca Club
                </a>
                <input type="checkbox" id="check" checked={isMenuOpen} onChange={() => setMenuOpen(!isMenuOpen)} />
                <label htmlFor="check" className="icons">
                    <i className="bx bx-menu" id="menu-icon"></i>
                    <i className="bx bx-x" id="close-icon"></i>
                </label>
                <nav className="navbar">
                    <a href="/#" className="nav-item" style={{ '--i': 0 }}>Map</a>
                    <a href="/#" className="nav-item" style={{ '--i': 1 }}>Craigslist</a>
                    <a href="/#" className="nav-item" style={{ '--i': 2 }}>Login</a>
                    <a href="/#" className="nav-item" style={{ '--i': 3 }}>Register</a>
                </nav>
            </header>
            <div className="after-header"></div>
        </section>
    )
}
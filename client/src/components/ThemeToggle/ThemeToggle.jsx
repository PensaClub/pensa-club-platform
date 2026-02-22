import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './themeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    if (!location.pathname.startsWith('/academy')) return null;

    return (
        <div className="tt-wrapper">
            <button
                className="tt-capsule"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Тъмна тема' : 'Светла тема'}
                title={theme === 'light' ? 'Тъмна тема' : 'Светла тема'}
            >
                <span className="tt-stars" />
                <span className="tt-clouds">
                    <span className="tt-cloud tt-cloud--1" />
                    <span className="tt-cloud tt-cloud--2" />
                    <span className="tt-cloud tt-cloud--3" />
                </span>
                <span className="tt-knob">
                    
                    <span className="tt-knob-icon tt-knob-sun">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="4.5" />
                            <line x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="20" x2="12" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.5" y1="4.5" x2="6.2" y2="6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="17.8" y1="17.8" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="1.5" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="20" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.5" y1="19.5" x2="6.2" y2="17.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="17.8" y1="6.2" x2="19.5" y2="4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </span>
                    
                    <span className="tt-knob-icon tt-knob-moon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    </span>
                </span>
                <span className="tt-label tt-label-light">Light</span>
                    <span className="tt-label tt-label-dark">Dark</span>
            </button>
        </div>
    );
};

export default ThemeToggle;

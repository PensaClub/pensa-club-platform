import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const path = window.location.pathname;
        const isFactCheckPage = path.includes('/fact-check');

        // Only use fc-theme if actually ON a fact-check page right now
        if (isFactCheckPage && localStorage.getItem('fc-page-active') === 'true') {
            return localStorage.getItem('fc-theme') || 'light';
        }

        // Clean up stale fc-page-active flag if not on fact-check page
        if (!isFactCheckPage) {
            localStorage.removeItem('fc-page-active');
        }

        return localStorage.getItem('academy-theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('academy-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Always remove both first to avoid conflicts
        root.classList.remove('dark');

        // If theme is dark or default (which is dark in this app), add 'dark' class
        if (theme === 'dark' || theme === 'default') {
            root.classList.add('dark');
        } else {
            // explicit light mode, do nothing (ensure 'dark' is gone)
        }

        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

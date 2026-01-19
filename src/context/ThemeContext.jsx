import { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Local theme preference
    const [localTheme, setLocalTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    // Global settings from DB
    const [settings, setSettings] = useState({ forcedTheme: 'none', showTranslator: true, showVoiceAI: true, showChatNote: true });

    // 1. Fetch settings on mount (and periodically/realtime if needed)
    useEffect(() => {
        const fetchSettings = async () => {
            const data = await dbService.getSettings();
            setSettings(data);
        };
        fetchSettings();

        // Optional: Poll every 30s to keep in sync without complex listeners
        const interval = setInterval(fetchSettings, 30000);
        return () => clearInterval(interval);
    }, []);

    // 2. Determine effective theme
    const activeTheme = settings.forcedTheme !== 'none' ? settings.forcedTheme : localTheme;

    // 3. Apply theme to document
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('dark');

        if (activeTheme === 'dark' || activeTheme === 'default') {
            root.classList.add('dark');
        }

        root.setAttribute('data-theme', activeTheme);

        // Only save to local storage if it's the user's choice
        if (settings.forcedTheme === 'none') {
            localStorage.setItem('theme', activeTheme);
        }
    }, [activeTheme, settings.forcedTheme]);

    const toggleTheme = (newTheme) => {
        if (settings.forcedTheme === 'none') {
            setLocalTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme: activeTheme, toggleTheme, settings }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

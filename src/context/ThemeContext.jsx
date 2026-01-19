import { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Local theme preference
    const [localTheme, setLocalTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    // Global settings from DB
    const [settings, setSettings] = useState({ forcedTheme: 'none', showTranslator: true, showVoiceAI: true, showChatNote: true });

    // 1. Real-time settings sync
    useEffect(() => {
        // Ensure settings exist first (logic moved from dbService into initial check can be helpful, 
        // but calling getSettings once ensures creation if missing)
        dbService.getSettings();

        const docRef = doc(db, 'settings', 'global');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            } else {
                // Fallback defaults
                setSettings({
                    forcedTheme: 'none',
                    showTranslator: true,
                    showVoiceAI: true,
                    showChatNote: true,
                    alertMessage: '',
                    showAlert: false
                });
            }
        }, (error) => {
            console.error("Settings sync error:", error);
        });

        return () => unsubscribe();
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

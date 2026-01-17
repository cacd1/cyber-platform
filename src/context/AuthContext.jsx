import { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Representative Session
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    // Student Access Code Session
    const [accessCode, setAccessCode] = useState(() => {
        return localStorage.getItem('accessCode') || null;
    });

    // Derived state: Active Representative ID (from login OR code)
    const [activeRepId, setActiveRepId] = useState(null);

    useEffect(() => {
        if (user) {
            setActiveRepId(user.id);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    useEffect(() => {
        if (accessCode) {
            const rep = mockDb.getRepByCode(accessCode);
            if (rep) setActiveRepId(rep.id);
            localStorage.setItem('accessCode', accessCode);
        } else if (!user) {
            // Only clear if no user logged in
            if (!user) setActiveRepId(null);
            localStorage.removeItem('accessCode');
        }
    }, [accessCode, user]);

    const login = (email, password) => {
        const rep = mockDb.getRepByEmail(email);
        if (rep && rep.password === password) {
            setUser(rep);
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
    };

    const enterCode = (code) => {
        const rep = mockDb.getRepByCode(code);
        if (rep) {
            setAccessCode(rep.accessCode);
            return { success: true, repName: rep.name };
        }
        return { success: false, error: 'Invalid access code' };
    };

    const exitCode = () => {
        setAccessCode(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessCode,
            activeRepId,
            isAuthenticated: !!user,
            hasAccessCode: !!accessCode,
            login,
            logout,
            enterCode,
            exitCode
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

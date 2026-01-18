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

    // Rate Limit Helper
    const checkRateLimit = (key, maxAttempts, cooldownMinutes) => {
        const data = JSON.parse(localStorage.getItem(key) || '{"attempts": 0, "lockoutTime": null}');
        const now = Date.now();

        if (data.lockoutTime) {
            if (now < data.lockoutTime) {
                const remaining = Math.ceil((data.lockoutTime - now) / 60000);
                return {
                    allowed: false,
                    error: `Too many attempts. Please wait ${remaining} minutes.`
                };
            } else {
                // Lockout expired
                data.attempts = 0;
                data.lockoutTime = null;
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
        return { allowed: true, data };
    };

    const recordAttempt = (key, data, maxAttempts, cooldownMinutes) => {
        data.attempts += 1;
        if (data.attempts >= maxAttempts) {
            data.lockoutTime = Date.now() + cooldownMinutes * 60 * 1000;
        }
        localStorage.setItem(key, JSON.stringify(data));
    };

    const login = (email, password) => {
        const rateLimit = checkRateLimit('rep_login_attempts', 4, 15);
        if (!rateLimit.allowed) return { success: false, error: rateLimit.error };

        const rep = mockDb.getRepByEmail(email);
        if (rep && rep.password === password) {
            setUser(rep);
            localStorage.removeItem('rep_login_attempts'); // Reset on success
            return { success: true };
        }

        recordAttempt('rep_login_attempts', rateLimit.data, 4, 15);
        return { success: false, error: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
    };

    const enterCode = (code) => {
        const rateLimit = checkRateLimit('student_code_attempts', 4, 10);
        if (!rateLimit.allowed) return { success: false, error: rateLimit.error };

        const rep = mockDb.getRepByCode(code);
        if (rep) {
            setAccessCode(rep.accessCode);
            localStorage.removeItem('student_code_attempts'); // Reset on success
            return { success: true, repName: rep.name };
        }

        recordAttempt('student_code_attempts', rateLimit.data, 4, 10);

        // Specific error for 2nd attempt (which means attempts became 2 after this failure)
        // Wait, data.attempts was incremented inside recordAttempt.
        // So if data.attempts is 2 now...
        if (rateLimit.data.attempts === 2) {
            return { success: false, error: 'Incorrect code. Please check with your representative.' }; // Custom message requested? "دزله هالاشهار"
            // User said: "في حال الطالب كتب الكود مرتين خطاء دزله هالاشهار" - assuming "this notification". I'll format it nicely.
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

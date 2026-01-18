import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Representative Session
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Student Access Code Session
    const [accessCode, setAccessCode] = useState(() => {
        return localStorage.getItem('accessCode') || null;
    });

    // Derived state: Active Representative ID (from login OR code)
    const [activeRepId, setActiveRepId] = useState(null);

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch extra profile data
                const docRef = doc(db, 'representatives', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser({ uid: currentUser.uid, ...docSnap.data() });
                } else {
                    setUser(currentUser); // Should ideally have profile
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (user) {
            setActiveRepId(user.uid); // Use UID as the common ID
        }
    }, [user]);

    // Handle Active Rep ID when using Access Code
    useEffect(() => {
        const fetchRepByCode = async () => {
            if (accessCode && !user) {
                // We need to resolve the rep ID from the code
                try {
                    const q = query(collection(db, 'representatives'), where('accessCode', '==', accessCode));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        setActiveRepId(querySnapshot.docs[0].id);
                    }
                } catch (e) {
                    console.error("Error resolving code:", e);
                }
            } else if (!user && !accessCode) {
                setActiveRepId(null);
            }
        };
        fetchRepByCode();
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

    const login = async (email, password) => {
        const rateLimit = checkRateLimit('rep_login_attempts', 4, 15);
        if (!rateLimit.allowed) return { success: false, error: rateLimit.error };

        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.removeItem('rep_login_attempts');
            return { success: true };
        } catch (error) {
            console.error("Login Check:", error);
            recordAttempt('rep_login_attempts', rateLimit.data, 4, 15);
            return { success: false, error: 'Invalid credentials' };
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const enterCode = async (code) => {
        const rateLimit = checkRateLimit('student_code_attempts', 4, 10);
        if (!rateLimit.allowed) return { success: false, error: rateLimit.error };

        try {
            const q = query(collection(db, 'representatives'), where('accessCode', '==', code));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const repData = querySnapshot.docs[0].data();
                setAccessCode(code);
                localStorage.setItem('accessCode', code);
                localStorage.removeItem('student_code_attempts');
                return { success: true, repName: repData.name };
            }
        } catch (e) {
            console.error("Enter Code Error:", e);
            return { success: false, error: "System Error: " + e.message };
        }

        recordAttempt('student_code_attempts', rateLimit.data, 4, 10);

        if (rateLimit.data.attempts === 2) {
            return { success: false, error: 'Incorrect code. Please check with your representative.' };
        }

        return { success: false, error: 'Invalid access code' };
    };

    const exitCode = () => {
        setAccessCode(null);
        localStorage.removeItem('accessCode');
        setActiveRepId(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessCode,
            activeRepId,
            isAuthenticated: !!user,
            hasAccessCode: !!accessCode,
            loading,
            login,
            logout,
            enterCode,
            exitCode
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

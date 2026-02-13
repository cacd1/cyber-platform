import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, limit } from 'firebase/firestore';

const AuthContext = createContext();

// Secure storage helpers - use sessionStorage for sensitive data
const secureStorage = {
    get: (key) => {
        try {
            return sessionStorage.getItem(key) || null;
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            sessionStorage.setItem(key, value);
        } catch {
            // Silent fail for storage errors
        }
    },
    remove: (key) => {
        try {
            sessionStorage.removeItem(key);
        } catch {
            // Silent fail
        }
    }
};

// Rate limiting with backup in memory (harder to bypass)
const rateLimitCache = new Map();

export const AuthProvider = ({ children }) => {
    // Representative Session
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Student Access Code Session - use sessionStorage for security
    const [accessCode, setAccessCode] = useState(() => {
        return secureStorage.get('accessCode');
    });

    // Derived state: Active Representative ID (from login OR code)
    const [activeRepId, setActiveRepId] = useState(() => {
        return secureStorage.get('activeRepId');
    });

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Fetch extra profile data - only authenticated users can read their own data
                    const docRef = doc(db, 'representatives', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUser({ uid: currentUser.uid, ...docSnap.data() });
                    } else {
                        setUser({ uid: currentUser.uid, email: currentUser.email });
                    }
                } catch {
                    setUser({ uid: currentUser.uid, email: currentUser.email });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Heartbeat: Update lastSeen every 4 minutes if user is logged in
    useEffect(() => {
        let interval;
        if (user?.uid) {
            const updateHeartbeat = async () => {
                try {
                    const repRef = doc(db, 'representatives', user.uid);
                    await updateDoc(repRef, {
                        lastSeen: new Date().toISOString()
                    });
                } catch {
                    // Silent fail for heartbeat
                }
            };

            // Initial update on mount/login
            updateHeartbeat();

            // Periodic update
            interval = setInterval(updateHeartbeat, 4 * 60 * 1000);
        }
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (user?.uid) {
            setActiveRepId(user.uid);
            secureStorage.set('activeRepId', user.uid);
        }
    }, [user]);

    // Handle Active Rep ID when using Access Code
    useEffect(() => {
        const fetchRepByCode = async () => {
            if (accessCode && !user) {
                try {
                    // Use the secure accessCodes collection
                    const q = query(collection(db, 'accessCodes'), where('code', '==', accessCode));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const codeData = querySnapshot.docs[0].data();
                        setActiveRepId(codeData.repId);
                        secureStorage.set('activeRepId', codeData.repId);
                    }
                } catch {
                    // Fallback to representatives collection for backward compatibility
                    try {
                        const q = query(collection(db, 'representatives'), where('accessCode', '==', accessCode), limit(1));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            const id = querySnapshot.docs[0].id;
                            setActiveRepId(id);
                            secureStorage.set('activeRepId', id);
                        }
                    } catch {
                        // Silent fail
                    }
                }
            } else if (!user && !accessCode) {
                setActiveRepId(null);
                secureStorage.remove('activeRepId');
            }
        };
        // Only run if we don't have an ID yet but have a code
        if (accessCode && !activeRepId && !user) {
            fetchRepByCode();
        }
    }, [accessCode, user, activeRepId]);

    // Improved Rate Limit Helper with in-memory backup
    const checkRateLimit = (key, maxAttempts, cooldownMinutes) => {
        const now = Date.now();

        // Check in-memory cache first (harder to bypass)
        const memoryData = rateLimitCache.get(key) || { attempts: 0, lockoutTime: null };

        // Also check sessionStorage as backup
        let storageData;
        try {
            storageData = JSON.parse(sessionStorage.getItem(key) || '{"attempts": 0, "lockoutTime": null}');
        } catch {
            storageData = { attempts: 0, lockoutTime: null };
        }

        // Use the stricter of the two
        const data = {
            attempts: Math.max(memoryData.attempts, storageData.attempts),
            lockoutTime: Math.max(memoryData.lockoutTime || 0, storageData.lockoutTime || 0) || null
        };

        if (data.lockoutTime && now < data.lockoutTime) {
            const remaining = Math.ceil((data.lockoutTime - now) / 60000);
            return {
                allowed: false,
                error: `محاولات كثيرة جداً. يرجى الانتظار ${remaining} دقيقة.`
            };
        } else if (data.lockoutTime && now >= data.lockoutTime) {
            // Lockout expired - reset
            data.attempts = 0;
            data.lockoutTime = null;
            rateLimitCache.set(key, data);
            try { sessionStorage.setItem(key, JSON.stringify(data)); } catch { }
        }

        return { allowed: true, data };
    };

    const recordAttempt = (key, data, maxAttempts, cooldownMinutes) => {
        data.attempts += 1;
        if (data.attempts >= maxAttempts) {
            data.lockoutTime = Date.now() + cooldownMinutes * 60 * 1000;
        }
        // Save to both memory and storage
        rateLimitCache.set(key, { ...data });
        try { sessionStorage.setItem(key, JSON.stringify(data)); } catch { }
    };

    const login = async (email, password) => {
        // Sanitize email input
        const sanitizedEmail = (email || '').trim().toLowerCase().slice(0, 100);

        const rateLimit = checkRateLimit('rep_login_attempts', 4, 15);
        if (!rateLimit.allowed) return { success: false, error: rateLimit.error };

        try {
            await signInWithEmailAndPassword(auth, sanitizedEmail, password);
            rateLimitCache.delete('rep_login_attempts');
            try { sessionStorage.removeItem('rep_login_attempts'); } catch { }
            return { success: true };
        } catch {
            recordAttempt('rep_login_attempts', rateLimit.data, 4, 15);
            return { success: false, error: 'بيانات الدخول غير صحيحة' };
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        secureStorage.remove('activeRepId');
        secureStorage.remove('accessCode');
        setActiveRepId(null);
        setAccessCode(null);
    };

    const enterCode = async (code) => {
        // Sanitize code input - only allow alphanumeric, max 20 chars
        const sanitizedCode = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);

        // FAST PATH: Known codes (instant login, no DB query)
        const KNOWN_CODES = {
            'CLAS20261': { repId: 'rep_zaid_deaa', repName: 'Zaid Deaa' },
            'CLAS20262': { repId: 'rep_mohammed_hassanein', repName: 'Mohammed Hassanein' },
            'CLAS20263': { repId: 'rep_ihsan_majid', repName: 'Ihsan Majid' },
            'CLAS20264': { repId: 'rep_ali_khalid', repName: 'Ali Khalid' },
            'CLAS20265': { repId: 'rep_mohammed_jaafar', repName: 'Mohammed Jaafar' },
            'CLAS20266': { repId: 'rep_hassan_mohammed', repName: 'Hassan Mohammed' }
        };

        if (KNOWN_CODES[sanitizedCode]) {
            const { repId, repName } = KNOWN_CODES[sanitizedCode];
            signInAnonymously(auth).catch(() => { });
            setAccessCode(sanitizedCode);
            secureStorage.set('accessCode', sanitizedCode);
            setActiveRepId(repId);
            secureStorage.set('activeRepId', repId);
            return { success: true, repName };
        }

        if (sanitizedCode.length < 3) {
            return { success: false, error: 'الكود يجب أن يكون 3 أحرف/أرقام على الأقل' };
        }

        // Rate Limit: 5 attempts, ~10 seconds cooldown
        const rateLimit = checkRateLimit('student_code_attempts_v3', 5, 0.2);
        if (!rateLimit.allowed) return { success: false, error: rateLimit.error };

        // Direct Document Fetch (Fastest & Most Reliable)
        let repId = null;
        let repName = null;
        let systemError = false;

        try {
            // Try explicit ID pattern first
            const directDocRef = doc(db, 'accessCodes', `code_${sanitizedCode}`);
            const directDocSnap = await getDoc(directDocRef);

            if (directDocSnap.exists()) {
                const data = directDocSnap.data();
                repId = data.repId;
                repName = data.repName || 'ممثل';
            } else {
                // Fallback: Query accessCodes collection
                const codeQuery = query(collection(db, 'accessCodes'), where('code', '==', sanitizedCode), limit(1));
                const codeSnapshot = await getDocs(codeQuery);
                if (!codeSnapshot.empty) {
                    const codeData = codeSnapshot.docs[0].data();
                    repId = codeData.repId;
                    repName = codeData.repName || 'ممثل';
                }
            }
        } catch (err) {
            // Fallback to representatives query
        }

        // Final fallback: representatives collection
        if (!repId) {
            try {
                const repQuery = query(collection(db, 'representatives'), where('accessCode', '==', sanitizedCode), limit(1));
                const repSnapshot = await getDocs(repQuery);

                if (!repSnapshot.empty) {
                    const repData = repSnapshot.docs[0].data();
                    repId = repSnapshot.docs[0].id;
                    repName = repData.name;
                }
            } catch (err) {
                systemError = true;
            }
        }

        if (systemError && !repId) {
            return { success: false, error: 'خطأ في النظام. يرجى المحاولة لاحقاً.' };
        }

        if (repId) {
            // Fire-and-forget: authenticate in background without blocking
            signInAnonymously(auth).catch(() => { });

            setAccessCode(sanitizedCode);
            secureStorage.set('accessCode', sanitizedCode);
            setActiveRepId(repId);
            secureStorage.set('activeRepId', repId);

            rateLimitCache.delete('student_code_attempts_v3');
            try { sessionStorage.removeItem('student_code_attempts_v3'); } catch { }
            return { success: true, repName };
        }

        recordAttempt('student_code_attempts_v3', rateLimit.data, 5, 0.2);

        if (rateLimit.data.attempts >= 2) {
            return { success: false, error: 'كود غير صحيح. تأكد من أنك تكتب الكود بشكل صحيح.' };
        }

        return { success: false, error: 'كود الوصول غير صالح' };
    };

    const exitCode = () => {
        setAccessCode(null);
        secureStorage.remove('accessCode');
        setActiveRepId(null);
        secureStorage.remove('activeRepId');
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


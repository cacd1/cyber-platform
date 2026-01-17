
// Pre-configured representatives from SOP
const INITIAL_REPS = [
    { id: 'rep1', email: "ZaidDeaa@university.edu", password: "20052026OPHLNM12", accessCode: "CLAS20261", name: "Zaid Deaa" },
    { id: 'rep2', email: "MohammedHassanein@university.edu", password: "20042025POCKMN32", accessCode: "CLAS20262", name: "Mohammed Hassanein" },
    { id: 'rep3', email: "IhsanMajid@university.edu", password: "20032024KLEPNM52", accessCode: "CLAS20263", name: "Ihsan Majid" },
    { id: 'rep4', email: "AliKhalid@university.edu", password: "20022023SAXZJQ06", accessCode: "CLAS20264", name: "Ali Khalid" },
    { id: 'rep5', email: "MohammedJaafar@university.edu", password: "20012022RTGZCV74", accessCode: "CLAS20265", name: "Mohammed Jaafar" },
    { id: 'rep6', email: "HassanMohammed@university.edu", password: "20002021YUIAZT01", accessCode: "CLAS20266", name: "Hassan Mohammed" }
];

const INITIAL_SUBJECTS = [
    { id: 'notifications', name: 'التبليغات', nameEn: 'Notifications' },
    { id: 'programming', name: 'البرمجة', nameEn: 'Programming Structured' },
    { id: 'cs', name: 'علوم الحاسوب', nameEn: 'Computer Science' },
    { id: 'ethics', name: 'أخلاقيات', nameEn: 'Ethics & Laws' },
    { id: 'intro', name: 'مقدمة', nameEn: 'Introduction to Cybersecurity' },
    { id: 'rights', name: 'حقوق الانسان', nameEn: 'Human Rights' },
    { id: 'math', name: 'الرياضيات', nameEn: 'Mathematics' },
    { id: 'arabic', name: 'اللغة العربية', nameEn: 'Arabic Language' }
];

// Helper to get/set from localStorage
const getStorage = (key, defaultVal) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export const mockDb = {
    // Representatives
    getRepByEmail: (email) => {
        return INITIAL_REPS.find(r => r.email.toLowerCase() === email.toLowerCase());
    },

    getRepByCode: (code) => {
        return INITIAL_REPS.find(r => r.accessCode.toLowerCase() === code.toLowerCase());
    },

    getAllReps: () => INITIAL_REPS,

    // Subjects
    getSubjects: () => INITIAL_SUBJECTS,

    // Lectures
    getLectures: (subjectId, repId) => {
        const lectures = getStorage('lectures', []);
        return lectures.filter(l => l.subjectId === subjectId && l.createdBy === repId);
    },

    getLectureCount: (subjectId, repId) => {
        const lectures = getStorage('lectures', []);
        return lectures.filter(l => l.subjectId === subjectId && l.createdBy === repId).length;
    },

    addLecture: (lecture) => {
        const lectures = getStorage('lectures', []);
        const newLecture = {
            ...lecture,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        lectures.push(newLecture);
        setStorage('lectures', lectures);
        return newLecture;
    },

    updateLecture: (id, updates) => {
        const lectures = getStorage('lectures', []);
        const index = lectures.findIndex(l => l.id === id);
        if (index !== -1) {
            lectures[index] = { ...lectures[index], ...updates };
            setStorage('lectures', lectures);
            return lectures[index];
        }
        return null;
    },

    deleteLecture: (id) => {
        let lectures = getStorage('lectures', []);
        lectures = lectures.filter(l => l.id !== id);
        setStorage('lectures', lectures);
    },

    // Owner settings
    getSettings: () => {
        return getStorage('settings', { course2Locked: true, extrasLocked: true });
    },

    updateSettings: (newSettings) => {
        const current = getStorage('settings', { course2Locked: true, extrasLocked: true });
        setStorage('settings', { ...current, ...newSettings });
    }
};

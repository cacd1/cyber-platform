// Keep subjects for reference or move to DB later
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

export const SUBJECTS = [
    { id: 'notifications', name: 'التبليغات', nameEn: 'Notifications', isNotifications: true },
    { id: 'programming', name: 'البرمجة', nameEn: 'Programming' },
    { id: 'intro', name: 'علوم الحاسوب', nameEn: 'Computer Science' },
    { id: 'cs', name: 'مقدمة في الأمن السيبراني', nameEn: 'Introduction to Cybersecurity' },
    { id: 'ethics', name: 'أخلاقيات وقوانين الأمن السيبراني', nameEn: 'Cybersecurity Ethics & Laws' },
    { id: 'rights', name: 'حقوق الإنسان', nameEn: 'Human Rights' },
    { id: 'math', name: 'الرياضيات', nameEn: 'Mathematics' },
    { id: 'arabic', name: 'اللغة العربية', nameEn: 'Arabic Language' }
];

export const SUBJECTS_COURSE2 = [
    { id: 'notifications2', name: 'التبليغات', nameEn: 'Notifications', isNotifications: true },
    { id: 'programming2', name: 'البرمجة', nameEn: 'Programming' },
    { id: 'networks', name: 'شبكات', nameEn: 'Networks' },
    { id: 'architecture', name: 'معمارية', nameEn: 'Architecture' },
    { id: 'infosec', name: 'مبادئ أمنية المعلومات', nameEn: 'Information Security Principles' },
    { id: 'english', name: 'انكليزي', nameEn: 'English' },
    { id: 'math2', name: 'الرياضيات', nameEn: 'Mathematics' }
];

// Admin email from environment variable (not hardcoded for security)
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';



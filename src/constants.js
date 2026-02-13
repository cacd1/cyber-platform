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

// Admin email from environment variable (not hardcoded for security)
// Admin email from environment variable (not hardcoded for security)
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';



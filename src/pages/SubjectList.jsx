import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Code, Globe, Scale, Users, FileText, Hash, Bell } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { SUBJECTS } from '../constants';

const ICONS = {
    programming: Code,
    cs: Globe,
    ethics: Scale,
    intro: Book,
    rights: Users,
    math: Hash,
    arabic: FileText
};

export const SubjectList = () => {
    const { hasAccessCode, accessCode, user, activeRepId } = useAuth();
    const navigate = useNavigate();
    const subjects = SUBJECTS;
    const [lectureCounts, setLectureCounts] = useState({});

    // Determine which rep's content to show
    const effectiveRepId = user ? user.id : activeRepId;

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCounts = async () => {
            if (effectiveRepId) {
                try {
                    // Fetch all lectures for this rep to count them by subject
                    const allLectures = await dbService.getAllLecturesForRep(effectiveRepId);

                    const counts = {};
                    subjects.forEach(sub => {
                        counts[sub.id] = allLectures.filter(l => l.subjectId === sub.id).length;
                    });
                    setLectureCounts(counts);
                } catch (error) {
                    console.error("Failed to fetch lecture counts", error);
                }
            }
        };
        fetchCounts();
    }, [effectiveRepId]);

    // Allow access if student has code OR if representative is logged in
    if (!hasAccessCode && !user) {
        return <Navigate to="/" replace />;
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-cyber text-gray-900 dark:text-white">المواد الدراسية</h1>
                    <p className="text-gray-600 dark:text-gray-400">اختر مادة لعرض المحاضرات</p>
                </div>
                <div className="bg-cyber/10 text-cyber px-4 py-2 rounded-lg border border-cyber/20 font-mono text-sm">
                    {user ? (
                        <>Representative: <span className="font-bold">{user.name}</span></>
                    ) : (
                        <>Access Code: <span className="font-bold">{accessCode}</span></>
                    )}
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {subjects.map((sub) => {
                    const Icon = ICONS[sub.id] || Book;
                    // Use the count from state
                    const count = lectureCounts[sub.id] || 0;
                    return (
                        <motion.div key={sub.id} variants={item}>
                            <Card
                                hover
                                onClick={() => navigate(`/course1/${sub.id}`)}
                                className="h-full flex flex-col gap-4 group hover:bg-white/5"
                            >
                                <div className="p-3 w-fit rounded-lg bg-cyber/10 text-cyber group-hover:bg-cyber group-hover:text-black transition-colors">
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{sub.name}</h3>
                                    <p className="text-sm text-gray-400 font-cyber">{sub.nameEn}</p>
                                    <p className="text-xs text-cyber/70 mt-2">
                                        {count > 0 ? `${count} محاضرة` : 'لا توجد محاضرات'}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

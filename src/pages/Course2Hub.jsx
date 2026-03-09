import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, MonitorPlay, Shield, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Course2Hub = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        <div className="flex flex-col gap-6 p-4 md:p-8 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-cyber text-gray-900 dark:text-white flex items-center gap-3">
                        <Shield className="text-cyber" size={32} />
                        الكورس الثاني
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">مرحباً بك في بوابة الكورس الثاني. اختر القسم الذي تريد تصفحه.</p>
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mt-8"
            >
                {/* Study Materials Card */}
                <motion.div variants={item} className="h-full">
                    <Card
                        hover
                        onClick={() => navigate('/course2/subjects')}
                        className="h-full flex flex-col items-center justify-center text-center py-12 group relative overflow-hidden bg-gradient-to-br from-cyber/5 to-blue-500/5 border-cyber/20 hover:border-cyber/50 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-cyber/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="mb-6 p-5 rounded-full bg-cyber/10 text-cyber group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 border border-cyber/20">
                            <BookOpen size={48} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">المواد الدراسية</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6 relative z-10 font-medium">
                            المحاضرات وملفات المواد الأساسية للفصل الثاني
                        </p>

                        <div className="relative z-10 font-bold text-cyber flex items-center gap-1 group-hover:gap-3 transition-all">
                            تصفح المواد <ChevronRight size={18} />
                        </div>
                    </Card>
                </motion.div>

                {/* Training Courses Card */}
                <motion.div variants={item} className="h-full">
                    <Card
                        hover
                        onClick={() => navigate('/course2/training')}
                        className="h-full flex flex-col items-center justify-center text-center py-12 group relative overflow-hidden bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20 hover:border-violet-500/50 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="mb-6 p-5 rounded-full bg-violet-500/10 text-violet-400 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 border border-violet-500/20">
                            <MonitorPlay size={48} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">الكورسات التدريبية</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6 relative z-10 font-medium">
                            مسارات تعليمية وتدريبات عملية لتطوير المهارات
                        </p>

                        <div className="relative z-10 font-bold text-violet-400 flex items-center gap-1 group-hover:gap-3 transition-all">
                            استكشف التدريبات <ChevronRight size={18} />
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="mt-8">
                <Button variant="secondary" onClick={() => navigate('/home')} className="flex items-center gap-2">
                    <ChevronRight size={18} /> العودة للرئيسية
                </Button>
            </div>
        </div>
    );
};

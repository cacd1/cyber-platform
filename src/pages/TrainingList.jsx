import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MonitorPlay, Clock, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const TrainingList = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <Card className="flex flex-col items-center p-8 bg-violet-500/5 border-violet-500/20">
                    <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/30">
                        <MonitorPlay size={40} className="text-violet-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">الكورسات التدريبية</h1>
                    <p className="text-violet-300 font-cyber text-sm tracking-widest mb-6">TRAINING COURSES</p>

                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 mb-8">
                        <Clock className="text-cyber" size={20} />
                        <span className="text-gray-300 text-sm">هذا القسم قيد التطوير حالياً، انتظرونا قريباً للحصول على أفضل المسارات التدريبية العملية.</span>
                    </div>

                    <Button variant="secondary" onClick={() => navigate('/course2')} className="w-full">
                        <ChevronRight size={18} className="ml-2 inline-block" /> العودة لبوابة الكورس الثاني
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
};

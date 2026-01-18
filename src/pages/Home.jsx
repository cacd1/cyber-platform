import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Unlock, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
    const navigate = useNavigate();
    const { enterCode, exitCode, hasAccessCode } = useAuth();
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleCourse1Click = () => {
        if (hasAccessCode) {
            navigate('/course1');
        } else {
            setIsCodeModalOpen(true);
        }
    };

    const handleSubmitCode = async (e) => {
        e.preventDefault();
        const result = await enterCode(code);
        if (result.success) {
            setIsCodeModalOpen(false);
            navigate('/course1');
        } else {
            setError(result.error);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] relative">
            {/* University Logo - Top Left */}
            <div className="fixed top-4 left-4 z-40 flex flex-col items-center">
                <img
                    src="/university_logo.png"
                    alt="University of Babylon"
                    className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                />
                <p className="text-[10px] text-gray-400 mt-1 text-center leading-tight">University of<br />Babylon</p>
            </div>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 dark:from-cyber dark:via-white dark:to-cyber-dim mb-4 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(0,240,255,0.3)] mt-12 md:mt-0">
                    طلاب الامن السيبراني مرحله اولى
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-medium dark:font-normal">
                    منصة تعلم - Learning Platform
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl"
            >
                {/* Course 1 Card */}
                <motion.div variants={item} className="h-full">
                    <Card
                        hover
                        className="h-full flex flex-col items-center justify-center text-center py-8 group relative overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/50 backdrop-blur-sm"
                        onClick={handleCourse1Click}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="mb-4 p-4 rounded-full bg-violet-500/10 text-violet-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 border border-violet-500/20">
                            {hasAccessCode ? <Unlock size={32} /> : <Lock size={32} />}
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 relative z-10">الكورس الأول</h2>
                        <h3 className="text-xs font-cyber text-blue-600 dark:text-violet-300 mb-3 relative z-10 tracking-widest font-bold">COURSE 1</h3>

                        <p className="text-gray-600 dark:text-gray-400 text-xs max-w-xs mx-auto mb-4 relative z-10 font-medium dark:font-normal">
                            {hasAccessCode ? "Access Granted" : "Requires Code"}
                        </p>

                        <div className="relative z-10 w-32">
                            <Button className="w-full text-xs py-1.5 bg-violet-600 hover:bg-violet-500">
                                {hasAccessCode ? "Enter" : "Unlock"}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Course 2 Card (Locked) */}
                <motion.div variants={item} className="h-full">
                    <Card className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60 grayscale transition-all hover:opacity-80 hover:grayscale-0 cursor-not-allowed border-red-500/10 bg-red-500/5 hover:border-red-500/30">
                        <div className="mb-4 p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-400 dark:text-white mb-1">الكورس الثاني</h2>
                        <h3 className="text-xs font-cyber text-red-300 dark:text-red-400 mb-3 tracking-widest">COURSE 2</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">Locked Content</p>
                    </Card>
                </motion.div>

                {/* Additional Resources (Locked) */}
                <motion.div variants={item} className="h-full">
                    <Card className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60 grayscale transition-all hover:opacity-80 hover:grayscale-0 cursor-not-allowed border-purple-500/10 bg-purple-500/5 hover:border-purple-500/30">
                        <div className="mb-4 p-4 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Layers size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-400 dark:text-white mb-1">ملحقات إضافية</h2>
                        <h3 className="text-xs font-cyber text-purple-300 dark:text-purple-400 mb-3 tracking-widest">RESOURCES</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">Coming Soon</p>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Access Code Modal */}
            <Modal
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                title="ادخل كود شعبتك"
            >
                <form onSubmit={handleSubmitCode} className="flex flex-col gap-4 text-center">
                    <div className="mx-auto p-4 bg-cyber/10 rounded-full text-cyber mb-2">
                        <ShieldCheck size={32} />
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                        ادخل الكود المكون من 9 خانات الذي حصلت عليه من ممثل شعبتك
                    </p>
                    <Input
                        placeholder="اكتب هنا"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="text-center tracking-widest uppercase text-xl font-cyber"
                        maxLength={9}
                        dir="ltr"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button type="submit" className="w-full mt-4">
                        تأكيد الكود
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

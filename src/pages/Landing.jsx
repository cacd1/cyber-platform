import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ChevronRight, GraduationCap, Server, Database, Globe } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Landing = () => {
    const navigate = useNavigate();

    const stages = [
        {
            id: 1,
            title: "المرحلة الأولى",
            subtitle: "First Stage",
            icon: <Shield size={40} />,
            description: "أساسيات الأمن السيبراني والبرمجة",
            status: "open",
            color: "from-blue-500 to-cyan-400",
            path: "/home"
        },
        {
            id: 2,
            title: "المرحلة الثانية",
            subtitle: "Second Stage",
            icon: <Server size={40} />,
            description: "الشبكات وأنظمة التشغيل",
            status: "locked",
            color: "from-purple-500 to-pink-400",
            path: null
        },
        {
            id: 3,
            title: "المرحلة الثالثة",
            subtitle: "Third Stage",
            icon: <Database size={40} />,
            description: "أمن البيانات والتشفير",
            status: "locked",
            color: "from-orange-500 to-red-400",
            path: null
        },
        {
            id: 4,
            title: "المرحلة الرابعة",
            subtitle: "Fourth Stage",
            icon: <Globe size={40} />,
            description: "اختبار الاختراق والتحقيق الجنائي",
            status: "locked",
            color: "from-emerald-500 to-teal-400",
            path: null
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
    };

    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center relative px-4">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 relative z-10"
            >
                <div className="inline-block p-3 rounded-full bg-cyber/10 mb-6 border border-cyber/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                    <img
                        src="/university_logo.png"
                        alt="University of Babylon"
                        className="w-16 h-16 object-contain"
                    />
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-4">
                    قسم أمن المعلومات
                </h1>
                <p className="text-xl md:text-2xl text-cyan-500/80 font-cyber tracking-[0.2em] uppercase">
                    Information Security Department
                </p>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyber to-transparent mx-auto mt-8 opacity-50" />
            </motion.div>

            {/* Stages Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4 relative z-20"
            >
                {stages.map((stage) => (
                    <motion.div key={stage.id} variants={item} className="h-full">
                        <Card
                            className={`h-full relative overflow-hidden group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 ${stage.status === 'open'
                                ? 'cursor-pointer hover:border-cyber/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] ring-1 ring-cyan-500/20'
                                : 'cursor-not-allowed opacity-70 grayscale hover:grayscale-0'
                                }`}
                            onClick={() => stage.status === 'open' && navigate(stage.path)}
                        >
                            {/* Background Gradient Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="p-6 flex flex-col items-center text-center h-full">
                                {/* Icon */}
                                <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${stage.color} bg-opacity-10 text-white shadow-lg group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="relative z-10">
                                        {stage.status === 'locked' ? <Lock size={32} /> : stage.icon}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-2">{stage.title}</h3>
                                <p className="text-xs font-cyber text-gray-400 tracking-widest uppercase mb-4">{stage.subtitle}</p>

                                {/* Divider */}
                                <div className="w-12 h-0.5 bg-white/10 mb-4 group-hover:w-24 group-hover:bg-cyber/50 transition-all duration-500" />

                                {/* Description */}
                                <p className="text-sm text-gray-400 mb-8 flex-grow">{stage.description}</p>

                                {/* Action / Status */}
                                <div className="w-full">
                                    {stage.status === 'open' ? (
                                        <div className="flex items-center justify-center gap-2 text-cyber font-bold group-hover:gap-4 transition-all duration-300">
                                            <span>الدخول</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    ) : (
                                        <div className="text-xs font-cyber text-red-400/80 bg-red-500/10 py-1.5 px-3 rounded-full border border-red-500/20 inline-block">
                                            قيد التطوير - DEV
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

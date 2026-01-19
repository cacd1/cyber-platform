import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Trash2, Users, Key, Mail, User, AlertTriangle, Settings, Moon, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../constants';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService as dbServiceImport } from '../services/db';

export const Admin = () => {
    const { user } = useAuth();
    const [representatives, setRepresentatives] = useState([]);
    const [settings, setSettings] = useState({ forcedTheme: 'none', showTranslator: true, showVoiceAI: true, showChatNote: true });
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRep, setSelectedRep] = useState(null);
    const [newRep, setNewRep] = useState({ name: '', email: '', password: '', code: '', stage: '1' });
    const [activeStageTab, setActiveStageTab] = useState('1'); // '1', '2', '3', '4'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check if user is admin
    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const getStatus = (lastSeen) => {
        if (!lastSeen) return { color: 'bg-gray-500', text: 'لم يسجل دخول', state: 'never' };

        const last = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = (now - last) / 1000 / 60;

        if (diffInMinutes <= 5) {
            return { color: 'bg-green-500', text: 'متصل الآن', state: 'online' };
        } else {
            return { color: 'bg-red-500', text: 'غير متصل', state: 'offline' }; // Was active, now offline
        }
    };

    // Fetch representatives & Settings
    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [repsSnapshot, settingsData] = await Promise.all([
                getDocs(collection(db, 'representatives')),
                dbServiceImport.getSettings()
            ]);

            setRepresentatives(repsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setSettings(settingsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('فشل في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (updates) => {
        try {
            const newSettings = { ...settings, ...updates };
            setSettings(newSettings); // Optimistic UI update
            await dbServiceImport.updateSettings(newSettings);
            setSuccess('تم تحديث الإعدادات بنجاح');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error('Error updating settings:', err);
            setError('فشل في حفظ الإعدادات');
            fetchData(); // Revert on error
        }
    };



    const handleAddRepresentative = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newRep.name || !newRep.email || !newRep.password || !newRep.code) {
            setError('جميع الحقول مطلوبة');
            return;
        }

        if (newRep.code.length !== 9) {
            setError('كود الشعبة يجب أن يكون 9 خانات');
            return;
        }

        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, newRep.email, newRep.password);

            // Add to Firestore
            await addDoc(collection(db, 'representatives'), {
                uid: userCredential.user.uid,
                name: newRep.name,
                email: newRep.email,
                accessCode: newRep.code.toUpperCase(),
                stage: newRep.stage,
                createdAt: new Date().toISOString()
            });

            setSuccess('تم إضافة الممثل بنجاح!');
            setNewRep({ name: '', email: '', password: '', code: '', stage: activeStageTab });
            fetchData();
            setTimeout(() => setIsAddModalOpen(false), 1500);
        } catch (err) {
            console.error('Error adding representative:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('هذا الإيميل مستخدم مسبقاً');
            } else if (err.code === 'auth/weak-password') {
                setError('كلمة السر ضعيفة (6 أحرف على الأقل)');
            } else {
                setError('فشل في إضافة الممثل: ' + err.message);
            }
        }
    };

    const handleDeleteRepresentative = async () => {
        if (!selectedRep) return;
        setError('');

        try {
            await deleteDoc(doc(db, 'representatives', selectedRep.id));
            setSuccess('تم حذف الممثل بنجاح');
            setIsDeleteModalOpen(false);
            setSelectedRep(null);
            fetchData();
        } catch (err) {
            console.error('Error deleting representative:', err);
            setError('فشل في حذف الممثل');
        }
    };

    // Redirect if not admin
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Card className="max-w-md text-center p-8">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-white mb-2">غير مصرح بالدخول</h2>
                    <p className="text-gray-400">هذه الصفحة مخصصة للمسؤولين فقط</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-cyber" size={32} />
                    <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
                </div>
                <p className="text-gray-400">إدارة حسابات الممثلين</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-4 bg-violet-500/10 border-violet-500/20">
                    <div className="flex items-center gap-3">
                        <Users className="text-violet-400" size={24} />
                        <div>
                            <p className="text-2xl font-bold text-white">{representatives.length}</p>
                            <p className="text-sm text-gray-400">ممثل مسجل</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Site Settings */}
            <Card className="mb-8 p-0 overflow-hidden border-violet-500/30">
                <div className="p-4 bg-violet-500/10 border-b border-violet-500/20">
                    <div className="flex items-center gap-3">
                        <Settings className="text-violet-400" size={24} />
                        <h2 className="text-lg font-bold text-white">إعدادات الموقع العامة</h2>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Theme Settings */}
                    <div>
                        <h3 className="text-gray-400 mb-4 font-bold flex items-center gap-2">
                            <Moon size={18} /> التحكم بالثيم (Theme)
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                                <span className="text-white">حرية الاختيار للطالب</span>
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={settings.forcedTheme === 'none'}
                                    onChange={() => handleUpdateSettings({ forcedTheme: 'none' })}
                                    className="w-4 h-4 accent-cyber"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                                <span className="text-white">إجبار الوضع المظلم (Dark)</span>
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={settings.forcedTheme === 'dark'}
                                    onChange={() => handleUpdateSettings({ forcedTheme: 'dark' })}
                                    className="w-4 h-4 accent-cyber"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                                <span className="text-white">إجبار الوضع المضيء (Light)</span>
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={settings.forcedTheme === 'light'}
                                    onChange={() => handleUpdateSettings({ forcedTheme: 'light' })}
                                    className="w-4 h-4 accent-cyber"
                                />
                            </label>
                        </div>
                    </div>


                    {/* Feature Toggles */}
                    <div>
                        <h3 className="text-gray-400 mb-4 font-bold flex items-center gap-2">
                            <Zap size={18} /> تفعيل الأدوات
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div>
                                    <p className="text-white font-bold">المترجم الفوري</p>
                                    <p className="text-xs text-gray-500">لزر الترجمة العائم</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.showTranslator}
                                        onChange={(e) => handleUpdateSettings({ showTranslator: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyber rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div>
                                    <p className="text-white font-bold">المساعد الصوتي (AI)</p>
                                    <p className="text-xs text-gray-500">خدمة تحويل الصوت لنص</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.showVoiceAI}
                                        onChange={(e) => handleUpdateSettings({ showVoiceAI: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyber rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div>
                                    <p className="text-white font-bold">المساعد الذكي (ChatNote)</p>
                                    <p className="text-xs text-gray-500">نافذة المحادثة الذكية</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.showChatNote}
                                        onChange={(e) => handleUpdateSettings({ showChatNote: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyber rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Alert Settings */}
                <div className="p-6 border-t border-violet-500/20 bg-violet-500/5">
                    <h3 className="text-gray-400 mb-4 font-bold flex items-center gap-2">
                        <AlertTriangle size={18} className="text-yellow-500" /> التنبيه العام
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="اكتب نص التنبيه هنا..."
                                value={settings.alertMessage || ''}
                                onChange={(e) => handleUpdateSettings({ alertMessage: e.target.value })}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                                <span className="text-sm text-gray-400">تفعيل</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.showAlert || false}
                                        onChange={(e) => handleUpdateSettings({ showAlert: e.target.checked })}
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            * هذا التنبيه سيظهر في أعلى الشاشة لجميع المستخدمين (شريط أصفر).
                        </p>
                    </div>
                </div>
            </Card>

            {/* Add Button */}
            <div className="mb-6">
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                    <UserPlus size={20} />
                    إضافة ممثل جديد
                </Button>
            </div>

            {/* Representatives List */}
            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-white">قائمة الممثلين</h2>
                    <div className="flex gap-2">
                        {['1', '2', '3', '4'].map((stage) => (
                            <button
                                key={stage}
                                onClick={() => setActiveStageTab(stage)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeStageTab === stage
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                المرحلة {stage}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
                ) : representatives.filter(r => (r.stage || '1') === activeStageTab).length === 0 ? (
                    <div className="p-8 text-center text-gray-400">لا يوجد ممثلين لهذه المرحلة</div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {representatives.filter(r => (r.stage || '1') === activeStageTab).map((rep) => (
                            <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <User className="text-violet-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{rep.name}</p>
                                        <p className="text-sm text-gray-400">{rep.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-mono bg-cyber/20 text-cyber px-2 py-1 rounded">
                                            {rep.accessCode}
                                        </span>
                                        {(() => {
                                            const status = getStatus(rep.lastSeen);
                                            return (
                                                <div className="flex items-center gap-1.5" title={status.text}>
                                                    <span className="text-[10px] text-gray-400">{status.text}</span>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${status.color} shadow-[0_0_5px_currentColor]`}></div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <Button
                                        variant="danger"
                                        className="p-2"
                                        onClick={() => {
                                            setSelectedRep(rep);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Add Representative Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setError(''); setSuccess(''); }}
                title="إضافة ممثل جديد"
            >
                <form onSubmit={handleAddRepresentative} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">الاسم</label>
                        <Input
                            placeholder="اسم الممثل"
                            value={newRep.name}
                            onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                            icon={<User size={16} />}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">الإيميل</label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={newRep.email}
                            onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                            icon={<Mail size={16} />}
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">كلمة السر</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={newRep.password}
                            onChange={(e) => setNewRep({ ...newRep, password: e.target.value })}
                            icon={<Key size={16} />}
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">كود الشعبة (9 خانات)</label>
                        <Input
                            placeholder="ABC123XYZ"
                            value={newRep.code}
                            onChange={(e) => setNewRep({ ...newRep, code: e.target.value.toUpperCase() })}
                            maxLength={9}
                            icon={<Shield size={16} />}
                            dir="ltr"
                            className="font-mono uppercase"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">المرحلة</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['1', '2', '3', '4'].map((stage) => (
                                <button
                                    key={stage}
                                    type="button"
                                    onClick={() => setNewRep({ ...newRep, stage })}
                                    className={`p-2 rounded border text-sm font-bold transition-all ${newRep.stage === stage
                                        ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                                        }`}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}

                    <Button type="submit" className="w-full mt-2">
                        إضافة الممثل
                    </Button>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedRep(null); }}
                title="تأكيد الحذف"
            >
                <div className="text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <p className="text-white mb-2">هل أنت متأكد من حذف الممثل؟</p>
                    <p className="text-gray-400 mb-6">{selectedRep?.name}</p>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            onClick={handleDeleteRepresentative}
                        >
                            حذف
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, LogIn, LogOut, Key, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

export const HamburgerMenu = ({ onLoginClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, hasAccessCode, exitCode, enterCode } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleLogoutRep = () => {
        logout();
        setIsOpen(false);
    };

    const handleLogoutCode = () => {
        exitCode();
        setIsOpen(false);
        window.location.reload(); // Quick way to reset view
    };

    const handleSwitchCode = () => {
        exitCode();
        setIsOpen(false);
    };

    const menuVariants = {
        closed: { x: '100%', opacity: 0 },
        open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    return (
        <>
            <button
                onClick={toggleOpen}
                className="fixed top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 hover:border-cyber text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleOpen}
                            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 right-0 h-full w-80 bg-[#0a0a1f] border-l border-cyber/30 z-50 shadow-2xl p-6 flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-3 mt-12 pb-6 border-b border-white/10">
                                <Shield className="text-cyber" size={32} />
                                <div>
                                    <h3 className="font-cyber text-lg text-white">تم التطوير بواسطه الطالب</h3>
                                    <p className="text-sm text-cyber font-bold">Hassan Mohammed</p>
                                    <p className="text-xs text-gray-400">اصدار التطبيق v1.0</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h4 className="text-sm text-gray-500 uppercase tracking-wider font-bold">Theme</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => toggleTheme('dark')} className={`p-2 rounded-md border ${theme === 'dark' ? 'border-cyber bg-cyber/10 text-white' : 'border-gray-700 text-gray-400'}`}>Dark</button>
                                    <button onClick={() => toggleTheme('light')} className={`p-2 rounded-md border ${theme === 'light' ? 'border-cyber bg-cyber/10 text-white' : 'border-gray-700 text-gray-400'}`}>Light</button>
                                    <button onClick={() => toggleTheme('default')} className={`p-2 rounded-md border ${theme === 'default' ? 'border-cyber bg-cyber/10 text-white' : 'border-gray-700 text-gray-400'}`}>Default</button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h4 className="text-sm text-gray-500 uppercase tracking-wider font-bold">Account</h4>

                                {/* Representative Controls */}
                                {user ? (
                                    <div className="bg-cyber/10 p-4 rounded-lg border border-cyber/20">
                                        <p className="text-sm text-gray-300 mb-2">Logged in as:</p>
                                        <p className="text-cyber font-bold mb-4">{user.name}</p>
                                        <Button variant="danger" onClick={handleLogoutRep} className="w-full flex items-center justify-center gap-2">
                                            <LogOut size={16} /> Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <Button variant="ghost" onClick={() => { onLoginClick(); setIsOpen(false); }} className="w-full flex items-center justify-start gap-3 px-0 hover:bg-transparent hover:text-cyber">
                                        <LogIn size={20} /> Representative Login
                                    </Button>
                                )}

                                {/* Student Code Controls */}
                                {hasAccessCode && !user && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs text-gray-400 mb-3">Student Access Active</p>
                                        <Button variant="secondary" onClick={handleSwitchCode} className="w-full mb-2 flex items-center justify-center gap-2">
                                            <Key size={16} /> Switch Code
                                        </Button>
                                        <Button variant="ghost" onClick={handleLogoutCode} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300">
                                            <LogOut size={16} /> Exit Access Mode
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

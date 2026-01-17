import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { HamburgerMenu } from './HamburgerMenu';
import { BackButton } from '../ui/BackButton';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ChatNote } from '../features/ChatNote';

export const Layout = ({ children }) => {
    const { theme } = useTheme();
    const { login } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const result = login(email, password);
        if (result.success) {
            setIsLoginModalOpen(false);
            setEmail('');
            setPassword('');
            setError('');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className={`min-h-screen relative overflow-x-hidden ${theme}`}>
            {/* Background Elements */}
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
                {/* Background Base: Deep Obsidian (Dark) vs Soft Blue-White (Light) */}
                <div className="absolute inset-0 bg-[#f0f4f8] dark:bg-[#02020a] transition-colors duration-500" />

                {/* Cyber Grid - Only for Dark Mode */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 dark:opacity-20 mix-blend-overlay" />

                {/* Gradients - Soft Cyan/Blue (Light) vs Deep Violet (Dark) */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-violet-900/20 dark:via-transparent dark:to-purple-900/20 transition-all duration-500" />

                {/* Animated Orbs - Soft & Gaussian in Light Mode */}
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] will-change-transform
                    bg-cyan-200/40 dark:bg-violet-600/20 
                    mix-blend-normal dark:mix-blend-screen transition-colors duration-500 opacity-60 dark:opacity-100"
                />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] will-change-transform
                    bg-blue-200/40 dark:bg-purple-600/10 
                    opacity-50 dark:opacity-100 transition-colors duration-500"
                />

                {/* Vignette - Dark Only */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-[#02020a] dark:to-transparent opacity-80" />
            </div>

            {/* Navigation */}
            <BackButton />
            <HamburgerMenu onLoginClick={() => setIsLoginModalOpen(true)} />

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 min-h-screen flex flex-col">
                {children}
            </main>

            {/* Chat Note Feature */}
            <ChatNote />

            {/* Login Modal */}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                title="Representative Login"
            >
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Input
                        placeholder="University Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button type="submit" className="w-full mt-2">
                        Secure Login
                    </Button>
                </form>
            </Modal>
            {/* Footer */}
            <div className="fixed bottom-2 left-0 right-0 text-center z-50 pointer-events-none">
                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-600 font-cyber opacity-70">
                    نظام الذكاء الاصطناعي قيد التطوير
                </p>
            </div>
        </div>
    );
};

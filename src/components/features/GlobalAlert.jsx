
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const GlobalAlert = () => {
    const { settings } = useTheme();

    if (!settings?.showAlert || !settings?.alertMessage) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500/90 backdrop-blur-md text-white px-4 py-3 shadow-lg border-b border-yellow-400/50"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                    <AlertCircle className="shrink-0 animate-pulse" size={20} />
                    <p className="text-sm md:text-base font-bold text-center">
                        {settings.alertMessage}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';

export const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useTheme();

    if (location.pathname === '/') return null;

    const isAlertVisible = settings?.showAlert && settings?.alertMessage;
    const topClass = isAlertVisible ? 'top-16' : 'top-4';

    return (
        <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className={`fixed ${topClass} left-4 z-40 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 hover:border-cyber text-sky-400 md:text-white transition-all duration-300`}
        >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Back</span>
        </Button>
    );
};

import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === '/') return null;

    return (
        <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="fixed top-4 left-4 z-40 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 hover:border-cyber text-sky-400 md:text-white"
        >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Back</span>
        </Button>
    );
};

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-6 py-2 rounded-lg font-cyber font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-cyber text-cyber-dark hover:bg-cyber-light hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] border border-cyber",
        secondary: "bg-transparent border border-gray-600 text-gray-300 hover:border-cyber hover:text-cyber",
        danger: "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20",
        ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};

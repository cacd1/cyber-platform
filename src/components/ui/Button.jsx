import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-6 py-2 rounded-lg font-cyber font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-600 dark:bg-cyber dark:text-cyber-dark dark:hover:bg-cyber-light dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] dark:border-cyber",
        secondary: "bg-transparent border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:border-blue-600 dark:hover:border-cyber hover:text-blue-600 dark:hover:text-cyber",
        danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500/20",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
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

import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <div
            className={twMerge(
                "bg-black dark:bg-gray-900/40 backdrop-blur-xl border border-gray-800 dark:border-white/10 p-6 rounded-2xl shadow-lg dark:shadow-none text-white dark:text-white transition-all duration-300",
                hover && "hover:border-gray-700 dark:hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:-translate-y-1 cursor-pointer group",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

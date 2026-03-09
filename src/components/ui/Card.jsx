import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <div
            className={twMerge(
                "bg-white/90 dark:bg-gray-900/40 backdrop-blur-xl border border-blue-100 dark:border-white/10 p-6 rounded-2xl shadow-[0_4px_25px_rgba(59,130,246,0.1)] dark:shadow-none text-slate-800 dark:text-white transition-all duration-300",
                hover && "hover:border-blue-300 dark:hover:border-violet-500/50 hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:-translate-y-1 cursor-pointer group",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

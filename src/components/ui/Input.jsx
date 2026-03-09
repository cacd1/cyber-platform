import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({ className, error, ...props }) => {
    return (
        <div className="w-full">
            <input
                className={twMerge(
                    "w-full bg-white dark:bg-cyber-dark/50 border border-slate-200 dark:border-cyber/30 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyber focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyber transition-all",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

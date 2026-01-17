import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({ className, error, ...props }) => {
    return (
        <div className="w-full">
            <input
                className={twMerge(
                    "w-full bg-cyber-dark/50 border border-cyber/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyber focus:ring-1 focus:ring-cyber transition-all",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

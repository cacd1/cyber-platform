/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                cyber: {
                    // Preserving some defaults but overriding main theme
                    DEFAULT: '#7c3aed', // Violet 600
                    dim: '#a855f7',     // Purple 500
                    dark: '#02020a',    // Obsidian (Deep Background)
                    light: '#e9d5ff',   // Purple 200
                    accent: '#c084fc',  // Purple 400

                    // Specific new palette
                    obsidian: '#02020a',
                    void: '#060612',
                    primary: '#7c3aed',
                    neon: '#d8b4fe',
                }
            },
            backgroundImage: {
                'cyber-grid': "url('https://grainy-gradients.vercel.app/noise.svg')",
            },
            fontFamily: {
                cyber: ['Cairo', 'Orbitron', 'sans-serif'],
                body: ['Cairo', 'Inter', 'sans-serif']
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}

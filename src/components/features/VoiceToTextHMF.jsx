import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Copy, Trash2, StopCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const VoiceToTextHMF = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lang, setLang] = useState('ar-SA'); // 'ar-SA' or 'en-US'
    const recognitionRef = useRef(null);
    const { theme } = useTheme();

    const isDark = theme === 'dark' || theme === 'default';

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Append final results to existing text
                if (finalTranscript) {
                    setTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                // If we didn't manually stop, try to restart (for continuous listening feel)
                // But simplified here: if it stops, just update state
                // setIsListening(false); 
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("المتصفح لا يدعم تحويل الصوت إلى نص.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.lang = lang;
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript);
        // Could show a toast here
    };

    const handleClear = () => {
        setTranscript('');
    };

    const styles = {
        container: isDark
            ? 'bg-[#0a0f1c]/95 border-emerald-500/30'
            : 'bg-white/95 border-emerald-500/20',
        header: isDark
            ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50',
        textMain: isDark ? 'text-white' : 'text-gray-900',
        textSub: isDark ? 'text-emerald-200/70' : 'text-emerald-700/70',
        textArea: isDark
            ? 'bg-black/40 border-white/10 text-white placeholder:text-gray-600'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
        floatingBtn: isDark
            ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-500'
            : 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600',
    };

    return (
        <>
            {/* Main Window - Centered */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                    <div
                        className={`w-[90vw] sm:w-[480px] max-w-lg backdrop-blur-xl border rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ${styles.container}`}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Header */}
                        <div className={`p-4 border-b border-white/10 flex justify-between items-center ${styles.header}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Mic size={20} />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm tracking-wide ${styles.textMain}`}>Voice Note</h3>
                                    <p className={`text-[10px] ${styles.textSub}`}>Speech to Text Converter</p>
                                </div>
                            </div>
                            <button onClick={toggleOpen} className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${styles.textMain}`}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Controls & Language */}
                        <div className="p-2 flex items-center justify-between border-b border-white/5">
                            <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                                <button
                                    onClick={() => setLang('ar-SA')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${lang === 'ar-SA' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    AR
                                </button>
                                <button
                                    onClick={() => setLang('en-US')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${lang === 'en-US' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    EN
                                </button>
                            </div>

                            {isListening && (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] text-red-400 font-bold">Listening...</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="relative">
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder={isListening ? "Listening..." : "Click mic to start speaking..."}
                                    className={`w-full min-h-[160px] p-3 rounded-xl resize-none text-base focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all ${styles.textArea}`}
                                    dir="auto"
                                    style={{ fontSize: '16px' }}
                                />
                                {transcript && (
                                    <div className="absolute bottom-2 left-2 flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="p-1.5 bg-black/20 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors"
                                            title="Copy Text"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button
                                            onClick={handleClear}
                                            className="p-1.5 bg-black/20 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            title="Clear Text"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={toggleListening}
                                className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${isListening
                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02]'
                                    }`}
                            >
                                {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
                                {isListening ? 'Stop Recording' : 'Start Recording'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <div className="fixed bottom-36 left-4 right-4 sm:left-6 sm:right-auto z-[90] flex flex-col items-start gap-3 pointer-events-none">
                <button
                    onClick={toggleOpen}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 pointer-events-auto ${isOpen
                        ? 'bg-red-500 text-white rotate-90 scale-90'
                        : styles.floatingBtn
                        }`}
                >
                    {isOpen ? <X size={18} /> : <Mic size={20} />}
                </button>
            </div>
        </>
    );
};

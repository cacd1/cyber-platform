import React, { useState, useRef } from 'react';
import { Languages, X, Image as ImageIcon, ArrowRightLeft, ScanText, Loader2, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { CYBER_GLOSSARY } from '../../data/cyberGlossary';

export const TranslatorHMF = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [mode, setMode] = useState('text'); // text, glossary
    const [glossaryResults, setGlossaryResults] = useState([]);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const { theme } = useTheme();

    const isDark = theme === 'dark' || theme === 'default';

    const toggleOpen = () => setIsOpen(!isOpen);

    // Detect if text is Arabic
    const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

    // Search glossary for terms
    const searchGlossary = (text) => {
        const searchTerm = text.toLowerCase().trim();
        if (!searchTerm) return [];

        return CYBER_GLOSSARY.filter(term =>
            term.en.toLowerCase().includes(searchTerm) ||
            term.ar.includes(searchTerm)
        ).slice(0, 10); // Limit to 10 results
    };

    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        setIsTranslating(true);
        setTranslatedText('');
        setGlossaryResults([]);

        try {
            // First, search glossary for cybersecurity terms
            const glossaryMatches = searchGlossary(inputText);
            if (glossaryMatches.length > 0) {
                setGlossaryResults(glossaryMatches);
            }

            // Then, use translation API
            const sourceLang = isArabic(inputText) ? 'ar' : 'en';
            const targetLang = sourceLang === 'ar' ? 'en' : 'ar';

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${sourceLang}|${targetLang}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.responseStatus === 200 && data.responseData) {
                setTranslatedText(data.responseData.translatedText);
            } else {
                throw new Error(data.responseDetails || "Translation failed");
            }
        } catch (error) {
            setTranslatedText("خطأ في الترجمة: " + error.message);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleGlossarySearch = () => {
        if (!inputText.trim()) return;
        setGlossaryResults(searchGlossary(inputText));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTranslatedText("ترجمة الصور غير متوفرة حالياً. يرجى كتابة النص يدوياً.");
            setMode('text');
        }
        e.target.value = '';
    };

    // Styles
    const styles = {
        container: isDark
            ? 'bg-[#0a0f1c]/95 border-cyan-500/30'
            : 'bg-white/95 border-cyan-500/20',
        header: isDark
            ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50'
            : 'bg-gradient-to-r from-cyan-50 to-blue-50',
        textMain: isDark ? 'text-white' : 'text-gray-900',
        textSub: isDark ? 'text-cyan-200/70' : 'text-cyan-700/70',
        input: isDark
            ? 'bg-black/40 border-white/10 text-white placeholder:text-gray-600'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
        floatingBtn: isDark
            ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:bg-cyan-500'
            : 'bg-cyan-500 text-white shadow-lg hover:bg-cyan-600',
    };

    return (
        <>
            {/* Main Window - Centered & Stable */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                    <div
                        className={`w-[90vw] sm:w-[480px] max-w-lg backdrop-blur-xl border rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ${styles.container}`}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Header */}
                        <div className={`p-4 border-b border-white/10 flex justify-between items-center ${styles.header}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                    <ArrowRightLeft size={20} />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm tracking-wide ${styles.textMain}`}>Translator HMF</h3>
                                    <p className={`text-[10px] ${styles.textSub}`}>Ar ↔ En + Cyber Terms</p>
                                </div>
                            </div>
                            <button onClick={toggleOpen} className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${styles.textMain}`}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="p-2 grid grid-cols-3 gap-2 border-b border-white/5">
                            <button
                                onClick={() => { setMode('text'); setGlossaryResults([]); setTranslatedText(''); }}
                                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all ${mode === 'text' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                <ScanText size={16} />
                                <span>Translate</span>
                            </button>
                            <button
                                onClick={() => { setMode('glossary'); setTranslatedText(''); handleGlossarySearch(); }}
                                className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all ${mode === 'glossary' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                <BookOpen size={16} />
                                <span>Glossary</span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all hover:bg-white/5 text-gray-400"
                            >
                                <ImageIcon size={16} />
                                <span>Image</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col gap-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
                            {/* Hidden Inputs */}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            <input type="file" ref={cameraInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" className="hidden" />

                            <textarea
                                value={inputText}
                                onChange={(e) => {
                                    setInputText(e.target.value);
                                    if (mode === 'glossary') handleGlossarySearch();
                                }}
                                placeholder={mode === 'glossary' ? "Search cybersecurity terms..." : "Enter Arabic or English text..."}
                                className={`w-full min-h-[140px] p-3 rounded-xl resize-none text-base focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all ${styles.input}`}
                                dir="auto"
                                style={{ fontSize: '16px' }}
                            />

                            {mode === 'text' && (
                                <button
                                    onClick={handleTranslate}
                                    disabled={isTranslating}
                                    className={`w-full py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${isTranslating
                                        ? 'bg-gray-500/50 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transform hover:scale-[1.02]'
                                        }`}
                                >
                                    {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
                                    {isTranslating ? 'Translating...' : 'Translate Now'}
                                </button>
                            )}

                            {/* Glossary Results */}
                            {glossaryResults.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                                        <BookOpen size={12} /> Cybersecurity Terms Found
                                    </p>
                                    {glossaryResults.map((term, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${isDark ? 'bg-cyan-950/30 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <span className={`font-bold text-sm ${styles.textMain}`}>{term.en}</span>
                                                <span className="text-cyan-400 text-sm font-arabic">{term.ar}</span>
                                            </div>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{term.def}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Translation Result */}
                            {(translatedText || isTranslating) && mode === 'text' && (
                                <div className={`p-3 rounded-xl border border-white/5 text-sm min-h-[60px] ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Translation</p>
                                    {isTranslating ? (
                                        <div className="space-y-2 animate-pulse">
                                            <div className="h-2 bg-gray-500/20 rounded w-3/4"></div>
                                            <div className="h-2 bg-gray-500/20 rounded w-1/2"></div>
                                        </div>
                                    ) : (
                                        <p className={`whitespace-pre-wrap ${styles.textMain} leading-relaxed font-medium`} dir="auto">{translatedText}</p>
                                    )}
                                </div>
                            )}

                            {/* Empty state for glossary */}
                            {mode === 'glossary' && glossaryResults.length === 0 && inputText.trim() && (
                                <div className={`p-4 text-center rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        لم يتم العثور على مصطلحات مطابقة
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button - Bottom Fixed */}
            <div className="fixed bottom-20 left-4 right-4 sm:left-6 sm:right-auto z-[90] flex flex-col items-start gap-3 pointer-events-none">
                <button
                    onClick={toggleOpen}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 pointer-events-auto ${isOpen
                        ? 'bg-red-500 text-white rotate-90 scale-90'
                        : styles.floatingBtn
                        }`}
                >
                    {isOpen ? <X size={18} /> : <Languages size={20} />}
                </button>
            </div>
        </>
    );
};

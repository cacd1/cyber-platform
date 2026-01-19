import React, { useState, useRef } from 'react';
import { Languages, X, Camera, Image as ImageIcon, Send, ArrowRightLeft, ScanText, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// Initialize Gemini
const API_KEY = "AIzaSyA9JtziaDJhVxqnA9BmYsKqyb9zZVMS-Is";
const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-1.0-pro", "gemini-pro-vision"];

export const TranslatorHMF = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [mode, setMode] = useState('text'); // text, image
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const { theme } = useTheme();

    const isDark = theme === 'dark' || theme === 'default';

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleTranslate = async () => {
        if (!inputText.trim() && !selectedImage) return;

        setIsTranslating(true);
        setTranslatedText('');

        try {
            let prompt = inputText;
            let imagePart = null;

            if (selectedImage) {
                // Remove data URL prefix for Gemini
                const base64Data = selectedImage.split(',')[1];
                imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg",
                    },
                };
            }

            let result = null;
            let lastError = null;

            // Try models in order
            for (const modelName of MODELS_TO_TRY) {
                try {
                    // Config for this attempt
                    const modelConfig = { model: modelName };
                    if (modelName.includes("1.5")) {
                        modelConfig.systemInstruction = "You are a specialized Cybersecurity Translator for students. Translate the given text or image text between Arabic and English. If the text contains cybersecurity terms (e.g., Phishing, Malware, DDOS), translate them accurately and provide a very brief explanation in parentheses if necessary. Keep the tone professional and educational.";
                    }

                    const model = genAI.getGenerativeModel(modelConfig);

                    if (imagePart) {
                        result = await model.generateContent([prompt || "Translate this image content to Arabic/English", imagePart]);
                    } else {
                        result = await model.generateContent(prompt);
                    }

                    if (result && result.response) {
                        break; // Success!
                    }
                } catch (e) {
                    lastError = e;
                    continue; // Try next
                }
            }

            if (!result) throw lastError || new Error("All models failed");

            const response = await result.response;
            setTranslatedText(response.text());
        } catch (error) {
            console.error("Translation Error:", error);
            setTranslatedText("Error details: " + (error.toString()));
        } finally {
            setIsTranslating(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setMode('image');
                setTranslatedText(''); // clear previous
            };
            reader.readAsDataURL(file);
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
        <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-4 font-sans">
            {/* Main Window */}
            {isOpen && (
                <div className={`w-80 backdrop-blur-xl border rounded-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl ${styles.container}`}>

                    {/* Header */}
                    <div className={`p-4 border-b border-white/10 flex justify-between items-center ${styles.header}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                <ArrowRightLeft size={20} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm tracking-wide ${styles.textMain}`}>Translator HMF</h3>
                                <p className={`text-[10px] ${styles.textSub}`}>Ar ↔ En Instant Translation</p>
                            </div>
                        </div>
                        <button onClick={toggleOpen} className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${styles.textMain}`}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="p-2 grid grid-cols-3 gap-2 border-b border-white/5">
                        <button
                            onClick={() => { setMode('text'); setSelectedImage(null); setTranslatedText(''); }}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all ${mode === 'text' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            <ScanText size={16} />
                            <span>Text</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all ${mode === 'image' && !selectedImage ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            <ImageIcon size={16} />
                            <span>Image</span>
                        </button>
                        <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] transition-all hover:bg-white/5 text-gray-400"
                        >
                            <Camera size={16} />
                            <span>Camera</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-4">
                        {/* Hidden Inputs */}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        <input type="file" ref={cameraInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" className="hidden" />

                        {mode === 'image' && selectedImage && (
                            <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-40 bg-black/50">
                                <img src={selectedImage} alt="To translate" className="w-full h-full object-contain" />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {mode === 'text' && (
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Enter Arabic or English text..."
                                className={`w-full h-24 p-3 rounded-xl resize-none text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all ${styles.input}`}
                                dir="auto"
                            />
                        )}

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

                        {/* Result Area */}
                        {(translatedText || isTranslating) && (
                            <div className={`p-3 rounded-xl border border-white/5 text-sm min-h-[80px] ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Result</p>
                                {isTranslating ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-2 bg-gray-500/20 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-500/20 rounded w-1/2"></div>
                                    </div>
                                ) : (
                                    <p className={`whitespace-pre-wrap ${styles.textMain} leading-relaxed font-medium`}>{translatedText}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 ${isOpen
                    ? 'bg-red-500 text-white rotate-90 scale-90'
                    : styles.floatingBtn
                    }`}
            >
                {isOpen ? <X size={20} /> : <Languages size={22} />}
            </button>
        </div>
    );
};

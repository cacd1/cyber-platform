import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
import { useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ChatNote = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [note, setNote] = useState('');
    const [savedNotes, setSavedNotes] = useState([]);
    const fileInputRef = useRef(null);
    const { theme } = useTheme();

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleSave = (e) => {
        e.preventDefault();
        if (!note.trim()) return;

        const newNote = {
            id: Date.now(),
            text: note,
            type: 'text',
            timestamp: new Date().toLocaleTimeString(),
            isUser: true
        };

        setSavedNotes([...savedNotes, newNote]);
        setNote('');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            const newNote = {
                id: Date.now(),
                text: file.name, // Use text for filename/caption
                content: reader.result, // Base64
                type: type,
                mimeType: file.type,
                timestamp: new Date().toLocaleTimeString(),
                isUser: true
            };
            setSavedNotes([...savedNotes, newNote]);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset
    };

    // Theme-based styles
    const isDark = theme === 'dark' || theme === 'default'; // 'default' is cyber/dark

    const styles = {
        container: isDark
            ? 'bg-[#000000]/90 border-white/10 shadow-[0_0_40px_-5px_rgba(255,255,255,0.1)]'
            : 'bg-white/90 border-gray-200 shadow-xl',
        header: isDark
            ? 'bg-gradient-to-r from-gray-900 via-black to-gray-900 border-white/10'
            : 'bg-gradient-to-r from-gray-50 to-white border-gray-100',
        textMain: isDark ? 'text-white' : 'text-gray-800',
        textSub: isDark ? 'text-gray-400' : 'text-gray-500',
        iconBg: isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200',
        iconColor: isDark ? 'text-white' : 'text-gray-700',
        contentBg: isDark
            ? 'bg-[#050505]'
            : 'bg-gray-50',
        bubble: isDark
            ? 'bg-gray-900 border-white/10 text-gray-200'
            : 'bg-white border-gray-200 text-gray-700 shadow-sm',
        inputArea: isDark
            ? 'bg-black border-white/10'
            : 'bg-white border-gray-200',
        input: isDark
            ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-white/30'
            : 'bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:bg-white',
        submitBtn: isDark
            ? 'bg-white text-black hover:bg-gray-200'
            : 'bg-black text-white hover:bg-gray-800',
        floatingBtn: isDark
            ? 'bg-white hover:bg-gray-200 text-black shadow-white/10'
            : 'bg-black hover:bg-gray-800 text-white shadow-black/20'
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4 font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className={`w-80 backdrop-blur-xl border rounded-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ${styles.container}`}>
                    {/* Header */}
                    <div className={`p-4 border-b flex justify-between items-center ${styles.header}`}>
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${styles.iconBg}`}>
                                <Bot size={18} className={styles.iconColor} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm tracking-wide ${styles.textMain}`}>
                                    Ai HMF
                                </h3>
                                <p className={`text-[10px] ${styles.textSub}`}>اسأل الذكاء الاصطناعي</p>
                            </div>
                        </div>
                        <button onClick={toggleOpen} className={`p-1.5 rounded-full transition-colors ${styles.textSub} hover:bg-black/5`}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className={`h-72 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar ${styles.contentBg}`}>
                        {savedNotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${styles.iconBg}`}>
                                    <Sparkles className={styles.iconColor} size={20} />
                                </div>
                                <p className={`text-sm ${styles.textSub}`}>كيف يمكنني مساعدتك اليوم؟</p>
                            </div>
                        ) : (
                            savedNotes.map((n) => (
                                <div key={n.id} className="self-end max-w-[85%]">
                                    <div className={`p-3 rounded-2xl rounded-tr-sm border text-sm ${styles.bubble}`}>
                                        {n.type === 'image' ? (
                                            <div className="space-y-2">
                                                <img src={n.content} alt={n.text} className="rounded-lg max-h-48 object-cover border border-white/10" />
                                                <p className="text-xs opacity-80">{n.text}</p>
                                            </div>
                                        ) : n.type === 'file' ? (
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate font-medium">{n.text}</p>
                                                    <a href={n.content} download={n.text} className={`text-xs underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        تحميل
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>{n.text}</p>
                                        )}
                                    </div>
                                    <span className={`text-[10px] mt-1 block text-right pr-1 ${styles.textSub}`}>{n.timestamp}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSave} className={`p-3 border-t flex gap-2 backdrop-blur-md ${styles.inputArea}`}>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            dir="auto"
                            placeholder="اكتب سؤالك هنا..."
                            className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${styles.input}`}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center group ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <Paperclip size={18} />
                        </button>
                        <button
                            type="submit"
                            className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center group ${styles.submitBtn}`}
                        >
                            <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleOpen}
                className={`
                    w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border border-white/10
                    ${isOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-90 text-white shadow-lg'
                        : `${styles.floatingBtn} hover:scale-110 shadow-xl`
                    }
                `}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <Bot size={28} />
                )}
            </button>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, FileText, Youtube, Image, Link as LinkIcon, Video, X, GripVertical, Type } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { mockDb } from '../services/mockDb'; // Keep for subjects static data

// Helper to extract YouTube video ID from URL
const extractYoutubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

// Security: Allowed file types
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
];

export const LectureList = () => {
    const { subjectId } = useParams();
    const { hasAccessCode, activeRepId, user } = useAuth();
    const [lectures, setLectures] = useState([]);
    const [expandedLecture, setExpandedLecture] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLectureName, setNewLectureName] = useState('');
    const [youtubeInputs, setYoutubeInputs] = useState({});
    const [noteInputs, setNoteInputs] = useState({});

    const subject = mockDb.getSubjects().find(s => s.id === subjectId);

    // Determine who we're viewing content for:
    // - If Rep is logged in, use their ID (they only edit their own content)
    // - If Student has access code, use the rep ID from their code
    const effectiveRepId = user ? user.id : activeRepId;

    // Rep can edit when logged in
    const canEdit = !!user;

    useEffect(() => {
        const fetchLectures = async () => {
            if (effectiveRepId) {
                try {
                    const data = await dbService.getLectures(subjectId, effectiveRepId);
                    setLectures(data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
                } catch (error) {
                    console.error("Failed to fetch lectures", error);
                }
            }
        };
        fetchLectures();
    }, [subjectId, effectiveRepId]);

    const handleAddLecture = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        if (!newLectureName.trim()) return;

        try {
            const newLec = await dbService.addLecture({
                subjectId,
                createdBy: user.id,
                name: newLectureName,
                content: { items: [] }
            });

            setLectures([...lectures, newLec]);
            setNewLectureName('');
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add lecture", error);
            alert("حدث خطأ أثناء إضافة المحاضرة");
        }
    };

    const handleDeleteLecture = async (id) => {
        if (!canEdit) return;
        if (window.confirm('هل تريد حذف هذه المحاضرة؟')) {
            try {
                await dbService.deleteLecture(id);
                setLectures(lectures.filter(l => l.id !== id));
            } catch (error) {
                console.error("Failed to delete lecture", error);
            }
        }
    };

    const handleFileUpload = async (lectureId, files) => {
        if (!canEdit) return;
        const lecture = lectures.find(l => l.id === lectureId);
        if (!lecture) return;

        const processFile = async (file) => {
            // Security: Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert(`نوع الملف غير مدعوم: ${file.name}`);
                return null;
            }

            try {
                // Convert to Base64 (stored directly in Firestore)
                const base64Url = await dbService.fileToBase64(file);

                let type = 'file';
                if (file.type.startsWith('image/')) type = 'image';
                else if (file.type === 'application/pdf') type = 'pdf';

                return {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    type,
                    name: file.name,
                    url: base64Url, // Base64 data URL
                    mimeType: file.type,
                    addedAt: new Date().toISOString()
                };
            } catch (error) {
                console.error("Upload failed for file:", file.name, error);
                return null;
            }
        };

        const newItems = await Promise.all(files.map(processFile));
        const validItems = newItems.filter(item => item !== null);

        if (validItems.length === 0) return;

        try {
            const currentItems = lecture.content.items || [];
            const updatedContent = {
                ...lecture.content,
                items: [...currentItems, ...validItems]
            };

            await dbService.updateLecture(lectureId, { content: updatedContent });
            setLectures(lectures.map(l => l.id === lectureId ? { ...l, content: updatedContent } : l));
        } catch (error) {
            console.error("Failed to update lecture content", error);
        }
    };


    const handleAddYoutube = async (lectureId) => {
        if (!canEdit) return;
        const url = youtubeInputs[lectureId];
        if (!url) return;

        const videoId = extractYoutubeId(url);
        if (!videoId) {
            alert('رابط يوتيوب غير صالح.');
            return;
        }

        const lecture = lectures.find(l => l.id === lectureId);
        if (!lecture) return;

        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: 'youtube',
            videoId,
            url,
            addedAt: new Date().toISOString()
        };

        try {
            const currentItems = lecture.content.items || [];
            const updatedContent = {
                ...lecture.content,
                items: [...currentItems, newItem]
            };

            await dbService.updateLecture(lectureId, { content: updatedContent });
            setLectures(lectures.map(l => l.id === lectureId ? { ...l, content: updatedContent } : l));
            setYoutubeInputs({ ...youtubeInputs, [lectureId]: '' });
        } catch (error) {
            console.error("Failed to add YouTube video", error);
        }
    };

    const handleAddNote = async (lectureId) => {
        if (!canEdit) return;
        const text = noteInputs[lectureId];
        if (!text || !text.trim()) return;

        const lecture = lectures.find(l => l.id === lectureId);
        if (!lecture) return;

        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: 'note',
            text: text.trim(),
            addedAt: new Date().toISOString()
        };

        try {
            const currentItems = lecture.content.items || [];
            const updatedContent = {
                ...lecture.content,
                items: [...currentItems, newItem]
            };

            await dbService.updateLecture(lectureId, { content: updatedContent });
            setLectures(lectures.map(l => l.id === lectureId ? { ...l, content: updatedContent } : l));
            setNoteInputs({ ...noteInputs, [lectureId]: '' });
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    const handleRemoveItem = async (lectureId, itemId) => {
        if (!canEdit) return;
        const lecture = lectures.find(l => l.id === lectureId);
        if (!lecture) return;

        const currentItems = lecture.content.items || [];
        const itemToRemove = currentItems.find(item => item.id === itemId);
        const updatedItems = currentItems.filter(item => item.id !== itemId);

        const updatedContent = { ...lecture.content, items: updatedItems };

        try {
            // Delete file from storage if applicable
            if (itemToRemove && itemToRemove.storagePath) {
                await dbService.deleteFile(itemToRemove.storagePath);
            }

            await dbService.updateLecture(lectureId, { content: updatedContent });
            setLectures(lectures.map(l => l.id === lectureId ? { ...l, content: updatedContent } : l));
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleReorder = async (lectureId, newOrder) => {
        if (!canEdit) return;
        const lecture = lectures.find(l => l.id === lectureId);
        if (!lecture) return;

        // Optimistic update
        const updatedContent = { ...lecture.content, items: newOrder };

        // Update local state immediately for smooth drag
        setLectures(lectures.map(l => l.id === lectureId ? { ...l, content: updatedContent } : l));

        try {
            await dbService.updateLecture(lectureId, { content: updatedContent });
        } catch (error) {
            console.error("Failed to reorder items", error);
        }
    };

    if (!hasAccessCode && !user) return <Navigate to="/" replace />;
    if (!effectiveRepId) return <Navigate to="/" replace />;
    if (!subject) return <Navigate to="/course1" replace />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-cyber text-white">{subject.name}</h1>
                    <p className="text-gray-400">{subject.nameEn}</p>
                </div>
                {canEdit && (
                    <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={18} /> Add Lecture
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {lectures.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-gray-400">No lectures found for this subject.</p>
                        {canEdit && <Button variant="ghost" className="mt-2 text-cyber" onClick={() => setIsAddModalOpen(true)}>Create the first one</Button>}
                    </div>
                ) : (
                    lectures.map(lecture => (
                        <Card key={lecture.id} className="p-0 overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
                                onClick={() => setExpandedLecture(expandedLecture === lecture.id ? null : lecture.id)}
                            >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {lecture.name}
                                </h3>
                                <div className="flex items-center gap-3">
                                    {canEdit && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLecture(lecture.id); }} className="text-gray-500 hover:text-red-500 p-1">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    <div className="text-cyber">
                                        {expandedLecture === lecture.id ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedLecture === lecture.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden bg-black/10"
                                    >
                                        <div className="p-4 border-t border-white/5">
                                            {/* Unified Content List with Reorder */}
                                            {lecture.content?.items && lecture.content.items.length > 0 ? (
                                                <Reorder.Group
                                                    axis="y"
                                                    values={lecture.content.items}
                                                    onReorder={(newOrder) => handleReorder(lecture.id, newOrder)}
                                                    className="space-y-4 mb-6"
                                                >
                                                    {lecture.content.items.map((item) => (
                                                        <Reorder.Item
                                                            key={item.id}
                                                            value={item}
                                                            drag={canEdit ? "y" : false}
                                                            className="relative"
                                                        >
                                                            {/* Render Content Based on Type */}
                                                            {item.type === 'pdf' || item.type === 'file' ? (
                                                                <div className="flex flex-col gap-2 p-6 bg-gradient-to-r from-cyber/10 to-cyber/5 border border-cyber/20 rounded-2xl group hover:border-cyber/40 transition-all cursor-default">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                            {canEdit && (
                                                                                <div className="text-gray-500 cursor-grab active:cursor-grabbing p-1">
                                                                                    <GripVertical size={24} />
                                                                                </div>
                                                                            )}
                                                                            <div className="p-3 bg-cyber/20 rounded-xl">
                                                                                <FileText size={32} className="text-cyber" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-white text-lg font-bold truncate">{item.name}</p>
                                                                                <p className="text-gray-400 text-sm">PDF / Document</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <a
                                                                                href={item.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-3 bg-cyber/20 hover:bg-cyber/30 text-cyber rounded-xl transition-colors"
                                                                                title="فتح الملف"
                                                                            >
                                                                                <FileText size={20} />
                                                                            </a>
                                                                            <a
                                                                                href={item.url}
                                                                                download={item.name}
                                                                                className="p-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors"
                                                                                title="تحميل الملف"
                                                                            >
                                                                                <ChevronDown size={20} className="rotate-180? no" />
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                                            </a>
                                                                            {canEdit && (
                                                                                <button
                                                                                    onPointerDown={(e) => e.stopPropagation()}
                                                                                    onClick={() => handleRemoveItem(lecture.id, item.id)}
                                                                                    className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
                                                                                    title="حذف"
                                                                                >
                                                                                    <X size={20} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : item.type === 'note' ? (
                                                                <div className="relative group p-6 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all cursor-default">
                                                                    <div className="flex items-start gap-4">
                                                                        {canEdit && (
                                                                            <div className="text-gray-500 cursor-grab active:cursor-grabbing p-1 mt-1">
                                                                                <GripVertical size={24} />
                                                                            </div>
                                                                        )}
                                                                        <div className="p-3 bg-blue-500/20 rounded-xl h-fit">
                                                                            <Type size={32} className="text-blue-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 pt-1">
                                                                            <p className="text-white text-lg whitespace-pre-wrap leading-relaxed">{item.text}</p>
                                                                            <p className="text-gray-400 text-xs mt-2">ملاحظة</p>
                                                                        </div>
                                                                        {canEdit && (
                                                                            <button
                                                                                onPointerDown={(e) => e.stopPropagation()}
                                                                                onClick={() => handleRemoveItem(lecture.id, item.id)}
                                                                                className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                                                                title="حذف"
                                                                            >
                                                                                <X size={20} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : item.type === 'image' ? (
                                                                <div className="relative group rounded-2xl overflow-hidden border border-green-500/20 bg-black/40">
                                                                    <div className="absolute top-2 left-2 z-10">
                                                                        {canEdit && (
                                                                            <div className="text-white/70 bg-black/50 rounded p-1 cursor-grab active:cursor-grabbing hover:bg-black/80">
                                                                                <GripVertical size={20} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <img
                                                                            src={item.url}
                                                                            alt={item.name}
                                                                            className="w-full h-auto max-h-[500px] object-cover"
                                                                        />
                                                                    </div>

                                                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <a
                                                                            href={item.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm"
                                                                        >
                                                                            <FileText size={16} />
                                                                        </a>
                                                                        {canEdit && (
                                                                            <button
                                                                                onPointerDown={(e) => e.stopPropagation()}
                                                                                onClick={() => handleRemoveItem(lecture.id, item.id)}
                                                                                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm"
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : item.type === 'youtube' ? (
                                                                <div className="relative group p-4 bg-black/40 rounded-xl border border-red-500/10 flex flex-col items-center">
                                                                    <div className="absolute top-2 left-2 z-10">
                                                                        {canEdit && (
                                                                            <div className="text-white/50 bg-black/40 rounded p-1 cursor-grab active:cursor-grabbing hover:bg-red-500/20 hover:text-white transition-colors">
                                                                                <GripVertical size={20} />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Neater, smaller video container */}
                                                                    <div className="w-full max-w-[450px] aspect-video rounded-lg overflow-hidden border border-white/10 shadow-lg relative bg-black">
                                                                        <iframe
                                                                            src={`https://www.youtube.com/embed/${item.videoId}`}
                                                                            className="w-full h-full pointer-events-none"
                                                                            title="YouTube video"
                                                                            allowFullScreen
                                                                        />
                                                                        <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-red-500/30 transition-all rounded-lg" />
                                                                    </div>


                                                                    {canEdit && (
                                                                        <button
                                                                            onPointerDown={(e) => e.stopPropagation()}
                                                                            onClick={() => handleRemoveItem(lecture.id, item.id)}
                                                                            className="absolute top-2 right-2 z-20 p-2 bg-red-500/10 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </Reorder.Item>
                                                    ))}
                                                </Reorder.Group>
                                            ) : null}

                                            {/* منطقة إضافة المحتوى للمندوب */}
                                            {canEdit && (
                                                <div className="space-y-4 mt-4">
                                                    {/* منطقة سحب وإفلات الملفات */}
                                                    {/* منطقة سحب وإفلات الملفات - Manual Upload Flow */}
                                                    {/* منطقة سحب وإفلات الملفات - Direct Upload */}
                                                    <div className="border-2 border-dashed border-cyber/40 rounded-lg p-6 hover:border-cyber hover:bg-cyber/5 transition-all text-center"
                                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-cyber', 'bg-cyber/10'); }}
                                                        onDragLeave={(e) => { e.currentTarget.classList.remove('border-cyber', 'bg-cyber/10'); }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.currentTarget.classList.remove('border-cyber', 'bg-cyber/10');
                                                            const files = Array.from(e.dataTransfer.files);
                                                            handleFileUpload(lecture.id, files);
                                                        }}
                                                    >
                                                        <div className="cursor-pointer" onClick={() => document.getElementById(`file-input-${lecture.id}`).click()}>
                                                            <FileText size={32} className="mx-auto mb-2 text-cyber/60" />
                                                            <p className="text-cyber font-bold mb-1">اسحب الملفات هنا</p>
                                                            <p className="text-gray-400 text-sm">أو انقر لاختيار ملف</p>
                                                            <p className="text-gray-500 text-xs mt-2">PDF, DOC, Images</p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            id={`file-input-${lecture.id}`}
                                                            className="hidden"
                                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                                            multiple
                                                            onChange={(e) => {
                                                                const files = Array.from(e.target.files);
                                                                handleFileUpload(lecture.id, files);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                    </div>

                                                    {/* مربع إضافة رابط يوتيوب */}
                                                    <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Youtube size={20} className="text-red-500" />
                                                            <span className="text-red-400 font-bold">إضافة مقطع يوتيوب</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    placeholder="الصق رابط يوتيوب هنا..."
                                                                    className="flex-1 bg-black/20 border-red-500/30 focus:border-red-500 text-sm"
                                                                    dir="ltr"
                                                                    value={youtubeInputs[lecture.id] || ''}
                                                                    onChange={(e) => setYoutubeInputs({ ...youtubeInputs, [lecture.id]: e.target.value })}
                                                                />
                                                                <Button
                                                                    variant="secondary"
                                                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                                                                    onClick={() => handleAddYoutube(lecture.id)}
                                                                >
                                                                    إضافة
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-500 text-xs mt-2">مثال: https://www.youtube.com/watch?v=xxxxx</p>
                                                    </div>

                                                    {/* مربع إضافة ملاحظات نصية */}
                                                    <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Type size={20} className="text-blue-400" />
                                                            <span className="text-blue-400 font-bold">إضافة ملاحظة نصية</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <textarea
                                                                placeholder="اكتب الملاحظة هنا..."
                                                                className="flex-1 bg-black/20 border border-blue-500/30 focus:border-blue-500 rounded-md p-2 text-white text-sm min-h-[80px] resize-y"
                                                                value={noteInputs[lecture.id] || ''}
                                                                onChange={(e) => setNoteInputs({ ...noteInputs, [lecture.id]: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end mt-2">
                                                            <Button
                                                                variant="secondary"
                                                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                                                                onClick={() => handleAddNote(lecture.id)}
                                                            >
                                                                إضافة الملاحظة
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* End of Upload Section */}
                                                </div>
                                            )}

                                            {!canEdit && !lecture.content?.items?.length && (
                                                <p className="text-gray-400 text-sm">لا يوجد محتوى متاح حالياً.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Lecture">
                <form onSubmit={handleAddLecture}>
                    <Input
                        placeholder="Lecture Name (e.g. Lecture 1)"
                        value={newLectureName}
                        onChange={(e) => setNewLectureName(e.target.value)}
                        className="mb-4"
                    />
                    <Button type="submit" className="w-full">Create Lecture</Button>
                </form>
            </Modal>
        </div>
    );
};

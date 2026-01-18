import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where
} from 'firebase/firestore';

// Cloudinary Configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const dbService = {
    // Lectures
    getLectures: async (subjectId, repId) => {
        try {
            const q = query(
                collection(db, 'lectures'),
                where('subjectId', '==', subjectId),
                where('createdBy', '==', repId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching lectures:", error);
            throw error;
        }
    },

    getAllLecturesForRep: async (repId) => {
        try {
            const q = query(
                collection(db, 'lectures'),
                where('createdBy', '==', repId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching all lectures for rep:", error);
            return [];
        }
    },

    addLecture: async (lectureData) => {
        try {
            const docRef = await addDoc(collection(db, 'lectures'), {
                ...lectureData,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, ...lectureData };
        } catch (error) {
            console.error("Error adding lecture:", error);
            throw error;
        }
    },

    updateLecture: async (id, updates) => {
        try {
            const lectureRef = doc(db, 'lectures', id);
            await updateDoc(lectureRef, updates);
            return { id, ...updates };
        } catch (error) {
            console.error("Error updating lecture:", error);
            throw error;
        }
    },

    deleteLecture: async (id) => {
        try {
            await deleteDoc(doc(db, 'lectures', id));
        } catch (error) {
            console.error("Error deleting lecture:", error);
            throw error;
        }
    },

    // Announcements
    getAnnouncements: async () => {
        try {
            const q = query(
                collection(db, 'announcements')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching announcements:", error);
            return [];
        }
    },

    addAnnouncement: async (text, createdBy) => {
        try {
            const docRef = await addDoc(collection(db, 'announcements'), {
                text,
                createdBy,
                createdAt: new Date().toISOString()
            });
            return { id: docRef.id, text, createdBy, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error("Error adding announcement:", error);
            throw error;
        }
    },

    deleteAnnouncement: async (id) => {
        try {
            await deleteDoc(doc(db, 'announcements', id));
        } catch (error) {
            console.error("Error deleting announcement:", error);
            throw error;
        }
    },

    updateAnnouncement: async (id, text) => {
        try {
            const docRef = doc(db, 'announcements', id);
            await updateDoc(docRef, { text });
        } catch (error) {
            console.error("Error updating announcement:", error);
            throw error;
        }
    },

    // Cloudinary Upload
    uploadFile: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.text();
                console.error("Cloudinary error:", errData);
                throw new Error('Upload failed: ' + response.statusText);
            }

            const data = await response.json();

            return {
                url: data.secure_url,
                storagePath: data.public_id // Used for deletion reference
            };
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    },

    deleteFile: async (publicId) => {
        if (!publicId) return;
        // Client-side unsigned deletion is not supported for security.
        // Files will remain but link will be removed from DB.
        console.log("File deletion skipped (Requires signed API for Cloudinary)");
    }
};

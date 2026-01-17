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

    // Convert file to Base64 (for Firestore storage)
    fileToBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

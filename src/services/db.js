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
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
                collection(db, 'announcements'),
                // Order by date desc? We can sort client side if needed or add orderBy
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

    // Storage Upload
    uploadFile: async (file, path) => {
        try {
            // Create a reference to 'images/mountains.jpg'
            const storageRef = ref(storage, path + '/' + Date.now() + '_' + file.name);

            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const url = await getDownloadURL(snapshot.ref);

            return {
                url,
                storagePath: snapshot.ref.fullPath // Save this to delete later
            };
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    deleteFile: async (path) => {
        if (!path) return;
        try {
            const fileRef = ref(storage, path);
            await deleteObject(fileRef);
        } catch (error) {
            console.error("Error deleting file:", error);
            // Don't throw here, if file is missing just ignore
        }
    }
};

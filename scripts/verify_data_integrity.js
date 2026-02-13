import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
const envConfig = dotenv.parse(fs.readFileSync(path.resolve('.env.local')));

const firebaseConfig = {
    apiKey: envConfig.VITE_FIREBASE_API_KEY,
    authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envConfig.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkIntegrity() {
    console.log("--- INTEGRITY CHECK STARTED ---");

    try {
        console.log("Fetching ALL accessCodes...");
        const snap = await getDocs(collection(db, 'accessCodes'));
        snap.forEach(doc => {
            const data = doc.data();
            const code = data.code;
            console.log(`\nDocument ID: [${doc.id}]`);
            console.log(`Code Field:  [${code}]`);
            console.log(`Code Length: ${code.length}`);
            console.log(`Code Char Codes: ${code.split('').map(c => c.charCodeAt(0)).join(', ')}`);

            if (code === 'CLAS20261') {
                console.log("MATCH FOUND for CLAS20261");
            } else {
                console.log("NO MATCH for CLAS20261");
            }
        });

    } catch (error) {
        console.error("Integrity Check Failed:", error);
    }
    console.log("\n--- INTEGRITY CHECK COMPLETE ---");
    process.exit(0);
}

checkIntegrity();

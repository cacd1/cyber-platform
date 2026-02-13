import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";
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

async function verify() {
    console.log("--- VERIFICATION STARTED ---");
    const code = 'CLAS20261';

    try {
        console.log(`Querying 'accessCodes' for '${code}' with limit(1)...`);
        const q = query(collection(db, 'accessCodes'), where('code', '==', code), limit(1));
        const snap = await getDocs(q);

        if (snap.empty) {
            console.log("RESULT: Empty (Not Found)");
        } else {
            console.log("RESULT: Found!");
            snap.forEach(doc => {
                console.log(` - ID: ${doc.id}`);
                console.log(` - Data:`, doc.data());
            });
        }

    } catch (error) {
        console.error("RESULT: Error!", error.code, error.message);
    }

    try {
        console.log(`\nQuerying 'representatives' for '${code}' with limit(1)...`);
        const q2 = query(collection(db, 'representatives'), where('accessCode', '==', code), limit(1));
        const snap2 = await getDocs(q2);

        if (snap2.empty) {
            console.log("RESULT: Empty (Not Found)");
        } else {
            console.log("RESULT: Found!");
            snap2.forEach(doc => {
                console.log(` - ID: ${doc.id}`);
                console.log(` - Data:`, doc.data());
            });
        }
    } catch (error) {
        console.error("RESULT: Error!", error.code, error.message);
    }

    console.log("--- VERIFICATION COMPLETE ---");
    process.exit(0);
}

verify();

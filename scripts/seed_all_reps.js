import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
const auth = getAuth(app);

const REPS = [
    { id: 'rep_zaid_deaa', name: 'Zaid Deaa', email: 'ZaidDeaa@university.edu', password: '20052026OPHLNM12', code: 'CLAS20261' },
    { id: 'rep_mohammed_hassanein', name: 'Mohammed Hassanein', email: 'MohammedHassanein@university.edu', password: '20042025POCKMN32', code: 'CLAS20262' },
    { id: 'rep_ihsan_majid', name: 'Ihsan Majid', email: 'IhsanMajid@university.edu', password: '20032024KLEPNM52', code: 'CLAS20263' },
    { id: 'rep_ali_khalid', name: 'Ali Khalid', email: 'AliKhalid@university.edu', password: '20022023SAXZJQ06', code: 'CLAS20264' },
    { id: 'rep_mohammed_jaafar', name: 'Mohammed Jaafar', email: 'MohammedJaafar@university.edu', password: '20012022RTGZCV74', code: 'CLAS20265' },
    { id: 'rep_hassan_mohammed', name: 'Hassan Mohammed', email: 'HassanMohammed@university.edu', password: '20002021YUIAZT01', code: 'CLAS20266' }
];

async function seedAll() {
    console.log("--- SEEDING ALL 6 REPRESENTATIVES ---");

    for (const rep of REPS) {
        console.log(`\nProcessing: ${rep.name} (${rep.code})`);

        // 1. Seed Representatives collection
        try {
            await setDoc(doc(db, "representatives", rep.id), {
                name: rep.name,
                email: rep.email,
                accessCode: rep.code,
                stage: '4',
                createdAt: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                role: 'rep'
            }, { merge: true });
            console.log(`  ✓ Representatives/${rep.id} created/updated`);
        } catch (e) {
            console.error(`  ✗ Failed to write Representatives:`, e.message);
        }

        // 2. Seed AccessCodes collection
        try {
            await setDoc(doc(db, "accessCodes", `code_${rep.code}`), {
                code: rep.code,
                repId: rep.id,
                repName: rep.name,
                stage: '4',
                createdAt: new Date().toISOString()
            }, { merge: true });
            console.log(`  ✓ AccessCodes/code_${rep.code} created/updated`);
        } catch (e) {
            console.error(`  ✗ Failed to write AccessCodes:`, e.message);
        }
    }

    console.log("\n--- SEEDING COMPLETE ---");
    process.exit(0);
}

seedAll();

/**
 * Firestore Backup Script
 * Run: node scripts/backup.js
 * Saves all Firestore data to a JSON file in /backups folder
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config - using environment variables or direct config
const firebaseConfig = {
    projectId: 'cybersrcurity'
};

// Initialize Firebase Admin (no credentials needed for emulator/basic read)
let app;
try {
    // Try to use service account if available
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: firebaseConfig.projectId
        });
    } else {
        // Use default credentials (for Cloud environments)
        app = initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error('Firebase init error:', error.message);
    process.exit(1);
}

const db = getFirestore(app);

// Collections to backup
const COLLECTIONS = ['lectures', 'announcements'];

async function backupCollection(collectionName) {
    console.log(`📦 Backing up collection: ${collectionName}`);
    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach(doc => {
        data.push({
            id: doc.id,
            ...doc.data()
        });
    });

    console.log(`   ✓ Found ${data.length} documents`);
    return data;
}

async function runBackup() {
    console.log('🔄 Starting Firestore backup...');
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log('');

    const backup = {
        timestamp: new Date().toISOString(),
        projectId: firebaseConfig.projectId,
        collections: {}
    };

    for (const collection of COLLECTIONS) {
        try {
            backup.collections[collection] = await backupCollection(collection);
        } catch (error) {
            console.error(`❌ Error backing up ${collection}:`, error.message);
            backup.collections[collection] = { error: error.message };
        }
    }

    // Create backups directory if not exists
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Save backup file with timestamp
    const date = new Date().toISOString().split('T')[0];
    const filename = `backup-${date}.json`;
    const filepath = path.join(backupsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8');

    console.log('');
    console.log(`✅ Backup complete!`);
    console.log(`📁 Saved to: ${filepath}`);
    console.log(`📊 Total size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // Keep only last 10 backups
    const files = fs.readdirSync(backupsDir)
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length > 10) {
        const toDelete = files.slice(10);
        toDelete.forEach(f => {
            fs.unlinkSync(path.join(backupsDir, f));
            console.log(`🗑️ Deleted old backup: ${f}`);
        });
    }
}

runBackup().catch(console.error);

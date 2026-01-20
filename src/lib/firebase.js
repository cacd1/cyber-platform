import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize App Check
// Only if we have a site key, otherwise skip (to avoid breaking app before configuration)
if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.VITE_RECAPTCHA_SITE_KEY !== 'PLACEHOLDER_KEY_REPLACE_ME') {
    // Enable debug token for localhost
    if (location.hostname === "localhost") {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
    });
}


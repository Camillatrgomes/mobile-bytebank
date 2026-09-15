import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { DEV_HOST } from './devHost';

declare global {
  var __bytebankFirebaseEmulator: boolean | undefined;
}

// O Expo só injeta EXPO_PUBLIC_* acessadas literalmente como process.env.X.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence:
      Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(AsyncStorage),
  });
} catch {
  // initializeAuth lança no Fast Refresh; reaproveita a instância existente.
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export const isUsingEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === '1';

if (isUsingEmulator && !globalThis.__bytebankFirebaseEmulator) {
  globalThis.__bytebankFirebaseEmulator = true;

  connectAuthEmulator(auth, `http://${DEV_HOST}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, DEV_HOST, 8080);
  connectStorageEmulator(storage, DEV_HOST, 9199);
}

export { app, auth, db, storage };

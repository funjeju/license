import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

// 빌드 시 서버에서는 초기화하지 않음 (api key가 없음)
function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    // 서버에서는 빈 앱 반환하지 않고 getApps 체크
    return getApps().length ? getApp() : initializeApp(firebaseConfig, '[server-placeholder]');
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function ensureApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getClientAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getClientDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

export function getClientStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(ensureApp());
  return _storage;
}

// 하위 호환을 위한 named exports (클라이언트 컴포넌트에서만 사용)
export const auth = typeof window !== 'undefined' ? getClientAuth() : ({} as Auth);
export const db = typeof window !== 'undefined' ? getClientDb() : ({} as Firestore);
export const storage = typeof window !== 'undefined' ? getClientStorage() : ({} as FirebaseStorage);

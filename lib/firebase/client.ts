import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            'AIzaSyC4IUXbcn3cPnncMYru_LRXK_azj0B5ErY',
  authDomain:        'aiprompt-64ed8.firebaseapp.com',
  projectId:         'aiprompt-64ed8',
  storageBucket:     'aiprompt-64ed8.firebasestorage.app',
  messagingSenderId: '732218911152',
  appId:             '1:732218911152:web:5daef46b84e01db854ce75',
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

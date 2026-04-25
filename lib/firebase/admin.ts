import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const strip = (s: string | undefined) => s?.replace(/^﻿/, '').trim();

  const projectId   = strip(process.env.FIREBASE_ADMIN_PROJECT_ID   ?? process.env.FIREBASE_PROJECT_ID);
  const clientEmail = strip(process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? process.env.FIREBASE_CLIENT_EMAIL);
  const rawKey      = strip(process.env.FIREBASE_ADMIN_PRIVATE_KEY  ?? process.env.FIREBASE_PRIVATE_KEY);
  const privateKey  = rawKey?.replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   projectId!,
      clientEmail: clientEmail!,
      privateKey,
    }),
  });
}

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return (admin.auth(getAdminApp()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (admin.firestore(getAdminApp()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) {
    return (admin.storage(getAdminApp()) as unknown as Record<string | symbol, unknown>)[prop];
  },
});

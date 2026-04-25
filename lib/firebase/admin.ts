import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
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

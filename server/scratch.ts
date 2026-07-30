import { initializeApp, cert, getApps } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config();

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('SUCCESS: Firebase Admin initialized correctly with the provided credentials.');
} catch (error: any) {
  console.error('FAILED to initialize Firebase Admin:', error.message);
}

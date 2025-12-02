/**
 * Firebase Admin Configuration
 * Used for server-side Firebase operations (API routes, server components)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

// Initialize Firebase Admin (singleton pattern)
let adminApp: App
let adminAuth: Auth
let adminDb: Firestore
let adminStorage: Storage

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
} else {
  adminApp = getApps()[0]
}

// Initialize admin services
adminAuth = getAuth(adminApp)
adminDb = getFirestore(adminApp)
adminStorage = getStorage(adminApp)

export { adminApp, adminAuth, adminDb, adminStorage }
export default adminApp

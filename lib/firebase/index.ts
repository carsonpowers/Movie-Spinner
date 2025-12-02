/**
 * Firebase Integration Index
 * Centralized exports for all Firebase utilities
 */

// Client exports
export { app, auth, db, storage, analytics } from './client'

// Admin exports
export { adminApp, adminAuth, adminDb, adminStorage } from './admin'

// Auth helpers
export {
  signInWithGoogle,
  signInWithGoogleRedirect,
  signOut,
  getCurrentUser,
  onAuthChange,
  getIdToken,
} from './auth'

// Firestore helpers
export {
  getDocument,
  getDocuments,
  getUserMovies,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  addMovie,
  deleteMovie,
  where,
  orderBy,
  limit,
  Timestamp,
  type Movie,
} from './firestore'

// Storage helpers
export {
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  listFiles,
  uploadMoviePoster,
  deleteMoviePoster,
} from './storage'

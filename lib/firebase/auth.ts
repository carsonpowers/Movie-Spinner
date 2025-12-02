/**
 * Firebase Authentication Helpers
 * Utilities for handling auth operations
 */

import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from './client'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

/**
 * Sign in with Google using redirect (better for mobile)
 */
export function signInWithGoogleRedirect() {
  return signInWithRedirect(auth, googleProvider)
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get ID token for current user
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser()
  if (!user) return null
  
  try {
    return await user.getIdToken(forceRefresh)
  } catch (error) {
    console.error('Error getting ID token:', error)
    return null
  }
}

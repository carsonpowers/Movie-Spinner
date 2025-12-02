/**
 * Firestore Database Helpers
 * Utilities for CRUD operations on Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  Timestamp,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore'
import { db } from './client'

/**
 * Movie type definition
 */
export interface Movie {
  id?: string
  userId: string
  title: string
  poster?: string
  imdbId?: string
  year?: string
  genre?: string
  rating?: string
  createdAt?: number | Timestamp
  updatedAt?: number | Timestamp
  addedAt?: string
  watched?: boolean
}

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T
    }
    return null
  } catch (error) {
    console.error(`Error getting document ${docId}:`, error)
    throw error
  }
}

/**
 * Get all documents from a collection with optional filters
 */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...constraints)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to milliseconds
      createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toMillis?.() || doc.data().updatedAt,
    })) as T[]
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Get movies for a specific user
 */
export async function getUserMovies(userId: string): Promise<Movie[]> {
  try {
    // Get user's movie references from subcollection
    const userMoviesRef = collection(db, 'users', userId, 'movies')
    const userMoviesSnap = await getDocs(userMoviesRef)
    
    if (userMoviesSnap.empty) {
      return []
    }

    // Get the actual movie data from the movies collection
    const moviePromises = userMoviesSnap.docs.map(async (userMovieDoc) => {
      const movieId = userMovieDoc.id
      const userMovieData = userMovieDoc.data()
      const addedAt = userMovieData.addedAt
      const watched = userMovieData.watched || false
      
      const movieDoc = await getDoc(doc(db, 'movies', movieId))
      if (movieDoc.exists()) {
        const movieData = movieDoc.data()
        return {
          id: movieDoc.id,
          userId,
          title: movieData.title || '',
          poster: movieData.poster,
          imdbId: movieData.imdbID || movieId,
          year: movieData.year,
          genre: movieData.genre,
          rating: movieData.rating,
          createdAt: movieData.createdAt,
          updatedAt: movieData.updatedAt,
          addedAt,
          watched,
        } as Movie
      }
      return null
    })

    const movies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[]
    
    // Sort by addedAt (newest first)
    return movies.sort((a, b) => {
      const aTime = new Date(a.addedAt || 0).getTime()
      const bTime = new Date(b.addedAt || 0).getTime()
      return bTime - aTime
    })
  } catch (error) {
    console.error('Error getting user movies:', error)
    throw error
  }
}

/**
 * Add a new document to a collection
 */
export async function addDocument<T = DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName)
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error)
    throw error
  }
}

/**
 * Set a document with a specific ID (overwrites if exists)
 */
export async function setDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  data: T,
  merge = false
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId)
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    }, { merge })
  } catch (error) {
    console.error(`Error setting document ${docId}:`, error)
    throw error
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error(`Error updating document ${docId}:`, error)
    throw error
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Error deleting document ${docId}:`, error)
    throw error
  }
}

/**
 * Add a movie for a user
 */
export async function addMovie(userId: string, movieData: Omit<Movie, 'id' | 'userId'>): Promise<string> {
  return addDocument<Movie>('movies', {
    ...movieData,
    userId,
  } as Movie)
}

/**
 * Delete a movie
 */
export async function deleteMovie(movieId: string): Promise<void> {
  return deleteDocument('movies', movieId)
}

// Export Firestore utilities for advanced queries
export { where, orderBy, limit, Timestamp }

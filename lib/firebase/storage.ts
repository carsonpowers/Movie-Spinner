/**
 * Firebase Storage Helpers
 * Utilities for uploading and managing files in Firebase Storage
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadResult,
  UploadTask,
} from 'firebase/storage'
import { storage } from './client'

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: Record<string, any>
): Promise<UploadResult> {
  try {
    const storageRef = ref(storage, path)
    const result = await uploadBytes(storageRef, file, metadata)
    return result
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error)
    throw error
  }
}

/**
 * Upload a file with progress tracking
 */
export function uploadFileWithProgress(
  path: string,
  file: File | Blob,
  onProgress?: (progress: number) => void,
  metadata?: Record<string, any>
): UploadTask {
  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file, metadata)

  if (onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      onProgress(progress)
    })
  }

  return uploadTask
}

/**
 * Get download URL for a file
 */
export async function getFileURL(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const url = await getDownloadURL(storageRef)
    return url
  } catch (error) {
    console.error(`Error getting download URL for ${path}:`, error)
    throw error
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error)
    throw error
  }
}

/**
 * List all files in a directory
 */
export async function listFiles(path: string): Promise<string[]> {
  try {
    const storageRef = ref(storage, path)
    const result = await listAll(storageRef)
    const urls = await Promise.all(
      result.items.map(item => getDownloadURL(item))
    )
    return urls
  } catch (error) {
    console.error(`Error listing files in ${path}:`, error)
    throw error
  }
}

/**
 * Upload movie poster
 */
export async function uploadMoviePoster(
  userId: string,
  movieId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `posters/${userId}/${movieId}/${file.name}`
  
  if (onProgress) {
    const uploadTask = uploadFileWithProgress(path, file, onProgress)
    await uploadTask
  } else {
    await uploadFile(path, file)
  }
  
  return getFileURL(path)
}

/**
 * Delete movie poster
 */
export async function deleteMoviePoster(
  userId: string,
  movieId: string,
  fileName: string
): Promise<void> {
  const path = `posters/${userId}/${movieId}/${fileName}`
  return deleteFile(path)
}

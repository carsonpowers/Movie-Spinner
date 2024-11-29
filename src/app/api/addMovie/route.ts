import { NextResponse } from "next/server";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore(
  initializeApp({
    apiKey: 'AIzaSyB0rF3EY3uk-cspgx6VtGFlegq7Uxm6AKw',
    authDomain: 'movie-spinner-4a579.firebaseapp.com',
    projectId: 'movie-spinner-4a579',
    storageBucket: 'movie-spinner-4a579.appspot.com',
    messagingSenderId: '288775417657',
    appId: '1:288775417657:web:dd6a0ae5cd44f0748b82e8',
  })
);

export async function POST(request) {
  const { movie, docId } = await request.json();
  if (!docId) {
    return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
  }
  try {
    await setDoc(doc(db, 'movies', docId), movie);
    return NextResponse.json({ message: 'Movie added successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error adding movie' }, { status: 500 });
  }
}
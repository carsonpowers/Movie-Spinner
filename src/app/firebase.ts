import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const config = {
  apiKey: 'AIzaSyB0rF3EY3uk-cspgx6VtGFlegq7Uxm6AKw',
  authDomain: 'movie-spinner-4a579.firebaseapp.com',
  databaseURL:
    'https://movie-spinner-4a579-default-rtdb.us-central1.firebasedatabase.app/',
  projectId: 'movie-spinner-4a579',
  storageBucket: 'movie-spinner-4a579.appspot.com',
}

// Initialize Firebase
const app = initializeApp(config);


// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);


export default database

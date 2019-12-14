import firebase from 'firebase/app'
import 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCByjUJBWc-gL1hb8EXzeb6w_ivLU0yGrc",
    authDomain: "startrek-27b68.firebaseapp.com",
    databaseURL: "https://startrek-27b68.firebaseio.com",
    projectId: "startrek-27b68",
    storageBucket: "startrek-27b68.appspot.com",
    messagingSenderId: "929470633160",
    appId: "1:929470633160:web:63da4608305d9daf06c1fd"
  };
  // Initialize Firebase
export const db = firebase.initializeApp(firebaseConfig).firestore();
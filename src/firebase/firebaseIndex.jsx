import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/app'
var firebaseConfig = {
    apiKey: "AIzaSyC1lbVtL3WUldmCc9djkM4JV-fRAhSckgE",
    authDomain: "blackjack-0627.firebaseapp.com",
    databaseURL: process.env.REACT_APP_BASEURL,
    projectId: "blackjack-0627",
    storageBucket: "blackjack-0627.appspot.com",
    messagingSenderId: "323281608682",
    appId: "1:323281608682:web:dc7c4ff699daed9b1b9c93",
    measurementId: "G-76KN9CN7HB"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  firebase.auth();
  export default {
    firebaseConfig, 
  }
